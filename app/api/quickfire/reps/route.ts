import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { IS_V3 } from '@/lib/edition';
import { getTactic, getTactics, isDangerSign, practiceDb as db, QUICK_REPS_V3, REP_SYSTEM } from '@/lib/prompts/practice';

export const maxDuration = 30;

/**
 * Quick Reps (inside Practice Scenes): one pressure line, about 30 seconds to
 * type a calm answer, then a one-line score and a better version.
 *   GET  -> { line, tacticSlug, context? }   (no AI cost)
 *           v2: from the book's tactic example lines.
 *           v3: from the new edition's Quick Reps lines (lib/practice-v3/quick-reps.json).
 *   POST { line, tacticSlug, answer, seconds } -> { score, note, better, tactic }
 */
export async function GET(req: NextRequest) {
  try {
    await requireAppUser(req);
    const exclude = req.nextUrl.searchParams.get('exclude') ?? '';
    if (IS_V3) {
      const pool = QUICK_REPS_V3.filter((r) => r.line !== exclude);
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!r) return apiError("We couldn't find a line. Please try again.", 500, '[quickfire/reps] no v3 lines');
      return NextResponse.json({ line: r.line, tacticSlug: r.tacticSlug ?? '', context: r.context });
    }
    const tactics = await getTactics();
    const lines = tactics.flatMap((t) =>
      t.examples.filter((e) => !e.startsWith('(') && e.length > 12 && e !== exclude).map((line) => ({ line, tacticSlug: t.slug }))
    );
    const pick = lines[Math.floor(Math.random() * lines.length)];
    if (!pick) return apiError("We couldn't find a line. Please try again.", 500, '[quickfire/reps] no lines');
    return NextResponse.json(pick);
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't find a line. Please try again.", 500, '[quickfire/reps]', err);
  }
}

type Rep = { score?: string; note?: string; better?: string };

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const line = String(body.line ?? '').trim().slice(0, 400);
    const answer = String(body.answer ?? '').trim().slice(0, 600);
    const seconds = Number(body.seconds) || null;
    const found = await getTactic(String(body.tacticSlug ?? ''));
    // A danger sign has no calm reply to practice; score the rep without one.
    const tactic = found && !isDangerSign(found) ? found : null;
    // v3 lines carry their own chapter, so the result can point to the book even without a tactic row.
    const rep = IS_V3 ? QUICK_REPS_V3.find((r) => r.line === line) : undefined;
    if (!line) return NextResponse.json({ error: 'Start a rep first.' }, { status: 400 });
    if (!answer) return NextResponse.json({ error: 'Type what you would say, even a few words.' }, { status: 400 });

    const { data } = await aiChat<Rep>({
      userId: uid,
      feature: 'reps',
      model: MODELS.fast,
      temperature: 0.3,
      maxTokens: 300,
      json: true,
      messages: [
        { role: 'system', content: REP_SYSTEM },
        {
          role: 'user',
          content: `PRESSURE LINE: "${line}"${tactic ? `\nTACTIC: ${tactic.name}. The book's calm reply: "${tactic.calm_reply}"` : ''}\nUSER'S ANSWER: "${answer}"`,
        },
      ],
    });
    const score = ['steady', 'close', 'gave'].includes(String(data?.score)) ? String(data!.score) : 'close';
    const clean = (s?: string) => String(s ?? '').replace(/—/g, ', ').trim();
    const result = {
      score,
      note: clean(data?.note) || 'Thanks for trying that one.',
      better: clean(data?.better) || tactic?.calm_reply || '',
      tactic: tactic
        ? { slug: tactic.slug, name: tactic.name, chapter: rep?.chapter ?? tactic.chapter, chapter_title: rep?.chapter_title ?? tactic.chapter_title }
        : rep
          ? { slug: '', name: '', chapter: rep.chapter, chapter_title: rep.chapter_title }
          : null,
    };

    await db.from('practice_results').insert({
      user_id: uid,
      type: 'quick_rep',
      reference_id: tactic?.slug ?? null,
      score: score === 'steady' ? 3 : score === 'close' ? 2 : 1,
      techniques_used: tactic ? [tactic.name] : [],
      feedback: { line, answer, seconds, ...result, heldGround: score === 'steady' },
    });

    return NextResponse.json(result);
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't score that rep. Please try again.", 500, '[quickfire/reps]', err);
  }
}
