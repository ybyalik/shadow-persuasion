import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { searchKnowledge } from '@/lib/rag';

export const maxDuration = 60;

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OR_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
  'X-Title': 'Shadow Persuasion',
};

async function extractTextFromImage(base64Image: string): Promise<string> {
  const res = await fetch(OR_URL, {
    method: 'POST',
    headers: OR_HEADERS,
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this screenshot of a message or conversation. Preserve who said what. Return only the text.',
            },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 1500,
    }),
  });
  if (!res.ok) throw new Error('vision extract failed');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

const DEFENSE_SYSTEM_PROMPT = `You are a protective communication coach. The user is showing you a message, email, or conversation that was sent TO THEM by someone else. Your job is to protect the user: spot any manipulation, pressure, or influence tactics being used ON them, explain it in plain everyday language, and give them a calm, clear way to respond.

Be honest and proportionate. If the message is genuinely normal and not manipulative, say so plainly and set overallRisk low. Do not invent manipulation that isn't there.

Address the user as "you". Refer to the sender as "they".

Respond with ONLY valid JSON in exactly this shape:
{
  "overallRisk": <integer 0-10, how manipulative/pressuring the message is; 0 = totally clean>,
  "summary": "<one or two plain-English sentences: what they're really doing, or 'This looks like a normal message' if clean>",
  "tactics": [
    {
      "name": "<short name of the tactic, e.g. 'Guilt trip', 'False urgency', 'Foot in the door'>",
      "whatTheyreDoing": "<plain-English: the specific thing in their message that is this tactic>",
      "whyItWorks": "<plain-English: why this tactic tends to work on people>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "redFlags": ["<short phrase>", "..."],
  "suggestedResponse": "<a calm, self-respecting reply the user could send that holds their ground without escalating. Written in first person, ready to copy.>"
}

Rules:
- tactics: [] and redFlags: [] when the message is clean.
- Keep every explanation jargon-free and short.
- suggestedResponse must be something a reasonable person would actually send.`;

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    let text: string = typeof body?.text === 'string' ? body.text.trim() : '';
    const image: string | undefined =
      typeof body?.image === 'string' && body.image.startsWith('data:') ? body.image : undefined;

    if (!text && image) {
      try {
        text = (await extractTextFromImage(image)).trim();
      } catch (e) {
        console.error('[defense] vision extract failed', e);
        return apiError('We could not read that screenshot. Try pasting the text instead.', 502);
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Paste the message you received (or upload a screenshot) so I can check it.' },
        { status: 400 }
      );
    }
    if (text.length > 8000) text = text.slice(0, 8000);

    // Ground the analysis in the book's defense/manipulation-detection material.
    let context = '';
    try {
      context = await searchKnowledge(
        'manipulation tactics detection defense guilt pressure influence resistance boundaries'
      );
    } catch {
      context = '';
    }

    const userContent = context
      ? `Reference material on manipulation defense (use it to inform your read, don't quote it):\n${context}\n\n---\nMessage the user received:\n"""\n${text}\n"""`
      : `Message the user received:\n"""\n${text}\n"""`;

    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: OR_HEADERS,
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: DEFENSE_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[defense] LLM error', res.status);
      return apiError('The analysis service is busy. Please try again in a moment.', 502);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      console.error('[defense] JSON parse failed');
      return apiError('We had trouble reading that one. Please try again.', 502);
    }

    return NextResponse.json({ result, analyzedText: text });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[defense]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
