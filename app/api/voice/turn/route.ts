import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiStream, MODELS, type ChatMessage } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';
import { buildRehearsePersona, looksLikeDanger, parseDifficulty, SAFETY_REPLY } from '@/lib/prompts/rehearse';

/**
 * POST /api/voice/turn  ("Rehearse It", typed mode)
 * The AI plays the other person, one turn at a time, streamed as plain text.
 * Body: { counterpart, situation, goal, difficulty, personId?, history: [{ role: 'user'|'assistant', text }] }
 * With an empty history, the other person opens the conversation.
 * Header X-Safety: 1 is set when the reply is the safety message instead of the role-play.
 */

export const maxDuration = 60;

const MAX_TURNS = 40;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);

    const body = await req.json().catch(() => ({}));
    const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
    let counterpart = clip(body?.counterpart, 200) || 'the other person';
    const situation = clip(body?.situation, 1500);
    const goal = clip(body?.goal, 800);
    const difficulty = parseDifficulty(body?.difficulty);
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    if (!situation || !goal) {
      return NextResponse.json({ error: 'Tell me what the conversation is about and what you want, then we can practice.' }, { status: 400 });
    }

    const raw: unknown[] = Array.isArray(body?.history) ? body.history : [];
    const history = raw
      .map((t) => t as { role?: string; text?: string })
      .filter((t) => (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string' && t.text.trim())
      .slice(-MAX_TURNS)
      .map((t) => ({ role: t.role as 'user' | 'assistant', text: String(t.text).slice(0, 1500) }));

    const lastUser = [...history].reverse().find((t) => t.role === 'user');
    if (lastUser && looksLikeDanger(lastUser.text)) {
      return new Response(SAFETY_REPLY, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Safety': '1' } });
    }

    let personSummary: string | undefined;
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) {
        counterpart = person.name;
        personSummary = person.summary;
      }
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: buildRehearsePersona({ counterpart, situation, goal, difficulty, personSummary }) },
    ];
    if (history.length === 0 || history[0].role === 'assistant') {
      // The model needs a user message first; this one just starts the scene.
      messages.push({ role: 'user', content: '(The conversation is starting. Open it as this person would.)' });
    }
    for (const t of history) messages.push({ role: t.role, content: t.text });

    const stream = await aiStream({
      userId: uid,
      feature: 'spar:turn',
      model: MODELS.fast,
      temperature: 0.8,
      maxTokens: 400,
      messages,
    });

    const encoder = new TextEncoder();
    const body2 = new ReadableStream<Uint8Array>({
      async start(controller) {
        let sent = false;
        try {
          for await (const piece of stream) {
            const clean = piece.replace(/\u2014/g, ', ');
            if (clean) sent = true;
            controller.enqueue(encoder.encode(clean));
          }
          // A turn with no words reads as silence, which is a fair move in the scene.
          if (!sent) controller.enqueue(encoder.encode('...'));
        } catch (err) {
          console.error('[spar:turn] stream', err);
        } finally {
          controller.close();
        }
      },
    });
    return new Response(body2, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("They didn't answer just now. Please try sending that again.", 500, '[spar:turn]', err);
  }
}
