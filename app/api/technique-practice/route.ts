import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { generateExample, getTactic, getTactics, practiceDb as db, recordReview, type BookTactic } from '@/lib/prompts/practice';
import { cardStatus, type SRCard } from '@/lib/spaced-repetition';

export const maxDuration = 30;

/** Below this many cached messages for a tactic, we write a fresh one (and keep it). */
const CACHE_TARGET = 6;

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function pickChoices(answer: BookTactic, all: BookTactic[]) {
  const others = all.filter((t) => t.slug !== answer.slug);
  const sameChapter = shuffle(others.filter((t) => t.chapter === answer.chapter)).slice(0, 1);
  const rest = shuffle(others.filter((t) => !sameChapter.includes(t))).slice(0, 3 - sameChapter.length);
  return shuffle([answer, ...sameChapter, ...rest]).map((t) => ({ slug: t.slug, name: t.name }));
}

/**
 * Train mode, one round: a realistic message and four tactic names to choose from.
 * GET ?slug=<tactic> to practice one tactic; otherwise tactics that are due come first,
 * then ones not tried yet. ?exclude=<exampleId> avoids repeating the last message.
 */
export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const all = await getTactics();
    const asked = req.nextUrl.searchParams.get('slug');
    const exclude = req.nextUrl.searchParams.get('exclude');

    const { data: progress } = await db
      .from('tactic_progress')
      .select('tactic_slug, ease_factor, interval_days, repetitions, next_review_at, last_review_at, times_right, times_wrong')
      .eq('user_id', uid);
    const cards = (progress ?? []) as SRCard[];
    // Skip saved progress for tactics that aren't in the current list (e.g. old-edition tactics after the v3 switch).
    const due = cards
      .filter((c) => cardStatus(c) === 'due' && all.some((t) => t.slug === c.tactic_slug))
      .sort((a, b) => a.next_review_at.localeCompare(b.next_review_at));

    let tactic: BookTactic | null = asked ? await getTactic(asked) : null;
    if (!tactic) {
      const seen = new Set(cards.map((c) => c.tactic_slug));
      const unseen = all.filter((t) => !seen.has(t.slug));
      const pool = due.length ? due.slice(0, 3).map((c) => all.find((t) => t.slug === c.tactic_slug)!).filter(Boolean) : unseen.length ? unseen : all;
      tactic = shuffle(pool)[0];
    }

    const { data: cached } = await db.from('tactic_examples').select('id, message, context').eq('tactic_slug', tactic.slug);
    let pool = (cached ?? []).filter((e) => e.id !== exclude);
    let example: { id: string; message: string; context: string | null } | null = null;

    if ((cached ?? []).length < CACHE_TARGET) {
      try {
        const fresh = await generateExample(uid, tactic);
        if (fresh) {
          const { data: row } = await db
            .from('tactic_examples')
            .insert({ tactic_slug: tactic.slug, message: fresh.message, context: fresh.context, source: 'ai' })
            .select('id, message, context')
            .single();
          if (row) example = row;
        }
      } catch (e) {
        // Over the AI limit or a hiccup: fall back to a stored message if we have one.
        if (!pool.length) throw e;
        console.error('[technique-practice] example generation skipped', e instanceof Response ? e.status : e);
      }
    }
    if (!example) {
      if (!pool.length) pool = cached ?? [];
      example = shuffle(pool)[0] ?? null;
    }
    if (!example) return apiError("We couldn't set up a round. Please try again.", 500, '[technique-practice] no example');

    return NextResponse.json({
      exampleId: example.id,
      message: example.message,
      context: example.context,
      choices: pickChoices(tactic, all),
      dueCount: due.length,
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't set up a round. Please try again.", 500, '[technique-practice]', err);
  }
}

/** POST { exampleId, choice }: checks the answer, updates spaced repetition, returns the tactic and its calm reply. */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const exampleId = String(body.exampleId ?? '');
    const choice = String(body.choice ?? '');
    if (!exampleId || !choice) return NextResponse.json({ error: 'Please pick an answer first.' }, { status: 400 });

    const { data: ex } = await db.from('tactic_examples').select('tactic_slug').eq('id', exampleId).maybeSingle();
    const answer = ex ? await getTactic(ex.tactic_slug) : null;
    if (!answer) return NextResponse.json({ error: 'That round has expired. Try the next one.' }, { status: 404 });

    const correct = choice === answer.slug;
    const card = await recordReview(uid, answer.slug, correct ? 5 : 1);
    const chosen = correct ? answer : await getTactic(choice);

    await db.from('practice_results').insert({
      user_id: uid,
      type: 'spot_tactic',
      reference_id: answer.slug,
      score: correct ? 1 : 0,
      techniques_used: [answer.name],
      feedback: { chosen: choice },
    });

    return NextResponse.json({
      correct,
      answer,
      chosen: chosen ? { slug: chosen.slug, name: chosen.name, warning_sign: chosen.warning_sign } : null,
      nextReviewAt: card.next_review_at,
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't check that answer. Please try again.", 500, '[technique-practice]', err);
  }
}
