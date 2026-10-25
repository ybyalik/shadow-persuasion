import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { getScene, getTactic, scenePersona } from '@/lib/prompts/practice';

export const maxDuration = 30;

/** After this many of the user's lines, the scene wraps up and the debrief is offered. */
const MAX_USER_TURNS = 6;

type Msg = { role: 'user' | 'assistant'; content: string };

/**
 * One turn of a Practice Scene. The AI (MODELS.fast) plays the other person.
 * POST { scenarioId, messages } where messages start with the other person's
 * opening line -> { reply, userTurns, suggestDebrief }
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const scenarioId = String(body.scenarioId ?? '');
    const raw: unknown[] = Array.isArray(body.messages) ? body.messages : [];
    const messages: Msg[] = raw
      .map((m) => m as Partial<Msg>)
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({ role: m.role as Msg['role'], content: String(m.content).slice(0, 1200) }));

    if (!scenarioId) return NextResponse.json({ error: 'Please pick a scene.' }, { status: 400 });
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Type what you would say first.' }, { status: 400 });
    }
    const userTurns = messages.filter((m) => m.role === 'user').length;
    if (userTurns > MAX_USER_TURNS) {
      return NextResponse.json({ error: "That's a full scene. Tap Finish to get your debrief." }, { status: 400 });
    }

    const scene = await getScene(scenarioId, uid);
    if (!scene) return NextResponse.json({ error: "We couldn't find that scene." }, { status: 404 });
    const tactic = scene.tactic_slug ? await getTactic(scene.tactic_slug) : null;

    const last = userTurns >= MAX_USER_TURNS;
    const { text } = await aiChat({
      userId: uid,
      feature: 'scene:turn',
      model: MODELS.fast,
      temperature: 0.8,
      maxTokens: 250,
      messages: [
        {
          role: 'system',
          content:
            scenePersona(scene, tactic) +
            (last ? '\n\nThis is your LAST reply in the scene. Bring it to a natural close in character (accept, grumble and accept, or end the conversation).' : ''),
        },
        ...messages.slice(-14),
      ],
    });

    const reply = text.replace(/—/g, ', ').trim();
    if (!reply) return apiError("The other person didn't answer. Please try again.", 502, '[scenarios] empty reply');
    return NextResponse.json({ reply, userTurns, suggestDebrief: userTurns >= 3 });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't continue the scene. Please try again.", 500, '[scenarios]', err);
  }
}
