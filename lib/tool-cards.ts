/**
 * The eight named tools of the v3 book as short cards, for the Eight Tools page
 * (/app/tools) and anywhere else the app shows a tool.
 *
 * Source: ~/Desktop/shadow-persuasion/book-v3/bonuses/drafts/power-map-and-decision-cards.md
 * (The Power Map and Decision Cards) and the definitions in lib/edition.ts (TOOLS_V3).
 * v3 content only: show it behind IS_V3.
 *
 * Pure data, no imports beyond lib/edition.
 */

import { CHAPTERS_V3 } from '@/lib/edition';

/** The Four Fair Influence Tests, word for word from the style guide. */
export const FAIR_TESTS = [
  'Is it honest?',
  'Do they know what they are agreeing to?',
  'Can they make a real choice without unfair pressure or punishment?',
  'Am I using my power responsibly?',
] as const;

export type ToolCard = {
  slug: string;
  name: string;
  /** One sentence, from TOOLS_V3. */
  what: string;
  when: string;
  steps: { title: string; body: string }[];
  example: string;
  exampleNote?: string;
  /** Book chapters, as shown on the card. */
  chapters: { n: number; note?: string }[];
  /** The app feature that puts this tool to work, if there is one. */
  app?: { href: string; label: string }[];
};

export const TOOL_CARDS: ToolCard[] = [
  {
    slug: 'power-map',
    name: 'The Power Map',
    what: 'Who decides, what each person needs, and where authority, resources and alternatives sit.',
    when: "Before any request, negotiation or disagreement where you're not sure who really decides, or why your last attempt went nowhere.",
    steps: [
      { title: 'Pick one decision', body: 'Small enough to answer, like "where we spend Thanksgiving this year." Not a whole relationship.' },
      { title: 'Map each person', body: 'Who can decide, what they need, what resources they hold or need, what they know, and their options if this does not happen.' },
      { title: 'Map yourself', body: 'What you can decide, what you need, what you contribute that the plan depends on, and your real options with their costs.' },
      { title: 'Mark your guesses', body: 'Write facts as facts. Put a question mark beside anything you are guessing, especially guesses about motives.' },
      { title: 'Check one fact, choose one step', body: 'Who talks to whom before decisions get made? Then name one fact to check and your next step.' },
    ],
    example: 'Who needs to approve this, and who would need to help carry it out?',
    chapters: [{ n: 2 }],
    app: [{ href: '/app/power-map', label: 'Build a Power Map' }],
  },
  {
    slug: 'good-person-contract',
    name: 'The Good Person Contract',
    what: 'The unspoken rules that turn kindness and duty into automatic self-sacrifice.',
    when: "When a yes comes out before you've thought, when you apologize for a fair request, or when someone's disappointment turns your no into a maybe.",
    steps: [
      { title: 'Catch the automatic moment', body: "The yes that comes too fast, the apology you didn't need, the knot when someone sighs. Catching it afterward still counts." },
      { title: 'Name the clause', body: 'Ask which rule just spoke. Naming it puts a small gap between you and it.' },
      { title: 'Choose a fairer rule', body: "Not the bravest one. One that treats your needs as real alongside everyone else's." },
      { title: 'Say one sentence in one small, safe situation', body: 'One reason, not five. Then stop.' },
    ],
    example: 'I said yes to that too quickly. Can I look at my week and come back to you?',
    chapters: [{ n: 3 }, { n: 30, note: 'the new contract' }],
  },
  {
    slug: 'notice-pause-hold',
    name: 'Notice, Pause, Hold',
    what: 'See the pattern, make room to choose, follow through.',
    when: 'In the moment someone asks, pushes, sighs or goes quiet, and you feel the old pull to give in so the discomfort will stop.',
    steps: [
      { title: 'Notice', body: 'Spot the moment as it happens: the third Friday request in a row, the fast yes rising in your throat, your own urge to explain.' },
      { title: 'Pause', body: "Put space between the request and your answer. Sometimes that's a breath. Often it's a sentence that buys time." },
      { title: 'Hold', body: "Follow through on what you decided, even if they're disappointed. If they push, repeat your answer once in the same calm words." },
      { title: 'Stay open to real news', body: 'You can change your answer if a new fact matters. The point is to choose, not to agree just to end the discomfort.' },
    ],
    example: 'Let me look at my week and tell you by lunchtime tomorrow.',
    chapters: [{ n: 5 }],
    app: [
      { href: '/app/assist', label: 'Right Now' },
      { href: '/app/field-ops', label: 'The 21-Day Power Reset' },
    ],
  },
  {
    slug: 'choice-check',
    name: 'The Choice Check',
    what: 'Four questions: What happened? What am I assuming? What do I actually owe? What options do I have?',
    when: 'When your feelings are racing ahead of the facts. A late-night text, a guilt trip, a sudden deadline, or the urge to send a long apology.',
    steps: [
      { title: 'What happened?', body: 'Only what a camera would have recorded. "She sent one text, late at night."' },
      { title: 'What am I assuming?', body: 'Name your story about their feelings or motives, then list one or two other explanations. A sigh is not proof.' },
      { title: 'What do I actually owe?', body: 'A promise you made? A fair reply? Caring that someone is hurt is different from owing them whatever would stop the hurt.' },
      { title: 'What options do I have?', body: 'List at least three, including waiting. Then choose.' },
    ],
    example: "I'm sorry you're upset. I'd like to talk about it tomorrow when I've had some sleep.",
    exampleNote: 'A short reply chosen after the check, instead of the long apology your thumb was already typing.',
    chapters: [{ n: 5 }],
    app: [{ href: '/app/choice-check', label: 'Do a Choice Check' }],
  },
  {
    slug: 'clean-ask',
    name: 'The Clean Ask',
    what: 'Say what you want, give the relevant reason, leave room for a real answer.',
    when: 'Any time you want something from someone: time off, help, a raise, a fairer split, a change in how they treat you.',
    steps: [
      { title: 'Say what you want', body: "Specifically, and at the top of what you can honestly justify, so they don't have to guess." },
      { title: 'Give the relevant reason', body: 'One true reason that helps explain the request. Your own needs count. Extra reasons give people more to argue with.' },
      { title: 'Leave room for a real answer', body: "End with a question they can actually say no to. If you'd sulk, punish or go cold after a no, you're not asking. You're demanding." },
      { title: 'Stop talking', body: "Let them answer before you trim anything. Don't negotiate against yourself." },
      { title: 'Know your fallback and your limit before you ask', body: 'Then you can be flexible on the rest.' },
    ],
    example: "I'd like Thursday morning off next week. My father has a hospital appointment at nine and I'm driving him. Could that work with the schedule?",
    chapters: [{ n: 17 }],
    app: [
      { href: '/app/warroom', label: 'Plan a Conversation' },
      { href: '/app/rewrite', label: 'Calm My Reply' },
    ],
  },
  {
    slug: 'no-agreement-plan',
    name: 'The No-Agreement Plan',
    what: 'What you will do if the answer is still no.',
    when: 'Before any ask that matters, and again when follow-up has failed or agreements keep slipping.',
    steps: [
      { title: 'Write down what has actually been refused', body: 'Facts and dates. Leave out what you think they feel.' },
      { title: 'List your real paths and their costs', body: 'Accept it, escalate fairly, step back, or leave. Include the one that scares you.' },
      { title: 'Set your line', body: '"If ___ hasn\'t happened by ___, I will ___." Add what would change your mind. The date is yours to set.' },
      { title: 'Get ready quietly, before you need it', body: "A plan you can't carry out is just a wish." },
      { title: 'Decide whether to say it', body: 'If you do, say it once, as information, and only if you mean it. Never use it as a bluff or a threat.' },
    ],
    example: "I understand your answer. I've decided to make a different arrangement.",
    chapters: [
      { n: 18, note: 'introduced' },
      { n: 28, note: 'full version' },
    ],
    app: [{ href: '/app/warroom', label: 'Plan a Conversation' }],
  },
  {
    slug: 'smallest-agreed-step',
    name: 'The Smallest Agreed Step',
    what: 'A useful next action, with clear agreement on exactly what it covers.',
    when: 'At the end of any conversation where someone said yes, and whenever "we should" or "we\'ll sort it out" is all you\'ve got.',
    steps: [
      { title: 'Name what was agreed, out loud', body: 'Who does what, by when, and what it covers.' },
      { title: 'Shrink it to one step', body: "Small enough to carry out, useful to the task, and clear enough that you both know what you're agreeing to." },
      { title: "Say what it doesn't cover", body: 'Looking at quotes is not agreeing to pay. Trying one Saturday is not a promise of every Saturday.' },
      { title: 'Confirm it in one line, within a day', body: "Include only what was agreed. A note records an agreement. It doesn't create one, and silence is never a yes." },
      { title: 'If it slips, follow up early', body: "Refer back to the agreement, name the gap without blame, and ask what's in the way." },
    ],
    example: 'So, just to be sure we\'re on the same page: what exactly are we each doing, and by when?',
    chapters: [{ n: 22 }],
    app: [{ href: '/app/warroom', label: 'Plan a Conversation' }],
  },
  {
    slug: 'four-fair-influence-tests',
    name: 'The Four Fair Influence Tests',
    what: 'Is it honest? Do they know what they are agreeing to? Can they make a real choice without unfair pressure or punishment? Am I using my power responsibly?',
    when: 'On requests that come to you, and on your own requests before you make them. Run them on yourself first.',
    steps: [
      { title: FAIR_TESTS[0], body: 'True information and real reasons. No invented deadlines, no made-up offers, no "everyone thinks so" when nobody said that.' },
      { title: FAIR_TESTS[1], body: 'No hidden costs, no small favor that quietly becomes a standing arrangement.' },
      {
        title: FAIR_TESTS[2],
        body: 'They can say no and be treated fairly afterward. A real choice can still have costs; the question is whether a consequence follows fairly from the choice, or is added to make refusal hurt.',
      },
      { title: FAIR_TESTS[3], body: "Especially as the boss, the parent, the one with the money, or the one they depend on. Make it safe for people with less power to say no." },
    ],
    example: "I can't take that on this week. I can point you to the instructions if that would help.",
    exampleNote: 'A firm no, with no jab added.',
    chapters: [
      { n: 1, note: 'preview' },
      { n: 30, note: 'full' },
    ],
    app: [{ href: '/app/warroom', label: 'Plan a Conversation (fairness check)' }],
  },
];

/** "Chapter 2, Read the Power Map" with an optional note. */
export function cardChapter(c: { n: number; note?: string }) {
  return `Chapter ${c.n}, ${CHAPTERS_V3[c.n]}${c.note ? ` (${c.note})` : ''}`;
}
