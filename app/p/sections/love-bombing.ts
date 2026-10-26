import type { ProblemSections } from '../sections';

/**
 * Love bombing: the extra sections for this problem.
 * Sources: Chapter 10 (opening story, Pleasant pressure, The slow squeeze, Slow it down, What Shauna saw),
 * Chapter 25 (A new relationship that moves too fast, Dating again, or going back), Chapter 7 (The character test),
 * Chapter 6 (What about narcissists?), Chapter 11 (A hard conversation, or a dangerous one).
 * Never claims any sign tells you "for sure": speed alone proves nothing, watch for weeks.
 * Tactic cards only use moves the free tool does not already answer.
 */
const s: ProblemSections = {
  replay: {
    kicker: 'Week one to week three',
    title: 'It started with roses at your office.',
    log: [
      { t: 'Day 2, 8:15 a.m.', h: 8, m: 15, line: `A good-morning text. Then six more before lunch.` },
      { t: 'Day 9, 12:40 p.m.', h: 12, m: 40, line: `You're in a meeting. "Everything okay?" You step out to answer.` },
      { t: 'Day 16, 11:05 a.m.', h: 11, m: 5, line: `A dozen roses arrive at your office. Your coworkers practically applaud.` },
      { t: 'Day 21, 9:20 p.m.', h: 9, m: 20, line: `Fourth date. "I've never felt like this with anyone. Meet my kids next weekend. Lisbon in March?"` },
      { t: 'Day 21, 9:24 p.m.', h: 9, m: 24, line: `You mention Saturday with your friends. His face changes. "Oh. I thought we were building something here."`, mark: `"Oh. I thought we were building something here."` },
      { t: 'Day 21, 9:25 p.m.', h: 9, m: 25, line: `"We are," you say quickly. "I can move it."` },
    ],
    outro: `Driving home, you wonder why you said it. You'd been looking forward to Saturday for a month. And why something that feels this good also feels like being hurried.`,
    note: `Based on how Chapter 10 opens. What Shauna said a week later, and what she decided, is in {ref}.`,
    noteRef: { ch: 10, section: 'What Shauna saw' },
  },
  loop: {
    kicker: 'Why it speeds up',
    title: 'Each time you give way, the pace can pick up.',
    body: [
      `Nobody has to plan this. Each step looks small: the kids next weekend, a trip in March, a key. No single step looks like pressure.`,
      `But each yes makes the next one feel more natural. And limits are easiest at the start, before habits form.`,
    ],
    steps: [
      { icon: 'rings', t: 'A big gesture' },
      { icon: 'smooth', t: 'You move plans' },
      { icon: 'learn', t: 'It speeds up' },
      { icon: 'weight', t: 'A bigger ask' },
    ],
    center: 'The whirlwind',
  },
  tactics: {
    kicker: 'More pleasant pressure',
    title: 'Six more moves that can feel like romance.',
    lead: 'The free part covers the kids, the trip, the texts and the Saturdays. These are the other moves the book names, and what to do about each. Tap a card.',
    items: [
      { name: 'Flattery Before the Ask', ch: 'Chapter 10', says: `"You're so generous, I knew I could ask."`, reply: `"That's kind of you. I can't take it on this week."`, art: 't-charm' },
      { name: '"Temporary" That Never Ends', ch: 'Chapter 10', says: `"Just until I find a place."`, reply: `"Happy to help until the end of March. Let's check in then."`, art: 't-urgency' },
      { name: 'The Slow Squeeze', ch: 'Chapter 10', says: `Twenty dollars, then fifty, then two hundred.`, reply: `"I don't lend money, but I'm happy to help you look at other options."`, art: 't-squeeze' },
      { name: 'The Unreturned Loan', ch: 'Chapter 10', says: `Money "just until payday," never mentioned again.`, reply: `"I wanted to check on the five hundred dollars from January. When can you pay that back?"`, art: 't-rewrite' },
      { name: 'The Character Test', ch: 'Chapter 7 (adapted)', says: `"I guess I care more than you do."`, reply: `"I care about you. I'm still keeping Saturdays." (Chapter 7's line is "I care about the team. I'm still leaving at six.")`, art: 't-guilt' },
      { name: 'When It Becomes Control', ch: 'Chapter 11', says: `Tracking your phone, checking where you were, cutting you off from friends.`, reply: `There is no safe line for this, and a new limit can make it worse. Trust the fear. Talk to a domestic violence advocate before you change anything.`, art: 't-intimidate' },
    ],
  },
  reset: {
    closeLine: `Three weeks from now, the roses may still come. You just won't move your Saturday for them.`,
  },
  forYou: {
    lines: [
      ['rings', `It's been weeks, not months, and they already talk about [[the kids, a trip or moving in]].`],
      ['clock', `They expect a reply all day, and "Everything okay?" comes if you're slow.`],
      ['calendar', `You moved plans you'd looked forward to, and [[you're not sure why]].`],
      ['compass', `You want to slow down [[without ending it]], and see what they do with "slower."`],
      ['eye', 'You want to know what to watch for, not a label to pin on them.'],
    ],
    notFor: [
      ['push', 'You want a test that tells you for sure whether they love you'],
      ['head', 'You want them diagnosed, or a replacement for therapy'],
      ['scissors', 'You want a line that changes how they act'],
      ['shield', 'You are afraid of them, or they track your phone or control your money (start with Chapter 11 and the hotline)'],
    ],
  },
  alternatives: {
    kicker: 'What people usually try',
    title: 'The usual advice, and what actually tells you.',
    items: [
      ['Counting gifts and texts', 'Speed alone proves nothing. Some people are just enthusiastic. What tells you more is how they handle "slower."'],
      ['Asking your friends', `Half say "red flag," half say "lucky you." Neither has seen how they handle "slower."`],
      ['Going along to keep it nice', `Each step looks small. After months together, slowing down can feel harder.`],
      ['Ghosting the minute it feels fast', 'Sometimes right. Sometimes you lose someone who was simply excited.'],
      ['Waiting for it to calm down', `It may. But if you never slow the pace, you never see how they react.`],
    ],
    included: [
      '5 signs to watch for, and which ones are only speed',
      'The exact words for "slower" about the kids, a trip, moving in and money',
      'What to watch for in the weeks after you say it',
      'Replies to praise, false deadlines, shared secrets and promises used as pressure',
      'When charm has turned into control, and where to get help',
      '60 days of the companion app: paste a text and it suggests what might be going on and a calm reply. It can\'t tell you what they feel or intend.',
    ],
  },
  freeChapter: {
    title: 'Read a free chapter first.',
    lead: 'Leave your email and we\'ll send you a chapter of the book. Read it in your own time, before the next big yes.',
  },
};

export default s;
