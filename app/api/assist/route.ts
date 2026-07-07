import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';

export const maxDuration = 30;

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a fast, in-the-moment conversation copilot. The user is IN a live conversation right now and needs a quick read and a move, fast. Be brief and immediately usable. No preamble.

Respond with ONLY valid JSON in exactly this shape:
{
  "read": "<one short sentence: what they're really doing or what just happened>",
  "moves": ["<a specific thing the user could say or do, ready to use>", "<a second option>", "<a third option>"],
  "watchOut": "<one short sentence: the trap to avoid right now>"
}

Rules:
- moves: 2-3 items, each short enough to act on in the moment.
- Plain, direct language. This is being read mid-conversation, so every word counts.`;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const theySaid = String(body?.theySaid || '').trim();
    const context = String(body?.context || '').trim();
    const goal = String(body?.goal || '').trim();
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    if (!theySaid) {
      return NextResponse.json({ error: 'Type what they just said and I\'ll give you a move.' }, { status: 400 });
    }

    let personBlock = '';
    if (personId) {
      const person = await getPersonContext(userId, personId);
      if (person) personBlock = `\nWho you're talking to (${person.name}): ${person.summary}`;
    }

    const userMsg = `They just said: "${theySaid}"${context ? `\nContext: ${context}` : ''}${goal ? `\nWhat you want: ${goal}` : ''}${personBlock}`;

    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        // A fast model, since this is used live and speed matters most.
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[assist] LLM error', res.status);
      return apiError('Could not get a read. Try again.', 502);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      return apiError('Could not get a read. Try again.', 502);
    }

    return NextResponse.json({ result });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[assist]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
