import type { ProblemSections } from '../sections';

/**
 * Idea credit (a coworker repeats your idea in a meeting): the extra sections for this problem.
 * Sources: Chapter 23 (Keisha, Tyler and Glen: When someone repeats your idea in a meeting and its ### parts,
 * When you were passed over), Chapter 10 (Pleasant pressure: flattery, future faking), Chapter 8 (Protecting
 * your memory), Chapter 19 (visible work), Chapter 20 (allies), Chapter 18 (alternatives).
 * Never promises the credit, the lead role or a raise. Tactic cards skip what the free tool already answers
 * (the room, the follow-up trap, the manager who presents your work) and never give away Keisha's answer
 * to "Are you really this worried about who gets credit?" (the P.S. sells it).
 */
const s: ProblemSections = {
  replay: {
    kicker: 'Monday to Thursday',
    title: 'He says your idea out loud. He gets the credit.',
    log: [
      { t: 'Mon 4:52 p.m.', h: 4, m: 52, line: `You email Glen a one-page summary. Two weeks of numbers. He replies: "Interesting. Let's discuss."` },
      { t: 'Thu 10:07 a.m.', h: 10, m: 7, line: `Team meeting. Tyler clears his throat. "I've been thinking we might have some overlap in our software."` },
      { t: 'Thu 10:08 a.m.', h: 10, m: 8, line: `Glen nods. "Good thinking. Tyler, can you pull some numbers together?"`, mark: 'Good thinking.' },
      { t: 'Thu 10:09 a.m.', h: 10, m: 9, line: `Your face goes hot. The numbers already exist. They're in Glen's inbox, with your name at the top.` },
      { t: 'Thu 10:10 a.m.', h: 10, m: 10, line: 'You say nothing. The meeting moves on to the parking situation.' },
      { t: 'Thu 11:40 p.m.', h: 11, m: 40, line: 'You think of five things you could have said.' },
    ],
    outro: `Next spring, when Glen chooses who leads the cost review, he may well remember Tyler's voice saying "software overlap" and forget who did the analysis.`,
    note: `Based on how Chapter 23 opens. The note Keisha sends, and what she says when the story changes, are in {ref}.`,
    noteRef: { ch: 23, section: 'When someone repeats your idea in a meeting' },
  },
  loop: {
    kicker: 'Why it keeps happening',
    title: 'Each time you stay quiet, the credit can go to him again.',
    body: [
      `It can happen without a plan. People may remember who presented the idea and overlook who emailed it.`,
      `Each time you stay quiet, your work stays invisible to the person who decides, and the next idea can go the same way.`,
    ],
    steps: [
      { icon: 'speech', t: 'He says it' },
      { icon: 'smooth', t: 'You stay quiet' },
      { icon: 'learn', t: 'He gets credit' },
      { icon: 'weight', t: 'He leads next' },
    ],
    center: 'Invisible work',
  },
  tactics: {
    kicker: 'More ways credit goes missing',
    title: `Six more moves the email doesn't cover.`,
    lead: 'The free part covers the meeting, the follow-up trap and the manager who presents your work. These are the other moves from the book, and the calm line for each. Tap a card.',
    items: [
      { name: 'Unclear Credit', ch: 'Chapter 23', says: `"It was a bit of a team idea anyway."`, reply: `"Here's the email from the 3rd with my analysis. The numbers Tyler is pulling are already in it."`, art: 't-group' },
      { name: 'The Talk-Over', ch: 'Chapter 23', says: 'Cut off before you finish the cost numbers.', reply: `"I'd like to finish this point. Then I want to hear yours."`, art: 't-intimidate' },
      { name: 'The Repeat Talk-Over', ch: 'Chapter 23', says: 'It happens again at the next meeting, and the one after.', reply: `"I got cut off twice on the cost numbers today. Could you give me a slot on the agenda next time?"`, art: 't-silence' },
      { name: 'Vague Feedback', ch: 'Chapter 23', says: `"You need more presence."`, reply: `"What would I need to show, specifically, for the answer to be yes next time?"`, art: 't-rewrite' },
      { name: 'Future Faking', ch: 'Chapter 10', says: `"Once this project's done, you'll get the promotion."`, reply: `"That sounds good. Can we agree on a date and put it in writing?"`, art: 't-urgency' },
      { name: 'Flattery Before the Ask', ch: 'Chapter 10', says: `"You're the only one on the team I trust with this."`, reply: `"That's kind of you. I can't take it on this week."`, art: 't-charm' },
    ],
  },
  reset: {
    closeLine: 'Next time someone says your idea out loud, your name can already be on it.',
  },
  forYou: {
    lines: [
      ['briefcase', 'You did the work, and a coworker [[said it out loud]] in the meeting.'],
      ['moon', 'You froze, then thought of five replies [[that night]].'],
      ['speech', 'You want your name back on it [[without starting a feud]].'],
      ['eye', 'Your manager remembers what gets said in meetings, not what sits in the inbox.'],
      ['head', `You've been told you need "more presence" and have no idea what that means.`],
    ],
    notFor: [
      ['push', 'You want to expose the coworker or prove it was on purpose'],
      ['rosette', 'You want a promise of the credit, the lead role or a raise'],
      ['receipt', 'You want to build a case by forwarding company files home'],
      ['shield', `You believe it's discrimination or payback (talk to HR or an employment lawyer)`],
    ],
  },
  alternatives: {
    kicker: 'What people usually try',
    title: 'The usual fixes, and what actually changes it.',
    items: [
      ['Saying nothing and working harder', `Good work can't speak to someone who never sees it.`],
      ['Venting to a work friend', 'It feels better at lunch. Your manager may still think it was his idea.'],
      ['Calling him out in front of everyone', 'It turns the talk to how you said it, not the work. The book keeps a correction to a sentence or two.'],
      ['"Presence" and body-language tips', `A firm handshake doesn't put your name on the analysis.`],
      ['Waiting for the review', 'By then, the record is whatever your manager remembers.'],
    ],
    included: [
      'The 5-line email to send the same day, filled in',
      'A sentence or two to say in the meeting, without accusing anyone',
      'The 3 kinds of credit that count, and how to ask for one by name',
      'What to say when your manager calls it "a team idea"',
      'A Friday work log and 3-line update to share your contributions',
      '60 days of the companion app: paste a message and it suggests what might be going on and a calm reply. It can\'t tell you anyone\'s motive or what really happened.',
    ],
  },
  freeChapter: {
    title: 'Read a free chapter first.',
    lead: 'Leave your email and we\'ll send you a chapter of the book. Read it before your next meeting, and come back when you\'re ready.',
  },
};

export default s;
