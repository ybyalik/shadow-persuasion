import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { searchKnowledge } from '@/lib/rag';
import { getPersonContext } from '@/lib/person-context';

export const maxDuration = 60;

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a strategic conversation coach preparing the user for a specific, real, high-stakes conversation that is coming up. Give them a focused game plan and a short "walk-in card" they can glance at 60 seconds before.

Be concrete and grounded in THEIR situation. No generic filler.

Respond with ONLY valid JSON in exactly this shape:
{
  "readTheRoom": "<2-3 plain sentences: what's really going on here, what the other person likely wants and fears>",
  "theirLikelyMoves": [
    { "move": "<an objection or tactic they'll probably use>", "counter": "<how the user handles it, in plain words>" }
  ],
  "yourThreeTactics": [
    { "name": "<tactic name>", "how": "<exactly how to use it in THIS conversation>" }
  ],
  "openingLine": "<a strong first line the user can actually say, word for word>",
  "walkInCard": {
    "opener": "<the one opening line to remember>",
    "tactics": ["<tactic 1 short>", "<tactic 2 short>", "<tactic 3 short>"],
    "oneLine": "<a single sentence to hold in mind, e.g. 'Anchor high, stay calm, silence is fine'>"
  }
}

Rules:
- theirLikelyMoves: 2-4 items. yourThreeTactics: exactly 3.
- Everything must be usable and specific to their situation. Plain, jargon-free language.`;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    let counterpart = String(body?.counterpart || '').trim();
    const situation = String(body?.situation || '').trim();
    const goal = String(body?.goal || '').trim();
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    if (!situation || !goal) {
      return NextResponse.json(
        { error: 'Tell me the situation and what you want, and I\'ll build your prep.' },
        { status: 400 }
      );
    }

    // If the user picked a saved person, pull in what they already know.
    let personBlock = '';
    if (personId) {
      const person = await getPersonContext(userId, personId);
      if (person) {
        if (!counterpart) counterpart = person.name;
        personBlock = `\n\nWHAT THE USER ALREADY KNOWS ABOUT ${person.name} (use this to make the plan specific to this person):\n${person.summary}`;
      }
    }

    let context = '';
    try {
      context = await searchKnowledge(
        `${situation} ${goal} negotiation persuasion influence tactics`,
        { count: 6 }
      );
    } catch {
      context = '';
    }

    const userMsg = `${context ? `Reference tactics (use to inform, don't quote):\n${context}\n\n---\n` : ''}Who they're talking to: ${counterpart || 'the other person'}
The situation: ${situation}
What they want to walk away with: ${goal}${personBlock}`;

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
        temperature: 0.5,
        max_tokens: 1600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[warroom] LLM error', res.status);
      return apiError('Could not build your prep. Please try again.', 502);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      console.error('[warroom] JSON parse failed');
      return apiError('Could not build your prep. Please try again.', 502);
    }

    return NextResponse.json({ result });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[warroom]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
