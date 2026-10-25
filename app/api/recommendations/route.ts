/**
 * "What to do next", in the book's terms. No AI: simple rules over the
 * person's own activity, so it is instant, free and always on-message.
 * GET ?tz=<browser getTimezoneOffset()> -> { suggestions: Suggestion[] } (up to 3)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { loadReset } from '@/app/api/missions/reset-data';
import { CHAPTERS_V3, byEdition } from '@/lib/edition';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Suggestion = { title: string; body: string; href: string; cta: string; chapter?: number; chapterTitle?: string };

// Pressure chapters (v2 Part Three, v3 Part II), matched by words that show up in decoded tactic names.
type TacticChapter = { chapter: number; title: string; plural: string; words: RegExp };
const TACTIC_CHAPTERS_V2: TacticChapter[] = [
  { chapter: 11, title: 'Guilt and Obligation', plural: 'guilt trips', words: /guilt|oblig|ledger|martyr|owe|after everything|sacrific|duty/i },
  { chapter: 12, title: 'Rewriting the Past', plural: 'rewrites of the past', words: /gaslight|rewrit|never happened|denial|memory|twist|blame.?shift|reality/i },
  { chapter: 13, title: 'Withdrawal', plural: 'silent treatments', words: /silent|silence|withdraw|cold shoulder|stonewall|ignor|sulk/i },
  { chapter: 14, title: 'Charm and Pressure', plural: 'charm-and-pressure moves', words: /charm|flatter|love.?bomb|urgen|deadline|rush|pressure|compliment/i },
  { chapter: 15, title: 'The Slow Squeeze', plural: 'slow squeezes', words: /squeeze|foot in the door|creep|small ask|just this once|incremental|moving the goalpost/i },
  { chapter: 16, title: 'Intimidation', plural: 'intimidation moves', words: /intimidat|threat|anger|yell|shout|bully|aggress|ultimatum/i },
  { chapter: 18, title: 'How Groups Pull You In', plural: 'group pressure moves', words: /group|everyone|peer|team expects|family expects|bandwagon|we all/i },
];
const TACTIC_CHAPTERS_V3: TacticChapter[] = [
  { chapter: 7, title: CHAPTERS_V3[7], plural: 'guilt trips', words: /guilt|oblig|ledger|martyr|owe|after everything|sacrific|duty|hidden price|if you loved|comparison/i },
  { chapter: 8, title: CHAPTERS_V3[8], plural: 'changing stories', words: /gaslight|rewrit|never happened|denial|memory|twist|blame.?shift|reality|minimiz|just a joke|fog|turning the tables|word games/i },
  { chapter: 9, title: CHAPTERS_V3[9], plural: 'silent treatments', words: /silent|silence|withdraw|cold shoulder|stonewall|ignor|sulk|going cold|warmth|ghost|fading/i },
  { chapter: 10, title: CHAPTERS_V3[10], plural: 'charm, urgency and slow-squeeze moves', words: /charm|flatter|love.?bomb|urgen|deadline|rush|compliment|squeeze|foot in the door|creep|small ask|just this once|incremental|goalpost|future fak|unreturned loan/i },
  { chapter: 11, title: CHAPTERS_V3[11], plural: 'moves that may not be safe', words: /intimidat|threat|yell|shout|bully|aggress|ultimatum|track|stalk|money control/i },
  { chapter: 27, title: CHAPTERS_V3[27], plural: 'group pressure moves', words: /group|everyone|peer|team expects|family expects|bandwagon|we all|borrowed authority|outrage/i },
];
const TACTIC_CHAPTERS = byEdition({ v2: TACTIC_CHAPTERS_V2, v3: TACTIC_CHAPTERS_V3 });

/** Reset pointers (v2: Part Two, Chapters 6 to 10; v3: Part VII, Chapters 31 to 34). */
const RESET_REFS = byEdition({
  v2: {
    startTitle: 'Start with the 3-Day Quick Start.',
    startBody: 'Three short days, three small acts. By day three you will have proof, in your own words, that nothing terrible happened.',
    start: { chapter: 6, title: 'The 3-Day Quick Start' },
    doneBody: 'To keep it going, pick one courage drill each week and do it once. Rotate through them, and keep writing a short note two or three times a week.',
    done: { chapter: 10, title: 'Week 3, Hold' },
    resume: { chapter: 7, title: 'How the 21 Days Work' },
  },
  v3: {
    startTitle: 'Start with the Three-Day Quick Start.',
    startBody: 'Days 1 to 3 of the Power Reset: three ordinary days, three small changes. Write down what actually happens, so you have evidence the next time fear makes its predictions.',
    start: { chapter: 31, title: CHAPTERS_V3[31] },
    doneBody: 'To keep it going, pick one practice each week and do it once, rotating through them. Write a short evening note two or three times a week.',
    done: { chapter: 34, title: CHAPTERS_V3[34] },
    resume: { chapter: 31, title: CHAPTERS_V3[31] },
  },
});

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const tz = parseInt(req.nextUrl.searchParams.get('tz') || '0', 10) || 0;
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

    const [reset, decodesRes, practiceRes] = await Promise.all([
      loadReset(uid, tz),
      db.from('analysis_history').select('tactics, created_at').eq('user_id', uid).gte('created_at', weekAgo).limit(50),
      db.from('practice_results').select('type').eq('user_id', uid).in('type', ['scenario', 'rehearsal', 'spar', 'sparring']).limit(1),
    ]);

    const out: Suggestion[] = [];

    // 1. Tactics they keep running into this week.
    const counts = new Map<number, number>();
    for (const row of decodesRes.data ?? []) {
      const names = Array.isArray(row.tactics) ? (row.tactics as { tactic?: string; explanation?: string }[]).map((t) => `${t.tactic || ''} ${t.explanation || ''}`) : [];
      const hit = new Set<number>();
      for (const n of names) for (const c of TACTIC_CHAPTERS) if (c.words.test(n)) hit.add(c.chapter);
      for (const ch of hit) counts.set(ch, (counts.get(ch) || 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) {
      const c = TACTIC_CHAPTERS.find((x) => x.chapter === top[0])!;
      const n = top[1] === 2 ? 'two' : top[1] === 3 ? 'three' : String(top[1]);
      out.push({
        title: `You decoded ${n} ${c.plural} this week.`,
        body: `Chapter ${c.chapter} has the full playbook. When you're ready, rehearse your calm reply out loud.`,
        href: '/app/spar',
        cta: 'Rehearse it',
        chapter: c.chapter,
        chapterTitle: c.title,
      });
    }

    // 2. Where they are in the reset.
    if (reset.doneCount === 0) {
      out.push({
        title: RESET_REFS.startTitle,
        body: RESET_REFS.startBody,
        href: '/app/field-ops',
        cta: 'Open day 1',
        chapter: RESET_REFS.start.chapter,
        chapterTitle: RESET_REFS.start.title,
      });
    } else if (reset.currentDay === null) {
      out.push({
        title: 'You finished the reset.',
        body: RESET_REFS.doneBody,
        href: '/app/field-ops',
        cta: 'Read your notes',
        chapter: RESET_REFS.done.chapter,
        chapterTitle: RESET_REFS.done.title,
      });
    } else {
      const lastAt = [...reset.entries].sort((a, b) => b.completed_at.localeCompare(a.completed_at))[0]?.completed_at;
      const daysAway = lastAt ? Math.floor((Date.now() - Date.parse(lastAt)) / 86_400_000) : 0;
      if (daysAway >= 3) {
        const d = reset.days.find((x) => x.day_number === reset.currentDay);
        out.push({
          title: 'Pick up where you left off.',
          body: `Missed days are fine. Don't start over and don't double up. Your next step is "${d?.title ?? 'waiting for you'}".`,
          href: '/app/field-ops',
          cta: 'Continue the reset',
          chapter: RESET_REFS.resume.chapter,
          chapterTitle: RESET_REFS.resume.title,
        });
      }
    }

    // 3. No practice yet.
    if (!(practiceRes.data ?? []).length) {
      out.push({
        title: 'Try one practice scene.',
        body: 'Practice with a pretend person first, where a strange reaction costs you nothing. The skills carry over to real conversations.',
        href: '/app/training',
        cta: 'Pick a scene',
      });
    }

    // 4. Always useful: something just happened.
    if (out.length < 2) {
      out.push({
        title: 'Got a message that feels off?',
        body: 'Paste it in. You will see what is happening and get a calm reply you can send.',
        href: '/app/analyze',
        cta: 'Decode a message',
      });
    }

    return NextResponse.json({ suggestions: out.slice(0, 3) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load suggestions just now.', 500, '[recommendations]', err);
  }
}
