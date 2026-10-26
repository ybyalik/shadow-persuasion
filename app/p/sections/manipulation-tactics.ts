/**
 * v2 sections for /b/manipulation-tactics (9 manipulation tactics people use on you).
 * Sources: Ch 6 (One moment tells you very little), Ch 7 (ledger, hidden-price favor, character test, "If you loved me",
 * martyr), Ch 8 (the common ways a story changes, triangulation), Ch 9 (silence), Ch 10 (pleasant pressure, the slow
 * squeeze, slow it down), Ch 11 (danger), Ch 26 (Darnell and Yvonne, "When past help becomes a claim on your time").
 * The 8 tactic cards are moves the free cheat sheet does NOT cover; every reply is the chapter's own line.
 */
import type { ProblemSections } from '../sections';

const s: ProblemSections = {
  replay: {
    kicker: `How it happens`,
    title: `One no. Three tactics in four minutes.`,
    log: [
      { t: `Fri 6:40 p.m.`, h: 18, m: 40, line: `Your sister's car is in the shop. She assumes you'll drive her to work every day next week. You offer Tuesday.` },
      { t: `6:41 p.m.`, h: 18, m: 41, line: `"After everything I did with your move, you can't do this?"`, mark: `After everything I did with your move` },
      { t: `6:43 p.m.`, h: 18, m: 43, line: `"So you only take favors. You don't return them."` },
      { t: `6:44 p.m.`, h: 18, m: 44, line: `"Forget it." She hangs up.` },
      { t: `9:20 p.m.`, h: 21, m: 20, line: `No reply to your text. Your thumb hovers over "Fine, I'll do the whole week."` },
      { t: `9:21 p.m.`, h: 21, m: 21, line: `You're unsure what just happened, but you're close to giving in.` },
    ],
    outro: `First she brought up what she did for you, then judged your character, then went silent. None of it was a request you could easily refuse. The book names each tactic, so you can spot it while it's happening.`,
    note: `Adapted from Darnell's example in Chapter 26. What he said each time, and how he kept his Tuesday offer, word for word: {ref}.`,
    noteRef: { ch: 26, section: `Caring for an aging parent without doing it all alone` },
  },
  loop: {
    kicker: `Why the same tactic comes back`,
    title: `When a tactic works, it often gets used again.`,
    body: [
      `Nobody needs to plan it. Pressure that works often gets used again.`,
      `The guilt trip that got a yes in March can come back in April. The silence that ended with your apology can become how disagreements end.`,
    ],
    steps: [
      { icon: `push`, t: `They push` },
      { icon: `smooth`, t: `You give in` },
      { icon: `learn`, t: `It works` },
      { icon: `weight`, t: `They push again` },
    ],
    center: `The pressure loop`,
  },
  tactics: {
    kicker: `Not on the free sheet`,
    title: `Eight more moves from the book, and the calm reply to each.`,
    lead: `The cheat sheet covers 9. These come from Chapters 7, 8 and 10.`,
    items: [
      { name: `The Character Test`, ch: `Chapter 7`, says: `"I thought you were someone I could count on."`, reply: `"I can be someone you count on and still not be able to do this."`, art: `t-group` },
      { name: `Flattery Before the Ask`, ch: `Chapter 10`, says: `"You're the only one on the team I trust with this."`, reply: `"That's kind of you. I can't take it on this week."`, art: `t-charm` },
      { name: `Borrowed Intimacy`, ch: `Chapter 10`, says: `"I've never told anyone this." A week later, a request.`, reply: `"Thank you for trusting me with that. I can't help with this, though."`, art: `t-charm` },
      { name: `Future Faking`, ch: `Chapter 10`, says: `"Once this project's done, you'll get the promotion."`, reply: `"That sounds good. Can we agree on a date and put it in writing?"`, art: `t-urgency` },
      { name: `Moving Goalposts`, ch: `Chapter 10`, says: `"Bring in ten accounts and we'll talk about a raise." Then: "Let's see if you can keep it up another quarter."`, reply: `"In March, the goal was ten accounts. I brought in twelve. I'd like to talk about the raise."`, art: `t-squeeze` },
      { name: `"Temporary" That Never Ends`, ch: `Chapter 10`, says: `"Just until I find a place."`, reply: `"Happy to help until the end of March. Let's check in then."`, art: `t-squeeze` },
      { name: `"Everyone Agrees With Me"`, ch: `Chapter 8`, says: `"Your brother thinks you overreacted."`, reply: `"Other people can have their views. I'm talking with you."`, art: `t-group` },
      { name: `Pressure Through a Third Person`, ch: `Chapter 8`, says: `"Mom's really hurt by what you said."`, reply: `"If she's upset with me, I'd rather she told me herself."`, art: `t-rewrite` },
    ],
  },
  reset: {
    closeLine: `Three weeks from now, the same people may use the same tactics. You just won't give in the way you used to.`,
  },

  forYou: {
    lines: [
      [`speech`, `"After everything I've done for you" [[makes your no disappear.]]`],
      [`moon`, `You leave arguments [[unsure what was actually said.]]`],
      [`clock`, `"I need an answer today" [[gets a yes]] you regret by Friday.`],
      [`eye`, `You want to know if it's [[a pattern or a bad day]] before you accuse anyone.`],
      [`compass`, `You want [[calm replies you can say out loud]], not clever comebacks.`],
    ],
    notFor: [
      [`push`, `You want to learn to manipulate people`],
      [`queen`, `You want a label to pin on someone after one argument`],
      [`head`, `You are looking for a replacement for therapy`],
    ],
  },
  alternatives: {
    kicker: `What people usually try`,
    title: `The usual fixes, and what actually changes it.`,
    items: [
      [`Arguing about what really happened`, `Another round about the past may add nothing. The decision in front of you still needs an answer.`],
      [`Calling them a narcissist`, `A label can start a fight about their character. The book helps you respond to their behavior.`],
      [`Explaining yourself better`, `Every extra reason becomes a new thing to dispute.`],
      [`Going silent back`, `It turns into a contest about who can hold out longer.`],
      [`Waiting for them to change`, `While the tactic keeps working, it may keep coming back.`],
    ],
    included: [
      `The 9 tactics, what each sounds like, and a calm reply for each`,
      `Worked conversations where the other person argues back`,
      `How to tell a bad moment from a pattern, without diagnosing anyone`,
      `The Tactic Spotter: more than 40 pressure moves, a bonus with the book`,
      `The signs that a calm reply is the wrong tool, and what to do instead`,
      `A 21-day reset of small daily practices`,
    ],
  },
  freeChapter: {
    title: `Start with a free chapter instead.`,
    lead: `It's about the conversation you keep replaying, the one where "after everything I've done" won: why the right words show up hours late, and what the replay is telling you.`,
  },
};

export default s;
