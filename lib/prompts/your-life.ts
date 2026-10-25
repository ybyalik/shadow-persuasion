/**
 * Prompts and book facts for the "Your life" area: My People, Goals and
 * Talk It Through. Grounded in the book's playbooks (back-01-playbooks.md)
 * and the Tactic Quick Reference (back-03-tactic-reference.md).
 *
 * v3 edition (NEXT_PUBLIC_BOOK_EDITION=v3, see lib/edition.ts): chapter titles,
 * tactic list and relationship guides come from "The Hidden Rules of Power"
 * (pressure patterns quick reference, Situation Finder, Part V chapters 23 to 27).
 */

import { BOOK, CHAPTERS_V3, TOOLS_V3_RULE, byEdition } from '@/lib/edition';

export const RELATIONSHIPS = ['Partner', 'Parent', 'Boss', 'Coworker', 'Friend', 'Ex', 'Sibling', 'In-law', 'Other'] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

/** Older saved people used other labels; map them onto the new list. */
export function normalizeRelationship(raw: unknown): Relationship {
  const v = String(raw || '').trim().toLowerCase();
  const found = RELATIONSHIPS.find((r) => r.toLowerCase() === v);
  if (found) return found;
  if (v === 'family' || v === 'mother' || v === 'father' || v === 'mom' || v === 'dad') return 'Parent';
  if (v === 'rival' || v === 'colleague') return 'Coworker';
  if (v === 'brother' || v === 'sister') return 'Sibling';
  if (v === 'husband' || v === 'wife' || v === 'spouse' || v === 'boyfriend' || v === 'girlfriend') return 'Partner';
  return 'Other';
}

/** The book's chapter titles, for "In the book" pointers (v2 list kept as it was). */
const CHAPTERS_V2_HERE: Record<number, string> = {
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
export const CHAPTERS: Record<number, string> = byEdition({ v2: CHAPTERS_V2_HERE, v3: CHAPTERS_V3 });

/** Every tactic in the Tactic Quick Reference, with its chapter and the core of the calm reply. */
const TACTICS_V2: { name: string; chapter: number; reply: string }[] = [
  { name: 'The martyr', chapter: 11, reply: '"Okay. Let me know if you want help with something specific."' },
  { name: 'The ledger', chapter: 11, reply: '"You\'ve done a lot for me, and I\'m grateful. I\'m still not able to do this."' },
  { name: 'The hidden-price favor', chapter: 11, reply: '"That was kind of you. I can\'t do this."' },
  { name: 'The character test', chapter: 11, reply: '"I can be someone you count on and still not be able to do this."' },
  { name: 'Visible suffering', chapter: 11, reply: '"You seem upset. If you want to talk, I\'m here." Then stop.' },
  { name: '"If you loved me"', chapter: 11, reply: '"I love you. I\'m not going to do this."' },
  { name: 'Flat denial', chapter: 12, reply: '"I remember it differently. Here\'s what I need going forward."' },
  { name: 'The minimizer', chapter: 12, reply: '"It didn\'t land that way for me, and I\'d like you to stop."' },
  { name: 'The blame shift', chapter: 12, reply: '"I\'m responsible for what I said. You\'re responsible for how you responded."' },
  { name: 'Fog', chapter: 12, reply: '"I want to come back to what I asked."' },
  { name: 'The rewrite', chapter: 12, reply: '"Either way, I\'m not agreeing to it now."' },
  { name: '"Everyone agrees with me"', chapter: 12, reply: '"I\'m not talking with everyone. I\'m talking with you."' },
  { name: 'The silent treatment', chapter: 13, reply: '"When you\'re ready to talk, I\'m here." Then carry on.' },
  { name: '"I\'m fine"', chapter: 13, reply: '"Okay. Let me know if that changes."' },
  { name: 'Going cold', chapter: 13, reply: '"You seem distant. Is something going on between us?"' },
  { name: 'Withholding affection', chapter: 13, reply: 'Name the pattern calmly. Consider outside support.' },
  { name: 'Ghosting', chapter: 13, reply: 'One warm message. Then let them choose.' },
  { name: 'The slow reply', chapter: 13, reply: 'Follow up once, factually.' },
  { name: 'Flattery before the ask', chapter: 14, reply: '"Thank you. Let me check and get back to you."' },
  { name: 'Love bombing', chapter: 14, reply: '"I\'d like to take things a bit slower."' },
  { name: 'Fake urgency', chapter: 14, reply: '"If it has to be decided now, my answer is no."' },
  { name: 'Borrowed intimacy', chapter: 14, reply: '"Thank you for trusting me. I can\'t help with this."' },
  { name: 'Future faking', chapter: 14, reply: '"Can we agree on a date and put it in writing?"' },
  { name: 'The foot in the door', chapter: 14, reply: '"I said I\'d take a quick look. I can\'t do the rest."' },
  { name: 'Moving goalposts', chapter: 15, reply: '"I\'ve done what we agreed. Let\'s talk about the raise."' },
  { name: 'The ladder of small yeses', chapter: 15, reply: 'Stop at a clear point. Look at where it\'s heading.' },
  { name: 'Scope creep', chapter: 15, reply: 'List what you do. Ask for a decision about it.' },
  { name: 'Stolen credit', chapter: 15, reply: '"Thanks for picking up on the idea I raised earlier."' },
  { name: '"Temporary" that never ends', chapter: 15, reply: 'Put a date on it.' },
  { name: 'The unreturned loan', chapter: 15, reply: '"When will you be able to pay that back?"' },
  { name: 'The raised voice', chapter: 16, reply: '"I can\'t do this while you\'re shouting. Let\'s take a break."' },
  { name: 'Public pressure', chapter: 16, reply: '"I\'d rather talk about that one-on-one."' },
  { name: 'The implied threat', chapter: 16, reply: '"Are you saying my review will be affected if I don\'t?"' },
  { name: 'The ultimatum', chapter: 16, reply: '"I\'m not going to decide under pressure."' },
  { name: 'Looming and physical intimidation', chapter: 16, reply: 'Leave. Prioritize safety. Get support.' },
  { name: 'High-pressure sales', chapter: 17, reply: '"I don\'t buy anything on the same day."' },
  { name: 'Impersonation scams', chapter: 17, reply: 'Hang up. Call back on a number you find yourself.' },
  { name: 'Family emergency scams', chapter: 17, reply: 'Call your relative directly. Use a family code word.' },
  { name: 'Romance scams', chapter: 17, reply: 'Never send money to someone you haven\'t met in person.' },
  { name: 'Fake scarcity and timers', chapter: 17, reply: 'The 24-hour rule.' },
  { name: 'The warm welcome', chapter: 18, reply: 'Slow your commitment. Watch how they react.' },
  { name: 'Us and them', chapter: 18, reply: 'Keep relationships outside the group.' },
  { name: 'Gradual commitment', chapter: 18, reply: 'Ask: would I have agreed to the destination on day one?' },
  { name: 'No questions', chapter: 18, reply: 'Write your doubts down. Find people who\'ll hear them.' },
];

/** v3: the book's "Quick reference: pressure patterns" plus the Tactic Spotter's other entries. */
const TACTICS_V3: { name: string; chapter: number; reply: string }[] = [
  { name: 'The martyr', chapter: 7, reply: '"Okay. Tell me if there\'s something specific you want help with."' },
  { name: 'The ledger', chapter: 7, reply: '"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."' },
  { name: 'The favor with a hidden price', chapter: 7, reply: '"That was kind of you. I can\'t do this one."' },
  { name: 'The character test', chapter: 7, reply: '"I can care about you and still say no to this."' },
  { name: 'Visible suffering', chapter: 7, reply: '"You seem upset. If you want to talk, I\'m here." Then stop.' },
  { name: '"If you loved me"', chapter: 7, reply: '"I love you. I\'m still not going to do this."' },
  { name: 'The comparison', chapter: 7, reply: '"I\'m not them. Let\'s talk about what\'s going on between us."' },
  { name: "Helpless at the jobs they don't want", chapter: 7, reply: '"I\'ll show you once. After that it\'s yours."' },
  { name: 'Flat denial', chapter: 8, reply: '"I remember it differently. Let\'s agree on what happens from here."' },
  { name: 'Minimizing', chapter: 8, reply: '"It didn\'t land that way for me, and I\'d like it to stop."' },
  { name: 'Blame-shifting', chapter: 8, reply: '"I\'m responsible for what I said. You\'re responsible for what you did."' },
  { name: 'Fog', chapter: 8, reply: '"I\'d like to come back to what I asked."' },
  { name: 'Rewriting the past', chapter: 8, reply: '"That\'s not my understanding. Let\'s agree on what happens next." Confirm it in writing if that\'s safe.' },
  { name: '"Everyone agrees with me"', chapter: 8, reply: '"I\'m talking with you, not everyone."' },
  { name: 'Being turned against people', chapter: 8, reply: '"If they have a concern, I\'m happy to hear it from them directly."' },
  { name: 'Turning the tables', chapter: 8, reply: '"We can talk about what I did too. First I\'d like to finish what I raised."' },
  { name: 'Twisting your words', chapter: 8, reply: '"That\'s not what I said." Then repeat what you did say, once.' },
  { name: 'Labels instead of answers', chapter: 8, reply: '"I\'m disagreeing with you. That\'s not the same as being difficult."' },
  { name: 'Either-or', chapter: 8, reply: '"I don\'t think those are the only two options."' },
  { name: 'The silent treatment', chapter: 9, reply: '"When you\'re ready to talk, I\'m here." Then carry on.' },
  { name: '"I\'m fine"', chapter: 9, reply: '"Okay. Let me know if that changes."' },
  { name: 'Going cold', chapter: 9, reply: '"You seem distant. Is something going on between us?"' },
  { name: 'Withholding affection', chapter: 9, reply: 'Name the pattern once, calmly, and consider outside support.' },
  { name: 'Ghosting or fading', chapter: 9, reply: 'One warm message, then let them choose.' },
  { name: 'The slow reply', chapter: 9, reply: 'Follow up once, with the facts.' },
  { name: 'The relationship on the line', chapter: 9, reply: '"If this is a dealbreaker for you, let\'s talk about that directly. I\'m not deciding under pressure."' },
  { name: 'Flattery before the ask', chapter: 10, reply: '"Thank you. Let me check and get back to you."' },
  { name: 'Love-bombing', chapter: 10, reply: '"I like you. I\'d like to take this more slowly."' },
  { name: 'Fake urgency', chapter: 10, reply: '"If it has to be decided now, my answer is no."' },
  { name: 'Yes now, details later', chapter: 10, reply: '"I\'ll be glad to decide once I know the details."' },
  { name: 'Borrowed intimacy', chapter: 10, reply: '"Thank you for trusting me. I can\'t help with this."' },
  { name: 'Future faking', chapter: 10, reply: '"Can we agree on a date?"' },
  { name: 'Foot in the door', chapter: 10, reply: '"I said I\'d look. I can\'t do the rest."' },
  { name: 'Moving goalposts', chapter: 10, reply: '"I\'ve done what we agreed. Let\'s talk about what was meant to follow."' },
  { name: 'The ladder of small yeses', chapter: 10, reply: 'Stop at a clear point and look at where it\'s heading.' },
  { name: 'Scope creep', chapter: 10, reply: 'List what you now do and ask for a decision about it.' },
  { name: '"Temporary" that never ends', chapter: 10, reply: '"Let\'s put an end date on this."' },
  { name: 'Testing the limit', chapter: 10, reply: 'Restate the limit once, then do what you said: "We agreed no calls after nine. I\'ll talk to you tomorrow."' },
  { name: 'The unreturned loan', chapter: 10, reply: '"When will you be able to pay that back?"' },
  { name: 'Raised voices, public pressure or ultimatums', chapter: 11, reply: 'If you feel safe: "I\'m not going to decide under pressure. I\'ll come back to this later." If you feel afraid, don\'t test a script.' },
  { name: 'Implied threats', chapter: 11, reply: 'Don\'t challenge the threat. Get help suited to the situation. Keep notes only if you can keep them safely.' },
  { name: 'Physical intimidation', chapter: 11, reply: 'Focus on safety. Leave if you can do so safely, and call 911 if you\'re in immediate danger.' },
  { name: 'Tracking, account checks or money control', chapter: 11, reply: 'Get safety advice before confronting the person or changing accounts and settings.' },
  { name: 'Stolen credit', chapter: 23, reply: 'Put your work in writing first, then: "Glad that\'s come up. I sent a summary on Monday. I can walk everyone through it."' },
  { name: 'High-pressure sales', chapter: 24, reply: '"I don\'t buy anything the same day. I\'ll think about it and get back to you."' },
  { name: 'Impersonation scams', chapter: 24, reply: 'Hang up. Call back on a number you find yourself.' },
  { name: 'Borrowed authority', chapter: 27, reply: '"I\'d want to see that or hear it directly before I take it on."' },
  { name: 'Called out in front of others', chapter: 27, reply: '"I\'d rather talk about that one-on-one."' },
  { name: 'The group that welcomes too fast', chapter: 27, reply: '"I\'ve enjoyed it. I\'m going to take my time before I sign up for anything more."' },
  { name: 'Doubts get a label', chapter: 27, reply: '"I\'d still like an answer to my question."' },
];

export const TACTICS: { name: string; chapter: number; reply: string }[] = byEdition({ v2: TACTICS_V2, v3: TACTICS_V3 });

const squash = (s: string) => s.toLowerCase().replace(/["'“”‘’]/g, '').replace(/^the\s+/, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Finds the book tactic a free-text name refers to (decodes may use slightly different wording). */
export function matchTactic(name: string) {
  const n = squash(name);
  if (!n) return null;
  return TACTICS.find((t) => squash(t.name) === n) || TACTICS.find((t) => n.includes(squash(t.name)) || squash(t.name).includes(n)) || null;
}

/** The playbook text from the book for each relationship (back-01-playbooks.md). */
const PLAYBOOKS_V2: Partial<Record<Relationship, string>> = {
  Boss: `THE BOSS (from the book's Playbooks)
Usual pattern: extra work without extra pay. Last-minute requests. Credit for your work going to others. Raises promised and postponed. Praise in private, silence in reviews.
What to say: "I'm at capacity right now. Which of my current projects should I move down the list to make room?" / "I'd like to set up thirty minutes to talk about my role and compensation." / "Just confirming what we agreed today..." (by email, after any important conversation)
Watch for: moving goalposts (Ch 15), flattery before the ask (Ch 14), implied threats about your review (Ch 16), future faking (Ch 14).
Go deeper: Chapter 22 for raises, Chapter 24 for making your work visible, Chapter 25 for making agreements stick.`,
  Coworker: `THE COWORKER (from the book's Playbooks)
Usual pattern: dropping work on your desk. Taking credit for your ideas. Asking you to cover "just this once," again and again. Gossip. Agreeing in meetings and undermining afterward.
What to say: "I can't take that on today. Have you checked with the team lead?" / "Thanks for picking up on the idea I raised earlier. Let me walk everyone through it." / "I've covered for you a few times this month. I can't keep doing that. Let's work out another plan."
Watch for: the ladder of small yeses (Ch 15), stolen credit (Ch 15), the martyr (Ch 11).
Go deeper: Chapter 24 for office politics, Chapter 15 for the slow squeeze.`,
  Partner: `THE PARTNER (from the book's Playbooks)
Usual pattern: unequal division of housework and family logistics. The silent treatment after disagreements. "If you loved me" requests. Jokes at your expense in front of others. Your needs coming last.
What to say: "I'd like us to list everything it takes to run the house and look at who does what." / "I can tell you're upset. When you're ready to talk about it, I'm here." / "I love you. I'm still not going to do this." / "Maybe it was meant as a joke. It didn't land that way for me, and I'd like you to stop."
Watch for: withdrawal (Ch 13), "if you loved me" (Ch 11), the minimizer (Ch 12). If you see the danger signs in Chapter 16, get support.
Go deeper: Chapter 21 for being heard, Chapter 19 for understanding what they really need.`,
  Ex: `THE EX (from the book's Playbooks)
Usual pattern: reopening old arguments. Using children, shared friends, or shared finances as bargaining chips. Guilt about the breakup. Rewriting what happened. Messages designed to provoke a reaction.
What to say: keep communication brief, factual, and focused on logistics. "I'm happy to discuss the pickup schedule. I'm not going to discuss the past." / "I'll respond to messages about the kids. I won't respond to the rest." Keep writing short, polite, to the point. Leave out emotion, blame and long explanations. Assume anything you write could be read by someone else later.
Watch for: rewriting the past (Ch 12), guilt (Ch 11), ultimatums and implied threats (Ch 16).
Go deeper: Chapter 12 for protecting your memory, Chapter 16 if you feel unsafe. With shared children or legal proceedings, take advice specific to the situation.`,
  Parent: `AGING PARENTS (from the book's Playbooks)
Usual pattern: increasing demands on your time. Guilt about not visiting enough. The expectation that you, especially if you live nearby or are the "responsible one," will handle everything. Old family roles snapping back into place.
What to say: "I can't come every weekend, but I'd love to call every Sunday and visit the first weekend of each month." / "I'm happy to keep doing the appointments. I need someone else to handle the bills and pharmacy." / "I know you've done a lot for me, and I'm grateful. I'm still not able to do this."
Watch for: the ledger (Ch 11), scope creep (Ch 15), caring too much (Ch 5).
Go deeper: Chapter 5 for caring without carrying, Chapter 23 for the Exposed Assumption ("whoever lives closest does everything").`,
  Sibling: `ADULT SIBLINGS (from the book's Playbooks)
Usual pattern: unequal sharing of family responsibilities. Old rivalries and childhood roles. One sibling who always needs rescuing. Disagreements about parents' care or money.
What to say: "I think there's an unspoken rule that I handle Mom's care because I live closest. I'd like to talk about whether that's fair." / "I've lent you money a few times now. I'm not going to lend more until the earlier loans are paid back." / "I'm not going to get involved in this argument between you and Dad."
Watch for: "everyone agrees with me" (Ch 12), the unreturned loan (Ch 15), the martyr (Ch 11).
Go deeper: Chapter 24 for alliances within the family, Chapter 23 for changing the frame.`,
  'In-law': `IN-LAWS (from the book's Playbooks)
Usual pattern: unsolicited advice. Criticism of your parenting, home, or choices. Expectations about holidays and visits. Your partner caught in the middle.
What to say: agree with your partner on the main boundaries first. Then: "Thanks for the suggestion. We've decided to do it differently." / "We'll be spending Christmas with my family this year. We'd love to see you on the weekend after." / "I'm not going to discuss our parenting decisions."
Watch for: public pressure at gatherings (Ch 16), the character test (Ch 11), visible suffering (Ch 11).
Go deeper: Chapter 21 for being heard, Chapter 24 for working as a team with your partner.`,
  Friend: `THE FRIEND WHO ALWAYS NEEDS SOMETHING (from the book's Playbooks)
Usual pattern: long calls about problems that never get solved. Favors that flow in one direction. Showing up when they need you, disappearing when you need them. A permanent crisis.
What to say: "I can talk for twenty minutes before I need to start dinner." / "Do you want advice, or do you just want me to listen?" / "I can't help this time. I hope it works out."
Watch for: borrowed intimacy (Ch 14), visible suffering (Ch 11), the ladder of small yeses (Ch 15).
Go deeper: Chapter 5 for caring without carrying, Chapter 9 for help with edges.`,
};

/** v3: relationship guides built from the new book's Part V chapters, Situation Finder and pattern quick reference. */
const PLAYBOOKS_V3: Partial<Record<Relationship, string>> = {
  Boss: `THE BOSS (from the book's Situation Finder and Chapter 23, Work, Pay, and Recognition)
Usual pattern: work that keeps landing on your desk until it becomes "your job". The 4:40 p.m. Friday task. Praise right before extra work. Credit for your work going to others. Raises and title reviews promised and postponed. Agreements remembered differently.
What to say: "My job has grown. I'm now doing [list]. I can't do all of it well. Which should come off my list?" / "I'd like to set up thirty minutes to talk about my pay. Would Thursday at two work?" / After a promotion went elsewhere: "I'm not asking you to reverse it. What would I need to show, specifically, for the answer to be yes next time?" / After any important conversation, a short written confirmation of the Smallest Agreed Step (a useful next action, with clear agreement on exactly what it covers).
Watch for: moving goalposts and scope creep (Ch 10), flattery before the ask (Ch 10), the story changing about what was agreed (Ch 8). A hint that your review could suffer if you don't agree: Ch 11 and Ch 28.
Go deeper: Chapter 23 for pay, credit and workload, Chapter 19 for making your work visible, Chapter 17 for the Clean Ask, Chapter 22 for making agreements stick.`,
  Coworker: `THE COWORKER (from the book's Situation Finder and Chapter 23)
Usual pattern: "just this once" cover that keeps coming back. Your idea repeated in a meeting as theirs. Work dropped on your desk. Agreeing in the meeting and nothing happening after.
What to say: "I've covered four Fridays. I can't keep doing it. Let's ask about coverage." / "Glad that's come up. I sent a summary on Monday with the numbers. I can walk everyone through it." / Privately: "Next time you're building on something I've done, could you mention it?" / A fair trade: "If I cover one of your Saturdays, you take one of my late Thursdays the same month."
Watch for: the slow creep (Ch 10), guilt about being the reliable one (Ch 7), a no that turns into "well, maybe" when they sigh (Ch 34, Say it again).
Go deeper: Chapter 23 for credit and workload, Chapter 20 for allies without debts, Chapter 22 for following through.`,
  Partner: `THE PARTNER (from the book's Situation Finder and Chapter 25, Dating, Intimacy, and Difficult Relationships)
Usual pattern: going quiet for days after a disagreement. "If you loved me, you would..." The same argument on repeat. Keeping the peace by always agreeing. Doing more of the housework and planning. Not feeling listened to.
What to say: "We keep having this argument and it never ends well. What is it really about for you?" / "I can tell you're upset. When you want to talk, I'm here." / "I love you. I'm still not going to do this." / A Clean Ask about the load at home: say what you want, give the relevant reason, and leave room for a real answer.
Watch for: silence and conditional warmth (Ch 9), "if you loved me" (Ch 7), denial of things you clearly remember (Ch 8). Judge behavior patterns, not labels (Ch 6). If they control the money, check your phone, track you, or you feel afraid: Chapter 11 first, and get help suited to the situation.
Go deeper: Chapter 25 for being an equal partner, Chapter 13 for listening without mind-reading, Chapter 17 for asking.`,
  Ex: `THE EX (from the book's Situation Finder and Chapter 25)
Usual pattern: rewriting agreements by text. Reopening old arguments inside a practical message. Telling people a different story about you. Still controlling the schedule or pickups.
What to say: keep messages short, polite and about one practical thing. Answer the practical part; leave the digs unanswered. "Our schedule has me picking the kids up at 5 on Thursdays. I'll be there at 5 this week as usual. If you'd like to change the schedule, please send me the proposal in writing." / "I'm happy to talk about the pickup schedule. I'm not going to discuss the past." / "Please don't ask the kids to decide the schedule." Assume anything you write could be read by someone else later. Keep messages and records where your ex can't reach them.
Watch for: the story changing (Ch 8), guilt (Ch 7), threats or monitoring (Ch 11). For a parenting plan, court order or custody question, talk to a family lawyer. If there is fear or control, talk to a domestic violence advocate before changing passwords or testing any limit.
Go deeper: Chapter 25 (after a separation), Chapter 8 for protecting your memory, Chapter 22 for confirming arrangements, Chapter 11 if you feel unsafe.`,
  Parent: `PARENTS AND AGING PARENTS (from the book's Situation Finder and Chapter 26, Family, Friends, and the Roles That Stick)
Usual pattern: a parent who still makes you feel small, often "out of concern". Comparisons with a sibling. "After everything I've done for you." Old family roles snapping back. Doing all the care for an aging parent because you live closest or are "the responsible one".
What to say: to a "concerned" comment about your looks or choices, "I know you care. I'm happy with my hair." To a comparison, "I'm glad she's doing well." Then nothing more. / "I've got about twenty minutes before I need to start dinner." / "You've done a lot for me, and I'm grateful. I still can't do this." / For care: list every task, then make a Clean Ask of each sibling for a specific part. Keep care tasks separate from medical decisions, which need the parent's wishes and qualified advice.
Watch for: the ledger and the martyr (Ch 7), the comparison (Ch 7), the Good Person Contract (Ch 3), caring without carrying (Ch 5).
Go deeper: Chapter 26 for parents and care, Chapter 3 for the roles you inherited, Chapter 7 for guilt and hidden debts.`,
  Sibling: `ADULT SIBLINGS (from the book's Situation Finder and Chapter 26)
Usual pattern: one sibling doing all the care. An unspoken rule about who hosts or who helps. The favorite. Disagreements about family money or an inheritance. A sibling who keeps borrowing.
What to say: "I'd like us to split the hosting this year. I can't take on all of it again. Which part would you be willing to take?" / On money: "I'm not suggesting anything's wrong. Could we ask Mom what she wants shared, and find out who's actually allowed to see or manage the accounts?" / On loans: "I'm not able to lend more until the first loan is sorted out."
Watch for: "everyone agrees with me" in the group chat (Ch 8), the unreturned loan (Ch 10), the martyr (Ch 7). For an inheritance or anything legal, take qualified advice.
Go deeper: Chapter 26 for siblings and family money, Chapter 2 for the Power Map of a family decision, Chapter 17 for asking.`,
  'In-law': `IN-LAWS (from the book's Situation Finder and Chapter 26)
Usual pattern: criticism of how you live. Expectations about holidays and visits. Your partner caught in the middle.
What to say: agree with your partner first. Then: "Thanks for the suggestion. We've decided to do it differently." / "We'll be with my family this year. We'd love to see you the weekend after."
Watch for: being called out in front of others (Ch 27), the character test (Ch 7), visible suffering (Ch 7).
Go deeper: Chapter 26 for friends and in-laws, Chapter 20 for allies (including inside a family), Chapter 25 for working as equals with your partner.`,
  Friend: `THE FRIEND WHO ALWAYS NEEDS SOMETHING (from the book's Situation Finder and Chapter 26)
Usual pattern: a friendship that feels one-sided. Favors that keep getting bigger. Money lent and not paid back. Going quiet after you said no. Long calls about the same problem.
What to say: "I can talk for twenty minutes before I need to start dinner." / "I can't help this time. I hope it works out." / "When will you be able to pay that back?" / If they went quiet: one warm message, then let them choose.
Watch for: the slow creep and the unreturned loan (Ch 10), visible suffering (Ch 7), silence after a no (Ch 9).
Go deeper: Chapter 26 for friends, Chapter 5 for caring without carrying, Chapter 24 for lending money.`,
};

const PLAYBOOKS: Partial<Record<Relationship, string>> = byEdition({ v2: PLAYBOOKS_V2, v3: PLAYBOOKS_V3 });

export function playbookFor(relationship: unknown): string {
  return PLAYBOOKS[normalizeRelationship(relationship)] || '';
}

/** Words that suggest someone may be unsafe. Used to show the hotline. */
const DANGER = /\b(hit|hits|hitting|punch(ed|es)?|slap(ped|s)?|chok(e|ed|ing)|strangl|kick(ed|s)?|shov(e|ed)|push(ed)? me|beat(s|en)? me|threat(en|ened|ening|s)? to (kill|hurt)|kill (me|you|myself)|hurt me|weapon|gun|knife|stalk|follow(s|ed|ing) me|tracking my|afraid for my (life|safety)|scared for my (life|safety)|not safe|unsafe|locked me|won'?t let me leave)\b/i;

export function soundsUnsafe(...texts: (string | null | undefined)[]) {
  return texts.some((t) => !!t && DANGER.test(t));
}

export const HOTLINE =
  'US National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788. If you are in immediate danger, call 911.';

/** Rules shared by every prompt in this area. */
export const VOICE_RULES = `VOICE AND RULES
- You are a calm, warm guide built on the book ${BOOK.quotedWithAuthor}. ${byEdition({
  v2: 'The reader is a kind person who keeps getting guilt-tripped, pressured or overlooked. They stay kind; they just stop being easy to use.',
  v3: 'The reader is a capable, kind adult who wants more say in their own life without becoming controlling or cruel. "Power" in the book means having a say in what happens to you.',
})}
- Plain everyday English. Short sentences. No jargon, no psychology labels, no diagnosing anyone (never call someone a narcissist or similar).
- Defense first: help the reader see what is happening, answer calmly, and ask for what they are owed fairly.
- Fair influence only. Never help deceive, covertly control, exploit someone's insecurities, or "manipulate" anyone. If asked, gently offer the fair version instead (${byEdition({ v2: "Chapter 26, The Line You Don't Cross", v3: 'Chapter 30, Power Without Becoming What You Resent, and its Four Fair Influence Tests: Is it honest? Do they know what they are agreeing to? Can they make a real choice without unfair pressure or punishment? Am I using my power responsibly?' })}).
- No spy or combat words: never say target, operative, mission, warfare, weapon, frame control, NLP, dark psychology, counter-script, leverage, or "maximum impact".
- Never use em-dashes or en-dashes. Use commas, periods or parentheses.
- Never invent statistics, studies or quotes.
- If anything suggests the reader may be unsafe (violence, threats, stalking, being afraid to leave), say so kindly and first, and give this line exactly: ${HOTLINE} You are not a therapist and never claim to be.${byEdition({ v2: '', v3: `\n- ${TOOLS_V3_RULE.replace(/\n/g, '\n  ')}` })}`;

/* ------------------------------------------------------------------ */
/* Data helpers shared by the people routes                            */
/* ------------------------------------------------------------------ */

export type HowItWent = 'landed' | 'mixed' | 'didnt' | 'unsure';

export type Interaction = {
  id: string;
  date: string;
  whatHappened: string;
  whatTheySaid?: string;
  whatISaid?: string;
  howItWent: HowItWent;
  tactics: string[];
  read?: string;
  worked?: string;
  unsafe?: boolean;
};

export type TacticCount = { name: string; chapter: number | null; count: number; lastSeen: string | null };

export type HandleSummary = {
  approach: string;
  dos: string[];
  donts: string[];
  sayThis: string[];
  pressureNote: string | null;
  chapters: { chapter: number; title: string }[];
  generatedAt: string;
};

export type Decode = { id: string; date: string; text: string; tactics: string[]; whatsHappening: string | null; pressure: 'low' | 'some' | 'a lot' | null };

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Older rows stored interactions as { summary, outcome 1-5, techniques }. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapInteraction(i: any): Interaction {
  const outcome = Number(i?.outcome);
  const legacyWent: HowItWent = outcome >= 4 ? 'landed' : outcome === 3 ? 'mixed' : outcome > 0 ? 'didnt' : 'unsure';
  return {
    id: String(i?.id || `${i?.date || ''}-${Math.random().toString(36).slice(2, 8)}`),
    date: str(i?.date, 40) || new Date().toISOString(),
    whatHappened: str(i?.whatHappened) || str(i?.summary),
    whatTheySaid: str(i?.whatTheySaid) || undefined,
    whatISaid: str(i?.whatISaid) || undefined,
    howItWent: (['landed', 'mixed', 'didnt', 'unsure'].includes(i?.howItWent) ? i.howItWent : legacyWent) as HowItWent,
    tactics: Array.isArray(i?.tactics) ? i.tactics.map((t: unknown) => str(t, 80)).filter(Boolean) : [],
    read: str(i?.read) || undefined,
    worked: str(i?.worked) || undefined,
    unsafe: Boolean(i?.unsafe),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSummary(pb: any): HandleSummary | null {
  if (!pb || typeof pb !== 'object' || typeof pb.approach !== 'string' || !pb.approach.trim()) return null;
  const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 400)).filter(Boolean) : []);
  return {
    approach: pb.approach,
    dos: list(pb.dos),
    donts: list(pb.donts),
    sayThis: list(pb.sayThis),
    pressureNote: str(pb.pressureNote) || null,
    chapters: Array.isArray(pb.chapters)
      ? pb.chapters
          .map((c: { chapter?: unknown }) => Number(c?.chapter))
          .filter((n: number) => CHAPTERS[n])
          .map((n: number) => ({ chapter: n, title: CHAPTERS[n] }))
      : [],
    generatedAt: str(pb.generatedAt, 40),
  };
}

/** Decode rows saved to a person (analysis_history.person_id). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDecode(r: any): Decode {
  const tactics = (Array.isArray(r?.tactics) ? r.tactics : [])
    .map((t: unknown) => (typeof t === 'string' ? t : str((t as { tactic?: string; name?: string })?.tactic || (t as { name?: string })?.name, 80)))
    .filter(Boolean);
  const full = r?.full_result && typeof r.full_result === 'object' ? r.full_result : {};
  const fullTactic = str(full.tactic, 80);
  if (fullTactic && !tactics.some((t: string) => t.toLowerCase() === fullTactic.toLowerCase())) tactics.unshift(fullTactic);
  const pressure = ['low', 'some', 'a lot'].includes(full.pressure) ? full.pressure : null;
  return {
    id: r.id,
    date: r.created_at,
    text: str(r.input_text, 600),
    tactics,
    whatsHappening: str(r.overall_assessment, 600) || str(full.whatsHappening, 600) || null,
    pressure,
  };
}

/** Adds up how often each tactic shows up across interactions, decodes and stored tallies. */
export function tallyTactics(interactions: Interaction[], decodes: Decode[], stored: unknown): TacticCount[] {
  const map = new Map<string, TacticCount>();
  const add = (raw: string, date: string | null, n = 1) => {
    const t = matchTactic(raw);
    const name = t ? t.name : raw.trim();
    if (!name) return;
    const key = name.toLowerCase();
    const cur = map.get(key) || { name, chapter: t?.chapter ?? null, count: 0, lastSeen: null };
    cur.count += n;
    if (date && (!cur.lastSeen || date > cur.lastSeen)) cur.lastSeen = date;
    map.set(key, cur);
  };
  for (const i of interactions) for (const t of i.tactics) add(t, i.date);
  for (const d of decodes) for (const t of d.tactics) add(t, d.date);
  if (Array.isArray(stored)) {
    for (const s of stored) if (s && typeof s.name === 'string') add(s.name, s.lastSeen || null, Number(s.count) || 1);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || String(b.lastSeen).localeCompare(String(a.lastSeen)));
}
