/**
 * Which edition of the book the companion app follows.
 *
 *   v2 (default): "Shadow Persuasion: How to Stop Being Used and Take Your Power Back"
 *                 26 chapters, the 24-step reset, bonuses Tactic Spotter, Stop Shrinking,
 *                 Hard Conversation Planner. This is what current customers own.
 *   v3:           "Shadow Persuasion: The Hidden Rules of Power"
 *                 34 chapters in 7 parts, eight named tools, the 21-day Power Reset
 *                 (Part VII), bonuses: the 21-Day Power Reset Journal, The Tactic Spotter,
 *                 The Conversation Planner, The Power Map and Decision Cards.
 *
 * Switch: set NEXT_PUBLIC_BOOK_EDITION=v3 in the hosting environment and redeploy.
 * Anything else (or nothing) means v2, so live users see no change until launch.
 * One variable on purpose: it is read the same way by server routes and by pages
 * in the browser (Next.js copies NEXT_PUBLIC_ values into the page at build time,
 * which is why a change needs a redeploy). Launch steps:
 * ~/Desktop/shadow-persuasion/book-v3/launch-checklist.md, "App and emails".
 *
 * Pure data, no imports, so pages, API routes and prompt files can all use it.
 */

export type BookEdition = 'v2' | 'v3';

export const BOOK_EDITION: BookEdition = process.env.NEXT_PUBLIC_BOOK_EDITION === 'v3' ? 'v3' : 'v2';
export const IS_V3 = BOOK_EDITION === 'v3';

/** Pick the value for the current edition. */
export function byEdition<T>(choices: { v2: T; v3: T }): T {
  return choices[BOOK_EDITION];
}

/* ───────────── The book ───────────── */

type BookInfo = {
  title: string;
  subtitle: string;
  author: string;
  /** For AI prompts: "Shadow Persuasion: <subtitle>" in quotes. */
  quoted: string;
  /** The same, followed by "by Nate Harlan". */
  quotedWithAuthor: string;
};

function book(title: string, subtitle: string, author = 'Nate Harlan'): BookInfo {
  const quoted = `"${title}: ${subtitle}"`;
  return { title, subtitle, author, quoted, quotedWithAuthor: `${quoted} by ${author}` };
}

export const BOOKS: Record<BookEdition, BookInfo> = {
  v2: book('Shadow Persuasion', 'How to Stop Being Used and Take Your Power Back'),
  v3: book('Shadow Persuasion', 'The Hidden Rules of Power'),
};
export const BOOK = BOOKS[BOOK_EDITION];

/* ───────────── Chapters ───────────── */

export const CHAPTERS_V2: Record<number, string> = {
  1: 'The 3 A.M. Replay',
  2: 'The Good Person Contract',
  3: 'How They Read You',
  4: 'The Voice in Your Head',
  5: 'Caring Too Much',
  6: 'The 3-Day Quick Start',
  7: 'How the 21 Days Work',
  8: 'Week 1, Notice',
  9: 'Week 2, Pause',
  10: 'Week 3, Hold',
  11: 'Guilt and Obligation',
  12: 'Rewriting the Past',
  13: 'Withdrawal',
  14: 'Charm and Pressure',
  15: 'The Slow Squeeze',
  16: 'Intimidation',
  17: 'Manipulation at Scale',
  18: 'How Groups Pull You In',
  19: 'What People Really Want',
  20: 'How You Come Across',
  21: 'Being Heard Without a Fight',
  22: "Getting What You're Owed",
  23: 'Changing the Frame',
  24: 'Office Politics and Alliances',
  25: 'Making It Stick',
  26: "The Line You Don't Cross",
};

export const CHAPTERS_V3: Record<number, string> = {
  1: 'Power Is Having a Say',
  2: 'Read the Power Map',
  3: 'The Rules You Never Chose',
  4: 'The Voice That Keeps You Stuck',
  5: 'Stay Steady Without Going Cold',
  6: 'A Bad Moment or a Pattern?',
  7: 'Guilt, Favors, and Hidden Debts',
  8: 'When the Story Keeps Changing',
  9: 'Silence, Distance, and Conditional Warmth',
  10: 'Charm, Urgency, and the Slow Squeeze',
  11: 'When Pressure Becomes Danger',
  12: 'Why People Push Back',
  13: 'Listen Without Pretending to Read Minds',
  14: 'Ask Questions That Open the Problem',
  15: 'Make Your Case Land',
  16: 'Change the Frame, Not the Facts',
  17: 'Ask for More and Negotiate Well',
  18: 'Build Alternatives Before You Need Them',
  19: 'Be Credible, Visible, and Clear',
  20: 'Build Allies Without Creating Debts',
  21: 'Lead Without Making People Dependent',
  22: 'Turn Agreement Into Action',
  23: 'Work, Pay, and Recognition',
  24: 'Clients, Customers, and Money Decisions',
  25: 'Dating, Intimacy, and Difficult Relationships',
  26: 'Family, Friends, and the Roles That Stick',
  27: 'Groups, Media, and Manufactured Pressure',
  28: 'When They Still Say No',
  29: 'Your Next Chapter Starts Here',
  30: 'Power Without Becoming What You Resent',
  31: 'Your Three-Day Quick Start',
  32: 'Week One: Notice',
  33: 'Week Two: Pause and Choose',
  34: 'Week Three: Hold and Follow Through',
};

/** Chapter titles for the current edition. */
export const CHAPTERS: Record<number, string> = byEdition({ v2: CHAPTERS_V2, v3: CHAPTERS_V3 });
export const CHAPTER_COUNT = Object.keys(CHAPTERS).length;

/** "Chapter 7, Guilt, Favors, and Hidden Debts" (the book's own cross-reference style). */
export function chapterRef(n: number): string {
  return CHAPTERS[n] ? `Chapter ${n}, ${CHAPTERS[n]}` : `Chapter ${n}`;
}

/** The new book's seven parts (v3 only). */
export const PARTS_V3: { part: string; title: string; from: number; to: number }[] = [
  { part: 'I', title: 'See Where Your Power Goes', from: 1, to: 5 },
  { part: 'II', title: 'Stop Unfair Pressure', from: 6, to: 11 },
  { part: 'III', title: 'Build Real Influence', from: 12, to: 17 },
  { part: 'IV', title: 'Power Beyond the Conversation', from: 18, to: 22 },
  { part: 'V', title: 'Put It to Work in Your Life', from: 23, to: 27 },
  { part: 'VI', title: 'Keep Your Power Useful', from: 28, to: 30 },
  { part: 'VII', title: 'The 21-Day Power Reset', from: 31, to: 34 },
];

/** Chapters the app points to again and again. */
export const KEY_CHAPTERS = byEdition({
  v2: { fairLine: 26, danger: 16, hold: 10, beingHeard: 21, owed: 22, makeItStick: 25, pattern: 12 },
  v3: { fairLine: 30, danger: 11, hold: 34, beingHeard: 13, owed: 17, makeItStick: 22, pattern: 6 },
});

/* ───────────── The eight named tools (v3) ───────────── */

export const TOOLS_V3: { name: string; chapter: number; definition: string }[] = [
  { name: 'The Power Map', chapter: 2, definition: 'Who decides, what each person needs, and where authority, resources and alternatives sit.' },
  { name: 'The Good Person Contract', chapter: 3, definition: 'The unspoken rules that turn kindness and duty into automatic self-sacrifice.' },
  { name: 'The Choice Check', chapter: 5, definition: 'Four questions: What happened? What am I assuming? What do I actually owe? What options do I have?' },
  { name: 'Notice, Pause, Hold', chapter: 5, definition: 'See the pattern, make room to choose, follow through.' },
  { name: 'The Clean Ask', chapter: 17, definition: 'Say what you want, give the relevant reason, leave room for a real answer.' },
  { name: 'The No-Agreement Plan', chapter: 28, definition: 'What you will do if the answer is still no. (Introduced in Chapter 18, covered fully in Chapter 28.)' },
  { name: 'The Smallest Agreed Step', chapter: 22, definition: 'A useful next action, with clear agreement on exactly what it covers.' },
  {
    name: 'The Four Fair Influence Tests',
    chapter: 30,
    definition:
      'Is it honest? Do they know what they are agreeing to? Can they make a real choice without unfair pressure or punishment? Am I using my power responsibly?',
  },
];

/** The tools as one block for AI prompts. */
export const TOOLS_V3_TEXT = TOOLS_V3.map((t) => `- ${t.name} (Chapter ${t.chapter}): ${t.definition}`).join('\n');

/** v3 prompt rule: the only capitalised tool names the AI may use. */
export const TOOLS_V3_RULE = `The book has exactly eight named tools. Use these names exactly and never invent other capitalised technique names (describe any other move in plain words, like "repeat their words back"):
${TOOLS_V3_TEXT}`;

/* ───────────── Bonuses that come with the book ───────────── */

export const BONUSES = byEdition({
  v2: {
    journal: 'The 21-Day Reset Journal',
    spotter: 'The Tactic Spotter',
    planner: 'The Hard Conversation Planner',
    phrases: 'Stop Shrinking',
    cards: null as string | null,
  },
  v3: {
    journal: 'The 21-Day Power Reset Journal',
    spotter: 'The Tactic Spotter',
    planner: 'The Conversation Planner',
    phrases: null as string | null,
    cards: 'The Power Map and Decision Cards' as string | null,
  },
});

/* ───────────── Pressure families (for "name the pressure") ───────────── */

export const PRESSURE_FAMILIES = byEdition({
  v2: [
    'Guilt and Obligation',
    'Rewriting the Past',
    'Withdrawal',
    'Charm and Pressure',
    'The Slow Squeeze',
    'Intimidation',
    'Manipulation at Scale',
    'How Groups Pull You In',
  ],
  v3: [
    'Guilt, Favors, and Hidden Debts',
    'When the Story Keeps Changing',
    'Silence, Distance, and Conditional Warmth',
    'Charm, Urgency, and the Slow Squeeze',
    'When Pressure Becomes Danger',
    'Groups, Media, and Manufactured Pressure',
  ],
});

/**
 * Content saved under the v2 book (book_tactics, book practice scenes, old decodes,
 * saved plans, goal steps) stores v2 chapter numbers and titles. Under v3, show the
 * v3 chapter that now covers the same idea. Matched by the stored v2 chapter TITLE,
 * so anything already written with v3 chapters is left alone.
 */
const LEGACY_TO_V3: Record<string, number> = {
  'The 3 A.M. Replay': 4,
  'The Good Person Contract': 3,
  'How They Read You': 3,
  'The Voice in Your Head': 4,
  'Caring Too Much': 5,
  'The 3-Day Quick Start': 31,
  'How the 21 Days Work': 31,
  'Week 1, Notice': 32,
  'Week 1: Notice': 32,
  'Week 2, Pause': 33,
  'Week 2: Pause': 33,
  'Week 3, Hold': 34,
  'Week 3: Hold': 34,
  'Guilt and Obligation': 7,
  'Rewriting the Past': 8,
  Withdrawal: 9,
  'Charm and Pressure': 10,
  'The Slow Squeeze': 10,
  Intimidation: 11,
  'Manipulation at Scale': 24,
  'How Groups Pull You In': 27,
  'What People Really Want': 12,
  'How You Come Across': 19,
  'Being Heard Without a Fight': 13,
  "Getting What You're Owed": 17,
  'Changing the Frame': 16,
  'Office Politics and Alliances': 20,
  'Making It Stick': 22,
  "The Line You Don't Cross": 30,
};

/** The v3 chapter for a stored v2 chapter title, or null if it isn't a v2 title (or we're on v2). */
export function v3ChapterForLegacyTitle(title: string | null | undefined): number | null {
  if (!IS_V3 || !title) return null;
  return LEGACY_TO_V3[title] ?? null;
}

export function editionChapter<T extends { chapter: number | null; chapter_title: string | null }>(row: T): T {
  const n = v3ChapterForLegacyTitle(row.chapter_title);
  return n ? { ...row, chapter: n, chapter_title: CHAPTERS_V3[n] } : row;
}

/* ───────────── The reset ───────────── */

export type ResetPhaseKey = 'quick_start' | 'notice' | 'pause' | 'hold';

export const RESET = byEdition({
  v2: {
    title: 'The 21-Day Reset',
    partLabel: 'Part Two of the book',
    total: 24,
    /** v2 numbers steps 1-24 but calls steps 4-24 "Day 1" to "Day 21". */
    dayOffset: 3,
    daysTable: 'reset_days',
    progressTable: 'reset_progress',
    levels: { pausing: 10, holding: 17 },
    phases: [
      { key: 'quick_start' as ResetPhaseKey, name: '3-Day Quick Start', short: 'Quick start', chapter: 6, chapterTitle: 'The 3-Day Quick Start', blurb: 'Three small acts to prove nothing terrible happens.' },
      { key: 'notice' as ResetPhaseKey, name: 'Week 1: Notice', short: 'Notice', chapter: 8, chapterTitle: 'Week 1, Notice', blurb: 'See the pattern while it is happening.' },
      { key: 'pause' as ResetPhaseKey, name: 'Week 2: Pause', short: 'Pause', chapter: 9, chapterTitle: 'Week 2, Pause', blurb: 'Put space between the ask and your answer.' },
      { key: 'hold' as ResetPhaseKey, name: 'Week 3: Hold', short: 'Hold', chapter: 10, chapterTitle: 'Week 3, Hold', blurb: 'Stay put, calmly, when they push back.' },
    ],
  },
  v3: {
    title: 'The 21-Day Power Reset',
    partLabel: 'Part VII of the book',
    total: 21,
    dayOffset: 0,
    daysTable: 'reset_days_v3',
    progressTable: 'reset_progress_v3',
    levels: { pausing: 7, holding: 14 },
    phases: [
      { key: 'quick_start' as ResetPhaseKey, name: 'Quick Start: Days 1 to 3', short: 'Quick Start', chapter: 31, chapterTitle: CHAPTERS_V3[31], blurb: 'Three ordinary days, three small changes.' },
      { key: 'notice' as ResetPhaseKey, name: 'Week One: Notice', short: 'Notice', chapter: 32, chapterTitle: CHAPTERS_V3[32], blurb: 'Notice what you agree to, and why.' },
      { key: 'pause' as ResetPhaseKey, name: 'Week Two: Pause and Choose', short: 'Pause', chapter: 33, chapterTitle: CHAPTERS_V3[33], blurb: 'Pause, find what you want, and ask for it.' },
      { key: 'hold' as ResetPhaseKey, name: 'Week Three: Hold and Follow Through', short: 'Hold', chapter: 34, chapterTitle: CHAPTERS_V3[34], blurb: 'Hold your position, make agreements stick, repair what goes wrong.' },
    ],
  },
});
