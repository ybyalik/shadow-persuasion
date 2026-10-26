/**
 * v2 sections for /b/people-pleasing (said yes again to something you didn't want to do).
 * Sources: Ch 3 (The Good Person Contract, the instant yes, Gloria), Ch 5 (Notice, Pause, Hold; Caring without carrying;
 * the mailbox pause), Ch 7 (duties/favors/agreements, the guilt patterns, taking back a yes, Hector), Ch 10 (flattery,
 * the ladder of small yeses), Ch 26 (The hour after the call), Ch 31 (Quick Start), Ch 34 (Day 16 guilt line).
 */
import type { ProblemSections } from '../sections';

const s: ProblemSections = {
  replay: {
    kicker: `The instant yes`,
    title: `It comes out before they finish asking.`,
    log: [
      { t: `Tue 4:52 p.m.`, h: 16, m: 52, line: `He leans into your doorway. "Could you train the new hire next week? And pull the holiday lunch together again? Nobody does it like you."` },
      { t: `4:53 p.m.`, h: 16, m: 53, line: `"Of course," you say. Before he has finished the second question.`, mark: `Before he has finished the second question.` },
      { t: `4:58 p.m.`, h: 16, m: 58, line: `He thanks you and leaves. You look at your calendar. Next week is quarter-end, your busiest week.` },
      { t: `6:15 p.m.`, h: 18, m: 15, line: `Driving home, you rehearse what you should have said.` },
      { t: `6:31 p.m.`, h: 18, m: 31, line: `Then you argue yourself out of it. He was so nice about it. It would be awkward to go back now.` },
      { t: `11:40 p.m.`, h: 23, m: 40, line: `Nobody asked if you had time. And you didn't say a word.` },
    ],
    outro: `Nobody forced you. You said yes before you had time to think. The book calls it [[the instant yes]], and it teaches people that your time needs no thought.`,
    note: `Adapted from Gloria's afternoon in Chapter 3. The instant yes, and five more habits that teach people to ask you first: {ref}.`,
    noteRef: { ch: 3, section: `What other people learn from you` },
  },
  loop: {
    kicker: `Why they keep asking you`,
    title: `Each instant yes can teach them to ask you first.`,
    body: [
      `Most of the people who ask aren't scheming. Your coworker simply learned that you never say no, so she asks you first.`,
      `Each yes makes the next one feel more natural. One covered shift becomes a morning, then a week.`,
    ],
    steps: [
      { icon: `speech`, t: `They ask` },
      { icon: `smooth`, t: `You say yes` },
      { icon: `learn`, t: `They learn` },
      { icon: `weight`, t: `They ask first` },
    ],
    center: `The instant-yes loop`,
  },
  tactics: {
    kicker: `What they say to get the yes`,
    title: `Eight lines that turn your no into "Okay, I'll do it."`,
    lead: `What each one sounds like, and the calm reply from the book.`,
    items: [
      { name: `The Character Test`, ch: `Chapter 7`, says: `"I thought you were someone I could count on."`, reply: `"I can be someone you count on and still not be able to do this."`, art: `t-group` },
      { name: `The Ledger`, ch: `Chapter 7`, says: `"After everything I've done for you..."`, reply: `"You've done a lot for me, and I'm grateful. I still can't do this."`, art: `t-guilt` },
      { name: `The Favor With a Hidden Price`, ch: `Chapter 7`, says: `"I helped with your move, so I figured you wouldn't mind watching the dog."`, reply: `"That was kind of you, and I appreciated it. I can't take the dog this weekend."`, art: `t-squeeze` },
      { name: `"If You Loved Me"`, ch: `Chapter 7`, says: `"If you loved me, you'd do this."`, reply: `"I love you. I'm not going to do this."`, art: `t-charm` },
      { name: `Flattery Before the Ask`, ch: `Chapter 10`, says: `"You're the only one on the team I trust with this."`, reply: `"That's kind of you. I can't take it on this week."`, art: `t-charm` },
      { name: `The Martyr`, ch: `Chapter 7`, says: `"Don't worry, I'll do it myself, like always."`, reply: `"Okay. Let me know if you want help with something specific."`, art: `t-silence` },
      { name: `Fake Urgency`, ch: `Chapter 10`, says: `"I need an answer by end of day."`, reply: `"If it has to be decided now, my answer is no."`, art: `t-urgency` },
      { name: `The Ladder of Small Yeses`, ch: `Chapter 10`, says: `"Could you look at this for five minutes?" Then: "Actually, could you rewrite the section?"`, reply: `"I said I'd take a quick look. I can't take on the rewrite."`, art: `t-squeeze` },
    ],
  },
  reset: {
    closeLine: `Three weeks from now, they will still ask. You just won't answer before they finish.`,
  },

  forYou: {
    lines: [
      [`hand`, `You [[say yes before they finish asking.]]`],
      [`clock`, `It's on your calendar now, and you're [[dreading it.]]`],
      [`speech`, `You give [[five reasons for a no]], and they argue with all five.`],
      [`moon`, `You [[rehearse what you should have said]] the whole drive home.`],
      [`compass`, `You want to stay generous. You just want to [[choose who gets your yes.]]`],
    ],
    notFor: [
      [`push`, `You want tricks to make people happy about your no`],
      [`receipt`, `You want out of a signed contract or money already spent. Get proper advice first`],
      [`head`, `You are looking for a replacement for therapy`],
    ],
  },
  alternatives: {
    kicker: `What people usually try`,
    title: `The usual fixes for always saying yes.`,
    items: [
      [`Promising yourself "next time I'll say no"`, `Next time, the yes can still come out in under two seconds.`],
      [`Giving five good reasons`, `Five reasons give them five things to argue with.`],
      [`Saying yes, then resenting it`, `They still ask you first. Now you dread it too.`],
      [`Getting harder and colder`, `It isn't who you are. The book's aim is the middle ground: kind, and also clear.`],
      [`Waiting for them to stop asking`, `Most of them aren't scheming. Many have just learned that you say yes.`],
    ],
    included: [
      `The text that takes back a yes, and Hector's whole call`,
      `The one sentence that buys you time before the next yes`,
      `Calm replies to "After everything I've done" and "I thought I could count on you"`,
      `The Good Person Contract: the five rules saying yes for you`,
      `A 4-step plan for the guilty hour after a no`,
      `A 21-day practice that starts with a three-day Quick Start`,
    ],
  },
  freeChapter: {
    title: `Start with a free chapter instead.`,
    lead: `It's about the conversation you keep replaying, like the yes you gave in under two seconds: why the right words show up hours late, and what the replay is telling you.`,
  },
};

export default s;
