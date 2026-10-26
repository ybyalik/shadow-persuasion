import type { ProblemSections } from '../sections';

/**
 * Two jobs (a coworker left and you got their work at the same pay): the extra sections for this problem.
 * Sources: Chapter 10 (The slow squeeze: "temporary" that never ends, moving goalposts; Pleasant pressure:
 * flattery, future faking), Chapter 23 (Omar and Irene: Asking for a raise; When you were passed over),
 * Chapter 7 (The character test), Chapter 17 (When the answer is no), Chapter 28 (No-Agreement Plan).
 * Never promises the raise. Tactic cards skip what the free tool already answers (no budget, Nora's
 * "which should come off my list", the endings it covers).
 */
const s: ProblemSections = {
  replay: {
    kicker: 'The day they left, and every day since',
    title: '"Just until we hire someone."',
    log: [
      { t: 'Fri 4:30 p.m.', h: 4, m: 30, line: `The farewell cake in the break room. Everyone signs the card.` },
      { t: 'Mon 8:05 a.m.', h: 8, m: 5, line: `Your manager stops by your desk. "Can you pick up their work? Only until we hire someone."`, mark: 'Only until we hire someone.' },
      { t: 'Mon 8:06 a.m.', h: 8, m: 6, line: `"Of course," you say, before she has finished asking.` },
      { t: 'Week 6, 7:40 p.m.', h: 7, m: 40, line: 'Still at your desk. Two jobs, one paycheck. Nobody mentions the job posting.' },
      { t: 'Month 4, 9:15 a.m.', h: 9, m: 15, line: `The posting is gone. Nobody decided you'd do both jobs. It just happened.` },
      { t: 'Month 7, 10:50 p.m.', h: 10, m: 50, line: 'Your pay stub. The same number as before they left.' },
    ],
    outro: 'Temporary arrangements are easy to agree to because they have an end. Often the end never comes.',
    note: `In Chapter 23, Omar runs two garages at the old pay after a colleague retires. His whole ask, and what came of it, is in {ref}.`,
    noteRef: { ch: 23, section: 'Asking for a raise' },
  },
  loop: {
    kicker: 'Why it keeps happening',
    title: 'Each yes can quietly make the next task yours.',
    body: [
      'Each step is small and reasonable. Cover one meeting. Then their accounts. Then train the new hire.',
      `Together, they add up to a job you'd never have agreed to on day one, at the pay you had before.`,
    ],
    steps: [
      { icon: 'push', t: '"Just until..."' },
      { icon: 'smooth', t: 'You say yes' },
      { icon: 'weight', t: 'It becomes yours' },
      { icon: 'hourglass', t: 'Pay stays put' },
    ],
    center: 'The slow squeeze',
  },
  tactics: {
    kicker: 'How a second job lands on you',
    title: 'Seven more moves the script doesn\'t cover.',
    lead: 'The free part answers "no budget" and the usual endings. These are the other moves from the book, and the calm line for each. Tap a card.',
    items: [
      { name: '"Temporary" That Never Ends', ch: 'Chapter 10', says: `"Only until we hire someone." Seven months ago.`, reply: `"Happy to help until the end of March. Let's check in then."`, art: 't-squeeze' },
      { name: 'Moving Goalposts', ch: 'Chapter 10', says: `"Let's see if you can keep it up another quarter."`, reply: `"In March, the goal was ten accounts. I brought in twelve. I'd like to talk about the raise."`, art: 't-rewrite' },
      { name: 'Flattery Before the Ask', ch: 'Chapter 10', says: `"You're the only one on the team I trust with this."`, reply: `"That's kind of you. I can't take it on this week."`, art: 't-charm' },
      { name: 'Future Faking', ch: 'Chapter 10', says: `"Once this project's done, you'll get the promotion."`, reply: `"That sounds good. Can we agree on a date and put it in writing?"`, art: 't-urgency' },
      { name: 'The Character Test', ch: 'Chapter 7', says: `"If you cared about the team, you'd stay."`, reply: `"I care about the team. I'm still leaving at six."`, art: 't-guilt' },
      { name: 'Vague Feedback', ch: 'Chapter 23', says: `"You need more presence."`, reply: `"What would I need to show, specifically, for the answer to be yes next time?"`, art: 't-silence' },
      { name: 'The Unclear No', ch: 'Chapter 17', says: `"It's just not a good time."`, reply: `"Is that a firm no, or is there something that would change it?"`, art: 't-group' },
    ],
  },
  reset: {
    closeLine: 'A month from now, you may still be doing both jobs. The difference is that you will have asked for a specific amount, with a date for the next step.',
  },
  forYou: {
    lines: [
      ['briefcase', 'A coworker quit or retired, and [[their work landed on you]] at the same pay.'],
      ['hourglass', 'You heard "just until we hire someone," and [[nobody has been hired]].'],
      ['speech', 'You want to ask for more money without complaining, threatening or bluffing.'],
      ['pen', `You've never asked for a raise and [[don't know what to say first]].`],
      ['key', `You don't know who approves pay where you work, or when it's decided.`],
    ],
    notFor: [
      ['rosette', 'You want a guaranteed raise'],
      ['push', 'You want to bluff about another offer'],
      ['weight', 'You want to out-argue your boss'],
      ['shield', 'You believe pay is held back as discrimination or payback (talk to HR or an employment lawyer)'],
    ],
  },
  alternatives: {
    kicker: 'What people usually try',
    title: 'The usual fixes, and what actually changes it.',
    items: [
      ['Working harder until someone notices', 'Omar ran two garages at the old pay. Nobody refused him a raise. Nobody brought it up at all.'],
      ['Hinting in your one-on-one', 'A hint leaves your manager guessing, and guessing is easy to put off.'],
      ['Threatening to quit', 'A bluff that gets called can leave you with less than you started with.'],
      ['Complaining to coworkers', 'It feels better at lunch. The person who approves pay never hears it.'],
      ['Waiting for the new hire', `"Temporary" arrangements are easy to agree to. Often the end never comes.`],
    ],
    included: [
      'The word-for-word opening, and when to stop talking',
      `The reply to "there's no budget right now"`,
      `How to find out who approves pay, and when it's decided`,
      'A private worksheet for your target pay, minimum pay and backup plan',
      'What to do with "lower," "not now," a title instead of money, and a no that keeps coming back',
      '60 days of the companion app: paste your manager\'s message and it suggests what might be going on and a calm reply. It can\'t tell you their motive or what was really decided.',
    ],
  },
  freeChapter: {
    title: 'Read a free chapter first.',
    lead: 'Leave your email and we\'ll send you a chapter of the book. Read it before you book the meeting.',
  },
};

export default s;
