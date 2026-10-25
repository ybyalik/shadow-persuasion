/**
 * The 21-Day Power Reset (v3 edition only): the check-ins, tool pages, weekly
 * reviews and after-the-reset pages from the 21-Day Power Reset Journal
 * (book-v3/bonuses/drafts/journal-21-day-power-reset.md) and Chapter 31.
 *
 * Pure data and helpers, no imports from the browser or the database, so the
 * Reset page and the API route (app/api/missions/pages) share one list.
 * Answers are stored in reset_pages_v3 (migration 032), one row per page_key.
 */

/* ───────────── The five check-in statements (Chapter 31) ───────────── */

export const STATEMENTS = [
  'I can say no without over-explaining.',
  'I can let someone be disappointed in me without rushing to fix it.',
  'I can stay calm when someone gets annoyed or upset with me.',
  'I can ask for what I want directly.',
  "I notice pressure while it's happening, not just afterward.",
] as const;

/** Short labels for the side-by-side grid (the journal's Check-in 4 grid). */
export const STATEMENTS_SHORT = [
  'Say no without over-explaining',
  'Let someone be disappointed',
  "Stay calm when they're upset",
  'Ask directly',
  'Notice pressure as it happens',
] as const;

/* ───────────── Field types ───────────── */

export type TextField = {
  kind: 'text';
  id: string;
  label: string;
  hint?: string;
  /** 1 = a single line. Default 3. */
  rows?: number;
  /** Show a "Copy" button (for messages people will send). */
  copy?: boolean;
};
export type ChecksField = { kind: 'checks'; id: string; label: string; options: string[] };
export type Field = TextField | ChecksField;

export type PageDef = {
  key: string;
  /** The Reset day this page sits beside (0 = after the reset). */
  day: number;
  title: string;
  intro?: string;
  fields: Field[];
  /** A closing line shown under the fields. */
  after?: string;
};

export type CheckInDef = PageDef & { n: 1 | 2 | 3 | 4; column: string; hideEarlier: boolean };

export type Answers = Record<string, string | boolean[] | (number | null)[] | string[] | number>;

/* ───────────── The four check-ins ───────────── */

export const CHECKINS: CheckInDef[] = [
  {
    n: 1,
    key: 'checkin-1',
    day: 1,
    column: 'Start',
    hideEarlier: false,
    title: 'Check-in 1: before Day 1',
    intro: "Rate each statement from 0 to 10, by gut feeling. Don't think too long. These scores are for you. You don't need to share them.",
    fields: [
      { kind: 'text', id: 'days', label: 'My three Quick Start days', hint: 'Pick ordinary days, not a holiday, a huge deadline or a family wedding.', rows: 2 },
      { kind: 'text', id: 'why', label: "Why I'm doing this", hint: "One or two lines for the days when you'd rather not.", rows: 2 },
    ],
    after:
      "Expect some discomfort: a tight chest, a flush of guilt, an urge to take it back. You don't have to make the feeling go away. Let it be there while you do the exercise.",
  },
  {
    n: 2,
    key: 'checkin-2',
    day: 7,
    column: 'Day 7',
    hideEarlier: true,
    title: 'Check-in 2: after Day 7',
    intro:
      "Rate each statement again from 0 to 10, without looking at your first scores. Then compare. Don't worry if the scores barely moved. This week was about seeing.",
    fields: [{ kind: 'text', id: 'notice', label: 'What I notice when I compare', rows: 2 }],
  },
  {
    n: 3,
    key: 'checkin-3',
    day: 14,
    column: 'Day 14',
    hideEarlier: true,
    title: 'Check-in 3: after Day 14',
    intro: 'Rate each statement again from 0 to 10, then compare with your first two check-ins.',
    fields: [{ kind: 'text', id: 'notice', label: 'What I notice when I compare', rows: 2 }],
  },
  {
    n: 4,
    key: 'checkin-4',
    day: 21,
    column: 'Day 21',
    hideEarlier: true,
    title: 'Check-in 4: Day 21',
    intro: 'Rate each statement one last time. Then look at all four check-ins side by side.',
    fields: [
      { kind: 'text', id: 'most', label: 'The statement that moved most, and what I think moved it', rows: 2 },
      { kind: 'text', id: 'least', label: 'The statement that moved least, and one practice that might help it', rows: 2 },
      { kind: 'text', id: 'keep', label: "The one practice I most want to keep, and the day next week I'll do it", rows: 2 },
    ],
  },
];

/* ───────────── Tool pages beside the days ───────────── */

export const TOOL_PAGES: PageDef[] = [
  {
    key: 'replay-4',
    day: 4,
    title: 'Day 4 replay page: the conversation you keep replaying',
    intro:
      "Pick an ordinary exchange from the past year that still stings. Skip anything that feels overwhelming to revisit. Keep it to about half a page. You'll come back to this on Day 21. Use first names or initials only.",
    fields: [
      { kind: 'text', id: 'who', label: 'Who, and roughly when', rows: 1 },
      { kind: 'text', id: 'they', label: 'What they said' },
      { kind: 'text', id: 'i', label: 'What I said' },
      { kind: 'text', id: 'wish', label: "What I wish I'd said", rows: 2 },
      { kind: 'text', id: 'afraid', label: 'What I was afraid of', rows: 2 },
    ],
  },
  {
    key: 'map-6',
    day: 6,
    title: 'Day 6 tool page: my Power Map',
    intro: 'One decision, one page, ten minutes.',
    fields: [
      { kind: 'text', id: 'decision', label: 'The decision', rows: 1 },
      { kind: 'text', id: 'decides', label: '1. Who decides what', hint: 'Names, and what each person can actually decide.' },
      { kind: 'text', id: 'needs', label: '2. What each person needs', hint: "Stick to what they've said or what you can check. Put guesses after a question mark." },
      { kind: 'text', id: 'resources', label: '3. Resources', hint: 'Time, money, skills, transport, space. Who supplies each one, and who needs it? Include what you supply.' },
      { kind: 'text', id: 'knows', label: '4. Who knows what', hint: 'Where information sits, and whose views get heard.', rows: 2 },
      { kind: 'text', id: 'options', label: '5. Real options', hint: "What each person could do if this plan didn't happen, with the costs." },
    ],
  },
  {
    key: 'choice-7',
    day: 7,
    title: 'Day 7 tool page: the Choice Check',
    intro: 'Do it in your head in the moment, or here afterward.',
    fields: [
      { kind: 'text', id: 'happened', label: 'What happened?', hint: 'Only what was said or done. No guesses yet.', rows: 2 },
      { kind: 'text', id: 'assuming', label: 'What am I assuming?', hint: 'What do I think will happen, or what do I think they mean? Do I know?', rows: 2 },
      { kind: 'text', id: 'owe', label: 'What do I actually owe?', hint: 'A real duty or promise, or a favor that has started to feel like one?', rows: 2 },
      { kind: 'text', id: 'options', label: 'What options do I have?', hint: "List at least three, including ones you wouldn't pick." },
      { kind: 'text', id: 'chose', label: 'What I chose, and the words I used', rows: 2 },
    ],
  },
  {
    key: 'ask-12',
    day: 12,
    title: 'Day 12 tool page: Clean Ask planner',
    fields: [
      {
        kind: 'text',
        id: 'want',
        label: 'What exactly do I want?',
        hint: 'Something they could say yes to. "More help" is vague; "you take the bins out on Mondays and Thursdays" is clear.',
        rows: 2,
      },
      { kind: 'text', id: 'reason', label: 'One relevant reason', hint: 'It can include your own needs. One good reason is stronger than four weak ones.', rows: 2 },
      { kind: 'text', id: 'their', label: 'What they might need or worry about', hint: 'Mark guesses as guesses.', rows: 2 },
      { kind: 'text', id: 'ask', label: 'My ask, in one or two sentences', hint: 'End with a question that leaves room for their answer.', copy: true },
      { kind: 'text', id: 'pushback', label: 'Their likely pushback, and my calm reply' },
      { kind: 'text', id: 'smaller', label: "A smaller version or a trial I'd accept", hint: 'For example, "Could we try it for the rest of the month?"', rows: 2 },
      {
        kind: 'text',
        id: 'ifno',
        label: 'If they say no, I will say: "Okay. Thanks for hearing me." And then I will:',
        hint: 'That is the start of a No-Agreement Plan: what you will do if the answer is still no. Chapter 18 introduces it, and Chapter 28 covers it in full.',
        rows: 2,
      },
      {
        kind: 'checks',
        id: 'tests',
        label: 'Fairness check before you ask: the Four Fair Influence Tests (Chapter 30)',
        options: [
          'Is it honest?',
          'Do they know what they are agreeing to?',
          'Can they make a real choice without unfair pressure or punishment?',
          'Am I using my power responsibly?',
        ],
      },
    ],
  },
  {
    key: 'trade-18',
    day: 18,
    title: 'Day 18 tool page: trade proposal',
    fields: [
      { kind: 'text', id: 'want', label: 'What I want', rows: 2 },
      { kind: 'text', id: 'offer', label: 'What I can offer in return', hint: "Something they'd actually value, and something I'll really do.", rows: 2 },
      { kind: 'text', id: 'even', label: 'Is it roughly even? How might it look from their side?', rows: 2 },
      { kind: 'text', id: 'proposal', label: 'My proposal, in one or two sentences', copy: true },
      { kind: 'text', id: 'question', label: "A question I can ask if they say it isn't even", hint: 'For example, "What would feel even to you?"', rows: 1 },
      { kind: 'text', id: 'changes', label: "Changes I'd accept, and changes I wouldn't", rows: 2 },
      { kind: 'text', id: 'fallback', label: 'If they say no, my fallback', hint: "What I'll do with my own time or resources, said plainly, never a threat.", rows: 2 },
    ],
  },
  {
    key: 'confirm-19',
    day: 19,
    title: 'Day 19 tool page: confirming the Smallest Agreed Step',
    intro:
      "A short message records what you both agreed. It doesn't create agreement that wasn't there, and silence afterward isn't a yes. If they correct a detail, that's useful. Better to find it now than on the day.",
    fields: [
      { kind: 'text', id: 'agreed', label: 'What we agreed, in plain words', rows: 2 },
      { kind: 'text', id: 'who', label: 'Who does what', rows: 2 },
      { kind: 'text', id: 'when', label: 'By when, or how often', rows: 1 },
      { kind: 'text', id: 'notcover', label: 'What it does not cover', hint: 'Only if that could cause confusion later.', rows: 1 },
      { kind: 'text', id: 'message', label: 'My draft message', hint: 'Thanks, what we agreed, one question that invites them to correct it.', rows: 4, copy: true },
      {
        kind: 'checks',
        id: 'checks',
        label: 'Before you send it, check:',
        options: [
          "It says only what we both agreed, nothing I'm hoping they agreed to.",
          "It's short enough to read in one go.",
          'It invites a correction.',
          'It goes to an account they use, not one other people can read.',
        ],
      },
    ],
  },
  {
    key: 'repair-20',
    day: 20,
    title: 'Day 20 tool page: repair',
    fields: [
      {
        kind: 'text',
        id: 'did',
        label: 'What I did, said specifically',
        hint: '"I said your plan made no sense in front of the team," not "I\'m sorry if you were upset."',
        rows: 2,
      },
      { kind: 'text', id: 'effect', label: 'The effect on them', hint: 'Start with what it was like for them; leave your intentions out of the first half.', rows: 2 },
      { kind: 'text', id: 'keeping', label: "The decision or limit I'm keeping, if it was fair", rows: 1 },
      { kind: 'text', id: 'differently', label: "What I'll do differently next time", hint: 'Short and believable.', rows: 1 },
      { kind: 'text', id: 'repair', label: 'My repair, in three or four sentences', rows: 4, copy: true },
    ],
    after:
      'Then let them respond. They might be gracious, wary or need time. Don\'t ask "So are we good?" A repair is something you give, not a trade. If they use the apology as a lever, you can say, "I was wrong about how I said it. My answer is still the same."',
  },
  {
    key: 'rewrite-21',
    day: 21,
    title: 'Day 21 rewrite page: the new answer',
    fields: [
      { kind: 'text', id: 'they', label: 'What they said', hint: 'Copied from your Day 4 replay. Change it if you like.' },
      { kind: 'text', id: 'answer', label: 'My new answer, in words I could say out loud tomorrow' },
      { kind: 'text', id: 'next', label: "What I think they might say next, including the part where they don't like it", rows: 2 },
      { kind: 'text', id: 'then', label: "What I'd say then", rows: 2 },
      { kind: 'text', id: 'plan', label: 'My No-Agreement Plan in one line', hint: 'What I will do if the answer is still no.', rows: 1 },
    ],
    after:
      "Chapter 28, When They Still Say No, helps you build that plan fully. If this replay involves someone who frightens you, don't plan to say any of this to them. Go to Chapter 11, When Pressure Becomes Danger, instead.",
  },
];

/* ───────────── Weekly reviews and the Day 21 wrap-up ───────────── */

export const REVIEWS: { n: 1 | 2 | 3; key: string; day: number; from: number; to: number; title: string }[] = [
  { n: 1, key: 'review-1', day: 7, from: 4, to: 7, title: 'Your weekly review: Week One' },
  { n: 2, key: 'review-2', day: 14, from: 8, to: 14, title: 'Your weekly review: Week Two' },
  { n: 3, key: 'review-3', day: 21, from: 1, to: 21, title: 'Your 21-day wrap-up' },
];

/* ───────────── After the reset ───────────── */

export const AFTER_RESET_INTRO =
  'Three weeks is a beginning. The habits fade if you stop using them. To keep them, do one practice each week, rotating through the drills below, and write a short evening note two or three times a week. If you hear "you\'ve changed," a calm "I have, a bit" is enough. If someone\'s reaction turns into punishment, threats or fear, go to Chapter 11 and get help suited to the situation.';

/** Monthly check-in: page key monthly-YYYY-MM. */
export const MONTHLY: PageDef = {
  key: 'monthly',
  day: 0,
  title: 'Monthly check-in',
  intro: 'Use it on the same day each month. Rate each statement from 0 to 10, then answer the questions.',
  fields: [
    { kind: 'text', id: 'yes', label: "Where did I give a yes I didn't mean this month? What was going on?", rows: 2 },
    { kind: 'text', id: 'held', label: 'Where did I hold steady, even a little?', rows: 2 },
    {
      kind: 'text',
      id: 'person',
      label: "Is one person or situation taking more of my say than I'd like? What's one small, low-stakes step I could take?",
      rows: 2,
    },
    { kind: 'text', id: 'ask', label: "Did I ask for anything this month? If not, what's one thing I could ask for?", rows: 2 },
    { kind: 'text', id: 'repair', label: 'Do I owe anyone a repair?', rows: 1 },
    { kind: 'text', id: 'next', label: 'My practice for next month', hint: 'Pick from the courage drills below.', rows: 1 },
  ],
};

export function monthKey(d = new Date()) {
  return `monthly-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Courage drills to rotate (the journal's back pages). One a week; start again at the top. */
export const DRILLS: { id: string; name: string; text: string; days: string }[] = [
  { id: 'pause', name: 'The pause', text: 'Say "let me check" before every non-urgent yes for one day.', days: 'Days 1 and 8' },
  { id: 'small-ask', name: 'Small ask', text: 'Ask for one small thing you expect to be refused. Say "No problem, thanks for checking" if it is.', days: 'Day 2' },
  { id: 'sorry-swap', name: 'Sorry swap', text: 'Catch reflex apologies for a day and swap them.', days: 'Day 2' },
  { id: 'clean-no', name: 'Clean no', text: 'Decline one low-stakes request without a reason.', days: 'Days 3 and 13' },
  { id: 'yes-count', name: 'Yes count', text: 'Count your yeses for one afternoon, M or D.', days: 'Day 4' },
  { id: 'clause-catch', name: 'Clause catch', text: 'Notice your Good Person Contract clause for one day.', days: 'Day 5' },
  { id: 'quick-map', name: 'Quick map', text: 'Draw a five-minute Power Map of one decision you feel stuck on.', days: 'Day 6' },
  { id: 'choice-check', name: 'Choice Check', text: 'Run the four questions on one moment of pressure.', days: 'Day 7' },
  { id: 'want-check', name: 'Want check', text: 'Ask "If nobody would be disappointed, what would I choose?" before three answers.', days: 'Day 9' },
  { id: 'limited-yes', name: 'Limited yes', text: 'Put a clear time or scope on a yes that could otherwise grow, and keep to it.', days: 'Day 10' },
  { id: 'clean-ask', name: 'Clean Ask', text: 'Ask for one thing that matters to you, with one reason and room for a real answer.', days: 'Day 12' },
  { id: 'send-back', name: 'Send it back', text: 'Ask for what you paid for, without softening it.', days: 'Day 14' },
  { id: 'say-again', name: 'Say it again', text: 'When someone pushes on a no, repeat the same sentence once.', days: 'Day 15' },
  { id: 'let-it-be', name: 'Let it be', text: "Acknowledge someone's disappointment once, then stop.", days: 'Day 16' },
  { id: 'stay-in-it', name: 'Stay in it', text: "Disagree about something small and don't drop it just to end the discomfort.", days: 'Day 17' },
  { id: 'trade', name: 'Trade', text: 'Turn one one-way favor into a fair swap.', days: 'Day 18' },
  { id: 'follow-up', name: 'Follow up', text: 'Check on one thing someone promised, and wait for the answer.', days: 'Day 19' },
  { id: 'confirm', name: 'Confirm', text: 'Send one short message confirming exactly what was agreed.', days: 'Day 19' },
];

/* ───────────── Lookups and cleaning (used by the API) ───────────── */

export const MAX_ANSWER = 4000;

const STATIC_PAGES: Record<string, PageDef> = Object.fromEntries(
  [...CHECKINS, ...TOOL_PAGES].map((p) => [p.key, p] as const)
);

/** The definition for a page key, or null if the key isn't one of ours. */
export function pageDef(key: string): PageDef | null {
  if (STATIC_PAGES[key]) return STATIC_PAGES[key];
  if (/^monthly-\d{4}-(0[1-9]|1[0-2])$/.test(key)) return { ...MONTHLY, key };
  return null;
}

export function isCheckInKey(key: string) {
  return /^checkin-[1-4]$/.test(key) || key.startsWith('monthly-');
}

function cleanText(v: unknown) {
  return typeof v === 'string' ? v.trim().slice(0, MAX_ANSWER) : '';
}

function cleanScores(v: unknown): (number | null)[] {
  const arr = Array.isArray(v) ? v : [];
  return STATEMENTS.map((_, i) => {
    const n = Number(arr[i]);
    return arr[i] !== null && arr[i] !== undefined && arr[i] !== '' && Number.isInteger(n) && n >= 0 && n <= 10 ? n : null;
  });
}

/**
 * Keeps only the fields a page has, in the right shape. Returns null for an unknown key.
 * Drills: { done: drill ids, round: number, notes }.
 */
export function cleanAnswers(key: string, raw: unknown): Answers | null {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  if (key === 'drills') {
    const ids = new Set(DRILLS.map((d) => d.id));
    const done = Array.isArray(src.done) ? Array.from(new Set(src.done.filter((x): x is string => typeof x === 'string' && ids.has(x)))) : [];
    const round = Number.isInteger(Number(src.round)) && Number(src.round) > 0 ? Math.min(Number(src.round), 999) : 1;
    return { done, round, notes: cleanText(src.notes) };
  }
  const def = pageDef(key);
  if (!def) return null;
  const out: Answers = {};
  for (const f of def.fields) {
    if (f.kind === 'text') out[f.id] = cleanText(src[f.id]);
    else {
      const arr = Array.isArray(src[f.id]) ? (src[f.id] as unknown[]) : [];
      out[f.id] = f.options.map((_, i) => arr[i] === true);
    }
  }
  if (isCheckInKey(key)) out.scores = cleanScores(src.scores);
  return out;
}

/** True when nothing has been written or ticked yet. */
export function isEmptyAnswers(a: Answers | undefined | null) {
  if (!a) return true;
  return Object.values(a).every((v) =>
    typeof v === 'string' ? !v.trim() : Array.isArray(v) ? v.every((x) => x === null || x === false || x === '') : true
  );
}
