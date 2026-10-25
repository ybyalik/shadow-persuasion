import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';
import { ASSIST_PROMPT, normalizeAssist } from '@/lib/prompts/in-the-moment';

export const maxDuration = 30;

/**
 * Right Now: for a live conversation. Body: { theySaid, goal?, personId? }.
 * Returns { result: { sayNow, buyTime, boundary, safety } }. Fast model, short answer.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const theySaid = String(body?.theySaid || '').trim().slice(0, 1500);
    const goal = String(body?.goal || '').trim().slice(0, 300);
    const personId = typeof body?.personId === 'string' ? body.personId : '';
    if (!theySaid) return apiError('Type what they just said first.', 400);

    let personLine = '';
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) personLine = `\nWho it is: ${person.name}. ${person.summary.slice(0, 400)}`;
    }

    const { data } = await aiChat({
      userId: uid,
      feature: 'assist',
      model: MODELS.fast,
      temperature: 0.4,
      maxTokens: 250,
      json: true,
      messages: [
        { role: 'system', content: ASSIST_PROMPT },
        { role: 'user', content: `They just said: "${theySaid}"${goal ? `\nWhat I want: ${goal}` : ''}${personLine}` },
      ],
    });
    const result = normalizeAssist(data);
    if (!result) return apiError("We couldn't get a line just now. Please try again.", 502, '[assist] invalid AI answer');
    return NextResponse.json({ result });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[assist]', err);
  }
}
