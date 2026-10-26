import type { ProblemSections } from '../sections';

/**
 * v2 sections for /b/gaslighting (he denies things happened: "That never happened.").
 * Sources: Ch 6 (Joanne and Tom, What about narcissists?), Ch 8 (the common ways a story changes, when the story
 * spreads), Ch 9 (how to respond without chasing), Ch 4 (what the voice says), Ch 11 (records only if safe).
 * Tactic cards only use moves the free tool does not already cover (it covers denial, minimizing, blame-shifting,
 * rewriting the past and "everyone agrees with me").
 */
const s: ProblemSections = {
  replay: {
    kicker: `The dinner`,
    title: `He says “I never said that.” Here’s the next day.`,
    log: [
      { t: `Tue 7:12 p.m.`, h: 19, m: 12, line: `At dinner, you mention Saturday: your sister’s birthday lunch.` },
      { t: `Tue 7:13 p.m.`, h: 19, m: 13, line: `He puts his fork down. “I never said I’d go to that.”`, mark: `“I never said I’d go to that.”` },
      { t: `Tue 7:14 p.m.`, h: 19, m: 14, line: `“You did. Two weeks ago, in the kitchen. You said, ‘Sure, put it on the calendar.’”` },
      { t: `Tue 7:15 p.m.`, h: 19, m: 15, line: `“I said no such thing. You do this all the time. You decide something and then tell me I agreed.”` },
      { t: `Tue 7:17 p.m.`, h: 19, m: 17, line: `Maybe he said “maybe.” Maybe you heard what you wanted to hear. You apologize.`, mark: `You apologize.` },
      { t: `Wed 3:10 p.m.`, h: 15, m: 10, line: `On your afternoon break, you type the same search three times: “is my husband a narcissist.”` },
    ],
    outro: `He went back to his dinner. You ended up with eleven tabs open, and went back to work more confused than when you started.`,
    note: `Adapted from Joanne’s dinner, a worked example that opens Chapter 6. What she did next is in {ref}.`,
    noteRef: { ch: 6, section: `Joanne's next step` },
  },

  loop: {
    kicker: `Why it keeps happening`,
    title: `When you apologize to end it, his version can stick.`,
    body: [
      `When you’re upset and he’s certain, it’s easiest to accept his story just to end it. The argument stops. Nothing gets decided.`,
      `Next time a plan is disputed, the same pattern can repeat. Over months, you can stop trusting your own memory.`,
    ],
    steps: [
      { icon: `speech`, t: `He denies it` },
      { icon: `head`, t: `You doubt yourself` },
      { icon: `smooth`, t: `You apologize` },
      { icon: `learn`, t: `His version can stick` },
    ],
    center: `“That never happened”`,
  },

  tactics: {
    kicker: `Chapters 4, 8 and 9`,
    title: `5 more moves, and what the book says to do.`,
    lead: `The free part covers denial and four other ways people distort events. These are moves that may come next.`,
    items: [
      { name: `Fog`, ch: `Chapter 8`, says: `Long, circling answers. A new topic every time you get close to the point. Something you did in 2014.`, reply: `Pick one short sentence and keep coming back to it: “I want to come back to my question.”`, art: `t-squeeze` },
      { name: `The Messenger`, ch: `Chapter 8`, says: `Someone carries his side to you: “Mom’s really hurt by what you said.”`, reply: `Decline to be a messenger: “If she’s upset with me, I’d rather she told me herself.”`, art: `t-group` },
      { name: `The Smear`, ch: `Chapter 8`, says: `A relative says, “I heard you’ve been difficult about the house.” A friend goes oddly quiet.`, reply: `Speak for yourself, briefly, to the people who matter. Don’t run a counter-campaign. Let your actions do most of the work.`, art: `t-rewrite` },
      { name: `Silence After You Disagree`, ch: `Chapter 9`, says: `Hours or days of short, cold answers. “I’m fine.”`, reply: `“I can tell you’re upset. When you want to talk, I’m here.” Say it once, carry on with your day, and don’t change your decision just to end the silence.`, art: `t-silence` },
      { name: `The Voice That Agrees With Him`, ch: `Chapter 4`, says: `In your own head: “Maybe you misremembered.” “You’re too sensitive.”`, reply: `Ask: does that sound like someone I know? If it does, hearing the line as theirs can take away some of its authority. Either way, you can still check what it says.`, art: `t-intimidate` },
    ],
  },

  reset: {
    closeLine: `Three weeks from now, he may still say it never happened. You just won’t apologize for remembering.`,
  },

  forYou: {
    lines: [
      [`speech`, `He says [[“that never happened”]] and you walk away unsure of yourself.`],
      [`smooth`, `You’ve [[apologized for things you’re not sure you did]], just to end it.`],
      [`calendar`, `Plans you made out loud [[keep turning into something else]] later.`],
      [`pen`, `You want [[something to do after the argument]], not another checklist about him.`],
    ],
    notFor: [
      [`head`, `You want proof he’s a narcissist. The book won’t diagnose anyone.`],
      [`push`, `You want him to admit it. No record or reply can make that happen.`],
      [`book`, `You want therapy or legal advice. The book points you to the right people.`],
      [`shield`, `He checks your phone, or you’re afraid of him. Read Chapter 11 before you keep any record, and talk to a trained advocate.`],
    ],
  },

  alternatives: {
    kicker: `What people usually try`,
    title: `What people try when he says “that never happened,” and what helps.`,
    items: [
      [`Proving it with every detail`, `You list the details. He gets more certain. Another round may add nothing.`],
      [`Gaslighting checklists online`, `Eleven tabs, four different answers, and more confusion than before.`],
      [`Apologizing to end it`, `The argument stops. His account can become the official story.`],
      [`Getting others on your side`, `A counter-campaign widens the fight and often makes you look like the problem.`],
      [`Waiting for him to admit it`, `You can’t make anyone admit what happened. You can decide what happens next.`],
    ],
    included: [
      `What to do when he denies the texts that are right there`,
      `What to say when his version reaches your family`,
      `How to raise a better way of making plans, at a calm time`,
      `How to tell gaslighting from a real misunderstanding, including your own mistakes`,
      `When it isn’t safe to keep records, and where to get help (Chapter 11)`,
      `A companion app that suggests what tactic might be at work in his message, and a calm reply`,
    ],
  },

  freeChapter: {
    title: `Get a free chapter by email first.`,
    lead: `It explains why an argument keeps replaying in your head afterward, and what the replay is telling you. When you’re ready, Chapter 8 on the story that keeps changing is in the book.`,
  },
};

export default s;
