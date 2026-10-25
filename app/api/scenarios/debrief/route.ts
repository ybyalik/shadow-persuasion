import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { searchKnowledge } from '@/lib/rag';
import { DEBRIEF_SYSTEM, getScene, getTactic, HOTLINE, practiceDb as db } from '@/lib/prompts/practice';

export const maxDuration = 60;

type Debrief = {
  result?: string;
  summary?: string;
  didWell?: string;
  betterLine?: { instead?: string; try?: string };
  tactic?: string;
  safety?: boolean;
};

/**
 * Short debrief after a Practice Scene (MODELS.smart).
 * POST { scenarioId, messages } -> { result: held|mixed|gave, summary, didWell, betterLine, tactic, chapter, chapterTitle }
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const scenarioId = String(body.scenarioId ?? '');
    const messages: { role: string; content: string }[] = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: { role?: string; content?: unknown }) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
      .slice(-16);
    if (!messages.some((m) => m.role === 'user')) {
      return NextResponse.json({ error: 'Say at least one thing in the scene first.' }, { status: 400 });
    }

    const scene = await getScene(scenarioId, uid);
    if (!scene) return NextResponse.json({ error: "We couldn't find that scene." }, { status: 404 });
    const tactic = scene.tactic_slug ? await getTactic(scene.tactic_slug) : null;
    const other = scene.other_person || 'The other person';
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'USER' : other.toUpperCase()}: ${String(m.content).slice(0, 1200)}`)
      .join('\n');
    const book = await searchKnowledge(`${tactic?.name ?? ''} ${scene.title} ${scene.description}`, { count: 2 });

    const { data: d } = await aiChat<Debrief>({
      userId: uid,
      feature: 'scene:debrief',
      model: MODELS.smart,
      temperature: 0.3,
      maxTokens: 1200,
      json: true,
      messages: [
        {
          role: 'system',
          content:
            DEBRIEF_SYSTEM +
            (tactic ? `\n\nTHE TACTIC IN THIS SCENE: ${tactic.name}. The book's calm reply: "${tactic.calm_reply}"` : '') +
            (book ? `\n\nFROM THE BOOK:\n${book}` : ''),
        },
        { role: 'user', content: `SCENE: ${scene.title}\nSITUATION: ${scene.description}\nTHE USER'S GOAL: ${scene.objective}\n\nTRANSCRIPT:\n${transcript}` },
      ],
    });
    if (!d?.summary) return apiError("We couldn't write your debrief. Please try again.", 502, '[scenarios/debrief] bad json');

    const clean = (s?: string) => String(s ?? '').replace(/—/g, ', ').trim();
    const result = ['held', 'mixed', 'gave'].includes(String(d.result)) ? String(d.result) : 'mixed';
    const out = {
      result,
      summary: clean(d.summary),
      didWell: clean(d.didWell),
      betterLine: { instead: clean(d.betterLine?.instead), try: clean(d.betterLine?.try) },
      tactic: tactic?.name ?? clean(d.tactic),
      tacticSlug: tactic?.slug ?? null,
      chapter: scene.chapter ?? tactic?.chapter ?? null,
      chapterTitle: scene.chapter_title ?? tactic?.chapter_title ?? null,
      safety: !!d.safety,
      hotline: d.safety ? HOTLINE : null,
    };

    await db.from('practice_results').insert({
      user_id: uid,
      type: 'scene',
      reference_id: scene.id,
      score: result === 'held' ? 3 : result === 'mixed' ? 2 : 1,
      techniques_used: tactic ? [tactic.name] : [],
      feedback: { ...out, heldGround: result === 'held' },
    });

    return NextResponse.json(out);
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't write your debrief. Please try again.", 500, '[scenarios/debrief]', err);
  }
}
