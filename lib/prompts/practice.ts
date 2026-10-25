/**
 * Shared pieces for "Spot the Tactic" (/app/techniques) and "Practice Scenes"
 * (/app/training): the book tactics from the database, and the prompts for
 * Train mode, scene role-play, the debrief and Quick Reps.
 * Server only (uses the service-role database client).
 */

import { createClient } from '@supabase/supabase-js';
import { aiChat, MODELS } from '@/lib/ai';
import { getNextReview, newCard, type SRCard } from '@/lib/spaced-repetition';
import { BOOK, IS_V3, editionChapter } from '@/lib/edition';
import SCENES_V3_DATA from '@/lib/practice-v3/scenes.json';
import QUICK_REPS_V3_DATA from '@/lib/practice-v3/quick-reps.json';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export { db as practiceDb };

export const HOTLINE =
  'US National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788. If you are in immediate danger, call 911.';

/** v2 chapter titles for the tactic families (as stored in book_tactics). Under v3, editionChapter() maps them to the new chapters. */
export const CHAPTER_TITLES: Record<number, string> = {
  11: 'Guilt and Obligation',
  12: 'Rewriting the Past',
  13: 'Withdrawal',
  14: 'Charm and Pressure',
  15: 'The Slow Squeeze',
  16: 'Intimidation',
  17: 'Manipulation at Scale',
  18: 'How Groups Pull You In',
};

export type BookTactic = {
  slug: string;
  number: number;
  name: string;
  family: string | null;
  chapter: number;
  chapter_title: string;
  looks_like: string;
  purpose: string;
  warning_sign: string;
  calm_reply: string;
  note: string | null;
  examples: string[];
  harm: string | null;
  works_on: string | null;
  safety: boolean;
  /** Which book the row comes from. v3 rows come from the new Tactic Spotter (slugs start with "v3-"). */
  edition?: 'v2' | 'v3';
  /** v3 only: other explanations to read first. */
  other_explanations?: string | null;
  /** v3 only: when not to confront. */
  not_confront?: string | null;
  /** v3 danger signs only: what helps instead of a script. */
  help?: string | null;
  /** v3 only: the chapters the guide points to, e.g. "Chapter 7; Chapter 3, The Rules You Never Chose." */
  book_note?: string | null;
};

const TACTIC_COLS =
  'slug, number, name, family, chapter, chapter_title, looks_like, purpose, warning_sign, calm_reply, note, examples, harm, works_on, safety';
/** Columns added by migration 033 for the new Tactic Spotter. */
const TACTIC_COLS_V3 = `${TACTIC_COLS}, edition, other_explanations, not_confront, help, book_note`;

let cache: { at: number; list: BookTactic[] } | null = null;

/** The old book's 50 tactics. v3 rows (slug "v3-...") are left out, so this works before and after migration 033. */
async function loadV2Tactics(): Promise<BookTactic[]> {
  const { data, error } = await db.from('book_tactics').select(TACTIC_COLS).not('slug', 'like', 'v3-%').order('chapter').order('number');
  if (error) throw error;
  return ((data ?? []) as BookTactic[]).map((t) => ({ ...editionChapter(t), edition: 'v2' as const }));
}

/**
 * The new Tactic Spotter (42 ordinary entries in 5 families, then 6 danger signs), in the
 * guide's order. Null if migration 033 or the seed (funnel-v2/app-knowledge/seed_practice_v3.py)
 * hasn't been run yet, so the caller can fall back to the old tactics.
 */
async function loadV3Tactics(): Promise<BookTactic[] | null> {
  const { data, error } = await db.from('book_tactics').select(TACTIC_COLS_V3).eq('edition', 'v3').order('number');
  if (error) {
    console.warn('[practice] v3 tactics not available yet, using the old ones:', error.message);
    return null;
  }
  const list = (data ?? []) as unknown as BookTactic[];
  return list.length ? list : null;
}

/**
 * The tactics for the current edition, cached for 10 minutes (the content rarely changes).
 *   v2: the old 50, by chapter then guide order.
 *   v3: the new Tactic Spotter in guide order. If it isn't loaded yet, the old 50 are used,
 *       with their chapter shown as the v3 chapter that covers the same pressure
 *       (lib/edition.ts, editionChapter).
 */
export async function getTactics(): Promise<BookTactic[]> {
  if (cache && Date.now() - cache.at < 600_000) return cache.list;
  const v3 = IS_V3 ? await loadV3Tactics() : null;
  const list = v3 ?? (await loadV2Tactics()).sort((a, b) => a.chapter - b.chapter || a.number - b.number);
  cache = { at: Date.now(), list };
  return cache.list;
}

/** True when a tactic is a danger sign from the new guide: no script, point to Chapter 11 and real help. */
export function isDangerSign(t: Pick<BookTactic, 'safety' | 'calm_reply'>): boolean {
  return t.safety && !t.calm_reply;
}

export async function getTactic(slug: string): Promise<BookTactic | null> {
  const list = await getTactics();
  return list.find((t) => t.slug === slug) ?? null;
}

/** Rules every prompt in this area shares. */
export const VOICE = `VOICE: calm, warm, plain everyday English, short sentences. Defense first: the user stays kind, they just stop being easy to use. Never teach deception, covert control or exploiting anyone. Never use em-dashes (use commas or periods). No jargon, no spy or battle words.`;

/* ── Train progress (spaced repetition, keyed by tactic slug) ── */

export const PROGRESS_COLS =
  'tactic_slug, ease_factor, interval_days, repetitions, next_review_at, last_review_at, times_right, times_wrong';

/** Records one Train answer and schedules when the tactic comes back. */
export async function recordReview(uid: string, slug: string, quality: number): Promise<SRCard> {
  const { data: existing } = await db.from('tactic_progress').select(PROGRESS_COLS).eq('user_id', uid).eq('tactic_slug', slug).maybeSingle();
  const next = getNextReview((existing as SRCard | null) ?? newCard(slug), quality);
  const { error } = await db
    .from('tactic_progress')
    .upsert({ ...next, user_id: uid, updated_at: new Date().toISOString() }, { onConflict: 'user_id,tactic_slug' });
  if (error) throw error;
  return next;
}

/* ── Train mode: one realistic message for a tactic ── */

export async function generateExample(userId: string, t: BookTactic): Promise<{ message: string; context: string } | null> {
  const { data } = await aiChat<{ message?: string; context?: string }>({
    userId,
    feature: 'spot:example',
    model: MODELS.fast,
    temperature: 0.9,
    maxTokens: 300,
    json: true,
    messages: [
      {
        role: 'system',
        content: `You write realistic practice messages for a self-help app that teaches kind people (aged 35 to 60+) to spot pressure tactics.
Write ONE message that someone in everyday life (a parent, partner, boss, coworker, friend, sibling, in-law, neighbor, salesperson) might say or text that uses this tactic. Make it sound natural, specific and believable, 1 to 3 sentences. Do NOT name the tactic or use words from its name. Vary the relationship and setting.
${VOICE}
Return JSON: {"context": "who says it and where, under 8 words, e.g. 'Your sister, by text'", "message": "the words they say"}`,
      },
      {
        role: 'user',
        content: [
          `Tactic: ${t.name}`,
          `What it looks like: ${t.looks_like}`,
          `${t.edition === 'v3' ? (isDangerSign(t) ? 'Why there is no script' : 'Concerning if') : 'Warning sign'}: ${t.warning_sign}`,
          t.purpose ? `What it's for: ${t.purpose}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  });
  const message = String(data?.message ?? '').replace(/—/g, ', ').trim();
  const context = String(data?.context ?? '').replace(/—/g, ', ').trim();
  if (!message || message.length > 400) return null;
  return { message, context: context.slice(0, 120) };
}

/* ── Practice Scenes ── */

export type Scene = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  description: string;
  objective: string;
  chapter: number | null;
  chapter_title: string | null;
  tactic_slug: string | null;
  other_person: string | null;
  opening_line: string | null;
  is_book: boolean;
  user_id: string | null;
};

export const SCENE_COLS =
  'id, title, category, difficulty, description, objective, chapter, chapter_title, tactic_slug, other_person, opening_line, is_book, user_id';

/** Scenes store v2 chapters; show the current edition's chapter. */
export function editionScene<T extends { chapter: number | null; chapter_title: string | null }>(scene: T): T {
  return editionChapter(scene);
}

/**
 * The new edition's built-in scenes (lib/practice-v3/scenes.json, ids start with "book3-").
 * Read from the file so they work on v3 even before seed_practice_v3.py copies them into
 * the scenarios table.
 */
export const SCENES_V3: Scene[] = (SCENES_V3_DATA as Omit<Scene, 'is_book' | 'user_id'>[]).map((s) => ({ ...s, is_book: true, user_id: null }));

const isV3SceneId = (id: string) => id.startsWith('book3-');

/** The built-in scenes for the current edition, in order. */
export async function listBookScenes(): Promise<Scene[]> {
  if (IS_V3) return SCENES_V3;
  // Old edition: the v2 book scenes. New-edition rows (if seeded) are left out.
  const { data, error } = await db.from('scenarios').select(SCENE_COLS).eq('is_book', true).not('id', 'like', 'book3-%').order('sort_order');
  if (error) throw error;
  return ((data ?? []) as Scene[]).map(editionScene);
}

/**
 * One scene this person may play: a built-in scene for the current edition, or one of
 * their own. Returns null if it doesn't exist or isn't theirs.
 */
export async function getScene(id: string, uid: string): Promise<Scene | null> {
  if (!id) return null;
  if (isV3SceneId(id)) return IS_V3 ? SCENES_V3.find((s) => s.id === id) ?? null : null;
  const { data } = await db.from('scenarios').select(SCENE_COLS).eq('id', id).maybeSingle();
  const scene = data as Scene | null;
  if (!scene || !(scene.is_book || scene.user_id === uid)) return null;
  return editionScene(scene);
}

/* ── Quick Reps lines for the new edition ── */

export type QuickRepLine = { line: string; context: string; tacticSlug: string | null; chapter: number; chapter_title: string };

/** Pressure lines for Quick Reps on v3 (lib/practice-v3/quick-reps.json). Danger signs are never used for reps. */
export const QUICK_REPS_V3: QuickRepLine[] = QUICK_REPS_V3_DATA as QuickRepLine[];

export const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

const TOUGHNESS: Record<number, string> = {
  1: 'You are mostly reasonable. Push back once with mild pressure, then accept a calm, clear answer.',
  2: 'Push back the way this person really would, two or three times, one pressure move at a time. Do not give in to a wobbly answer, but accept a calm answer that is repeated without extra excuses.',
  3: 'You are hard work. Keep pressing and switch between pressure moves (guilt, rewriting the past, going quiet, charm, urgency). Only accept their answer after they hold it calmly several times. Stay realistic, never cruel.',
};

export function scenePersona(scene: Scene, tactic: BookTactic | null) {
  return `You are role-playing in a practice scene for a self-help app. Play the OTHER person only. Never break character, never coach, never explain.

SCENE: ${scene.title}
WHO YOU ARE: ${scene.other_person || 'the other person in this situation'}
SITUATION (written to the user, so "you" means the user, not you): ${scene.description}
WHAT THE USER IS PRACTICING: ${scene.objective}
${tactic ? `YOUR MAIN PRESSURE MOVE: ${tactic.name}. It looks like: ${tactic.looks_like}` : ''}
HOW HARD TO PUSH: ${TOUGHNESS[scene.difficulty] ?? TOUGHNESS[2]}

RULES:
- Reply in 1 to 3 short sentences, the way a real person talks or texts. No stage directions except an occasional short one in brackets, like (sighs).
- React to what the user actually said. If they stay calm and clear, ease off gradually. If they over-explain, apologize or wobble, press on that.
- No slurs, no threats of violence, nothing sexual. Never use em-dashes.
- If the user writes something that suggests they are in real danger (violence, threats, stalking), step out of character and say kindly: "Stepping out of the scene for a moment. If you are in danger, please reach out: ${HOTLINE}"`;
}

export const DEBRIEF_SYSTEM = `You are a warm, honest coach in a self-help app based on the book ${BOOK.quoted}. The user just practiced a scene where someone pressured them. Read the transcript and give a short debrief.
${VOICE}
Judge only the USER's lines. "held" means they kept their answer calmly without over-explaining or apologizing for having a limit. "mixed" means they held part of it or wobbled. "gave" means they gave in or took on blame that wasn't theirs. Be kind and specific, quote their words where useful.
If the transcript suggests real danger (violence, threats, stalking), set "safety" to true.
Return JSON only:
{"result": "held" | "mixed" | "gave",
 "summary": "one or two sentences on how it went",
 "didWell": "one specific thing they did well (quote it if you can)",
 "betterLine": {"instead": "a line of theirs that could be stronger, quoted", "try": "one calmer, clearer line they could say instead"},
 "tactic": "the name of the main pressure tactic the other person used",
 "safety": false}`;

/* ── Quick Reps ── */

export const REP_SYSTEM = `You score a quick practice rep in a self-help app for kind people who get pressured. The user saw one pressure line and had about 30 seconds to type a calm answer.
${VOICE}
Score their answer: "steady" (calm, short, clear, kind, no over-explaining or apology for having a limit), "close" (mostly there but wobbly, too long, or a bit sharp), or "gave" (gave in, over-apologized, or attacked back).
Return JSON only:
{"score": "steady" | "close" | "gave",
 "note": "one short sentence saying why, speaking to the user as 'you'",
 "better": "one calm answer they could say, under 25 words"}`;
