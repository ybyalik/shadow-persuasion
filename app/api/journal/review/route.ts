/**
 * The 21-Day Power Reset (v3 edition only): the weekly reviews on Days 7 and 14 and
 * the Day 21 wrap-up. A short, calm AI reflection on the week's evening notes and
 * check-in scores (MODELS.fast). This replaces the old "Field Reports" weekly AI
 * review in the new Reset's own voice.
 *
 * POST { n: 1 | 2 | 3 } -> { reflection, saved }
 *   1 = Week One (Days 4 to 7), 2 = Week Two (Days 8 to 14), 3 = the whole Reset (Day 21 wrap-up).
 *   Saved in reset_pages_v3 as review-<n> when migration 032 is applied; otherwise
 *   it is still returned, just not kept (saved=false).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { BOOK, IS_V3, RESET, TOOLS_V3_RULE } from '@/lib/edition';
import { CHECKINS, REVIEWS, STATEMENTS_SHORT } from '@/app/app/field-ops/reset-pages';
import { PAGES_TABLE, db, loadPages } from '@/app/api/missions/reset-data';
import { finishReflection } from '../safety';

export const maxDuration = 30;

const SYSTEM = `You are a calm, warm companion inside the app for the book ${BOOK.quotedWithAuthor}. The reader is doing the book's 21-Day Power Reset (Part VII): small daily practices that follow Notice, Pause, Hold (see the pattern, make room to choose, follow through), so kind, reliable people get more say in their own lives.

They have reached a review point in the Reset. You get their evening notes for the period and their check-in scores (five statements rated 0 to 10). Write a short review back to them.

Rules:
- Plain everyday English, short sentences. Speak to them as "you".
- Never gushing. No "amazing", "incredible", "proud of you", no exclamation marks.
- Name one or two patterns you can actually see in what they wrote, using their own details (for example: the same person keeps showing up, the fear was bigger than what happened, they caught it sooner, an apology slipped in, the guilt faded faster).
- If scores are given, mention what moved and what didn't, in one sentence, without judging. Small or no movement is normal; the book says change often shows in the notes before the scores.
- End with one small, low-stakes thing to carry forward. Low stakes first, no big confrontations.
- Do not diagnose or label the people they write about. Describe behavior only.
- Defense first. Never suggest manipulating, tricking or getting back at anyone.
- No em-dashes or en-dashes. Use commas or periods.
- Not therapy, and never claim to be.
- If the notes suggest they are in danger (violence, threats, stalking, someone controlling their money, phone or movements), say so kindly, point them to Chapter 11, When Pressure Becomes Danger, and mention the US National Domestic Violence Hotline, 1-800-799-7233 (text START to 88788).
${TOOLS_V3_RULE}
Output only the review text.`;

type Answers = Record<string, unknown>;

function scoresLine(label: string, a: Answers | undefined) {
  const s = Array.isArray(a?.scores) ? (a!.scores as unknown[]) : [];
  if (!s.some((x) => typeof x === 'number')) return null;
  return `${label}: ${STATEMENTS_SHORT.map((t, i) => `${t} ${typeof s[i] === 'number' ? s[i] : '?'}`).join('; ')}`;
}

const text = (a: Answers | undefined, id: string) => (typeof a?.[id] === 'string' ? (a[id] as string).trim().slice(0, 800) : '');

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    if (!IS_V3) return apiError('Weekly reviews come with the new edition of the Reset.', 400);
    const body = await req.json().catch(() => ({}));
    const review = REVIEWS.find((r) => r.n === Number(body?.n));
    if (!review) return apiError('Please pick a review.', 400);

    const [daysRes, notesRes, pagesRes] = await Promise.all([
      db.from(RESET.daysTable).select('day_number, title').gte('day_number', review.from).lte('day_number', review.to).order('day_number'),
      db
        .from(RESET.progressTable)
        .select('day_number, note')
        .eq('user_id', uid)
        .gte('day_number', review.from)
        .lte('day_number', review.to)
        .order('day_number'),
      loadPages(uid),
    ]);
    if (daysRes.error) throw daysRes.error;
    if (notesRes.error) throw notesRes.error;

    const titles = new Map((daysRes.data ?? []).map((d) => [d.day_number as number, d.title as string]));
    const perNote = review.n === 3 ? 500 : 1200;
    const notes = (notesRes.data ?? [])
      .filter((e) => (e.note || '').trim().length >= 10)
      .map((e) => `Day ${e.day_number} (${titles.get(e.day_number) ?? ''}): ${(e.note as string).trim().slice(0, perNote)}`);
    if (!notes.length) {
      return apiError(`Write a few evening notes for Days ${review.from} to ${review.to} first, then ask for your review.`, 400);
    }

    const pages = new Map(pagesRes.pages.map((p) => [p.page_key, p.answers as Answers]));
    const checkIns = CHECKINS.filter((c) => c.day <= review.to)
      .map((c) => scoresLine(c.title, pages.get(c.key)))
      .filter(Boolean) as string[];

    let extra = '';
    if (review.n === 3) {
      const replay = pages.get('replay-4');
      const rewrite = pages.get('rewrite-21');
      if (text(replay, 'they') || text(rewrite, 'answer')) {
        extra = `\n\nDay 4 replay: they said "${text(replay, 'they')}"; they answered "${text(replay, 'i')}"; they wished they'd said "${text(replay, 'wish')}".\nDay 21 new answer: "${text(rewrite, 'answer')}".`;
      }
    }

    const ask =
      review.n === 3
        ? 'This is the Day 21 wrap-up for the whole Reset. Write 4 to 6 sentences: what changed across the three weeks, what moved in the check-ins, how the new answer differs from the Day 4 replay if both are given, and one practice to keep doing each week.'
        : `This is the weekly review for Days ${review.from} to ${review.to}. Write 3 to 4 sentences.`;

    const source = notes.join('\n') + extra;
    const { text: out } = await aiChat({
      userId: uid,
      feature: 'reset:review',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: review.n === 3 ? 380 : 260,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `${ask}\n\nCheck-in scores (0 to 10):\n${checkIns.length ? checkIns.join('\n') : 'None saved.'}\n\nTheir evening notes:\n"""${source.slice(0, 9000)}"""`,
        },
      ],
    });

    const reflection = finishReflection(out, source);
    if (!reflection) return apiError('We could not write your review just now. Please try again.', 502);

    let saved = false;
    if (pagesRes.ready) {
      const { error } = await db
        .from(PAGES_TABLE)
        .upsert({ user_id: uid, page_key: review.key, reflection, updated_at: new Date().toISOString() }, { onConflict: 'user_id,page_key' });
      if (error) console.error('[reset:review:save]', error);
      else saved = true;
    }

    return NextResponse.json({ reflection, saved });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not write your review just now. Your notes are safe, so please try again.', 500, '[reset:review]', err);
  }
}
