import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export const maxDuration = 30;

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a calm, grounded performance coach. The user has a nerve-wracking conversation coming up in a few minutes. Help them settle their nerves and walk in composed and confident. This is about STATE, not tactics.

Respond with ONLY valid JSON in exactly this shape:
{
  "reframe": "<2-3 sentences that reframe the situation so it feels smaller and more winnable, and reminds them of their footing>",
  "grounding": "<one short, concrete grounding action to do in the next 60 seconds, e.g. a specific breath pattern>",
  "powerAnchor": "<one sentence reminding them of a real source of their leverage or worth in this specific situation>",
  "mantra": "<a short, punchy line to repeat to themselves as they walk in>"
}

Warm, steady, human. No jargon, no hype, no toxic positivity. Speak like a coach who has your back.`;

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const situation = String(body?.situation || '').trim();
    const goal = String(body?.goal || '').trim();
    const counterpart = String(body?.counterpart || '').trim();

    if (!situation) {
      return NextResponse.json({ error: 'Tell me the situation first.' }, { status: 400 });
    }

    const userMsg = `Coming up: a conversation with ${counterpart || 'someone'}.\nSituation: ${situation}\nWhat they want: ${goal || 'a good outcome'}\nThey are nervous. Help them get in a calm, confident state.`;

    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 700,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[primer] LLM error', res.status);
      return apiError('Could not build your primer. Try again.', 502);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      return apiError('Could not build your primer. Try again.', 502);
    }

    return NextResponse.json({ result });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[primer]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
