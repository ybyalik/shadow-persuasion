import type { ProblemSections } from '../sections';

/**
 * v2 sections for /b/narcissistic-ex (an ex who turns every co-parenting and pickup text into a fight).
 * Sources: Ch 25 "After a separation: when your ex still controls everything" (Angela and Craig, records, privacy and
 * passwords), Ch 8 (the common ways a story changes, when the story spreads), Ch 9 (when you can't avoid contact,
 * grey rock), Ch 11 (A hard conversation, or a dangerous one).
 * Tactic cards only use moves the free tool does not already cover (it covers the schedule change, the digs, the
 * rewritten agreement, the kids, the message flood and the last word).
 */
const s: ProblemSections = {
  replay: {
    kicker: `The 9:40 text`,
    title: `Your ex texts about pickup. Here’s the next 21 minutes.`,
    log: [
      { t: `Tue 9:40 p.m.`, h: 21, m: 40, line: `Your phone buzzes. The kids are asleep. You’re folding laundry. It’s your ex.` },
      { t: `Tue 9:41 p.m.`, h: 21, m: 41, line: `“Since you obviously can’t handle Thursdays, I’ll pick the kids up from school at 3 from now on.”`, mark: `from now on.”` },
      { t: `Tue 9:42 p.m.`, h: 21, m: 42, line: `“Maybe if you didn’t work until 6 every night you’d remember what they actually need.”` },
      { t: `Tue 9:44 p.m.`, h: 21, m: 44, line: `Thursday is yours. It has been for two years. Your thumbs are already moving.` },
      { t: `Tue 9:58 p.m.`, h: 21, m: 58, line: `Three paragraphs: every Thursday you never missed, the recital they forgot, the new partner. You read it back and feel the old knot.`, mark: `the old knot.` },
      { t: `Tue 10:01 p.m.`, h: 22, m: 1, line: `You delete it all and put the phone face down on the cushion.` },
    ],
    outro: `The divorce is finished. Somehow you are still having the same argument, at 9:40 at night, in your own living room.`,
    note: `Adapted from Angela’s 9:40 text, a worked example in {ref}.`,
    noteRef: { ch: 25, section: `After a separation: when your ex still controls everything` },
  },

  loop: {
    kicker: `Why it keeps happening`,
    title: `Each defense can give your ex something new to argue with.`,
    body: [
      `Defending your parenting, mentioning the recital or explaining your hours can give them more to argue about.`,
      `So the next pickup text can come with more digs, and the same argument starts again in your living room.`,
    ],
    steps: [
      { icon: `push`, t: `They send digs` },
      { icon: `speech`, t: `You defend yourself` },
      { icon: `learn`, t: `They get more to argue with` },
      { icon: `weight`, t: `Next text, more digs` },
    ],
    center: `Every pickup`,
  },

  tactics: {
    kicker: `Chapters 8, 9, 11 and 25`,
    title: `7 more moves from an ex, and what the book says to do.`,
    lead: `The free replies cover the pickup change, the digs, the rewritten agreement and the kids. These are moves that may come next.`,
    items: [
      { name: `Fog`, ch: `Chapter 8`, says: `Long, circling answers. A new topic every time you get close to the point. Something you did in 2014.`, reply: `Pick one short sentence and keep coming back to it: “I want to come back to my question.”`, art: `t-squeeze` },
      { name: `Blame-Shifting`, ch: `Chapter 8`, says: `“You made me do it.” “If you hadn’t pushed, I wouldn’t have yelled.”`, reply: `“I’m happy to talk about what I said. I’m not taking responsibility for what you did.”`, art: `t-rewrite` },
      { name: `The Messenger`, ch: `Chapter 8`, says: `A relative calls on their behalf: “Mom’s really hurt by what you said.”`, reply: `Decline to be a messenger: “If she’s upset with me, I’d rather she told me herself.”`, art: `t-group` },
      { name: `The Smear`, ch: `Chapter 8`, says: `A friend goes oddly quiet. A relative says, “I heard you’ve been difficult about the house.”`, reply: `Speak for yourself, briefly, to the people who matter. Don’t run a counter-campaign. Let your actions do most of the work.`, art: `t-charm` },
      { name: `Bait at Every Handover`, ch: `Chapter 9`, says: `Coldness or provocation every time you have to deal with them.`, reply: `Only if you aren’t afraid of them: keep it brief, factual and calm. “Pickup is at five on Friday. I’ll bring the soccer bag.” If you are afraid, talk to an advocate before you change anything.`, art: `t-silence` },
      { name: `Watching Your Phone`, ch: `Chapter 25`, says: `They seem to know where you were, or what you texted someone else.`, reply: `Don’t start by changing passwords: changes can alert someone who’s watching. Talk to a domestic violence advocate first, from a device they can’t access.`, art: `t-intimidate` },
      { name: `When It Becomes Danger`, ch: `Chapter 11`, says: `Following you, showing up where you are, threats about you or the kids.`, reply: `No text fixes this, and a calm reply can sometimes make it worse. Trust the fear and talk to someone trained, like a domestic violence advocate. If you or the kids are in immediate danger, call 911.`, art: `t-urgency` },
    ],
  },

  reset: {
    closeLine: `Three weeks from now, your ex may still send the 9:40 text. You just won’t write the three paragraphs.`,
  },

  forYou: {
    lines: [
      [`speech`, `One text about pickup [[comes back as three paragraphs about you.]]`],
      [`moon`, `You’ve [[typed long, angry replies at night]], then deleted them.`],
      [`pen`, `Your ex [[says you agreed to things you didn’t]], or says “ask the kids.”`],
      [`hand`, `You want [[short, polite replies you can actually send.]]`],
    ],
    notFor: [
      [`briefcase`, `You want custody tactics or legal advice. For that, talk to a family lawyer.`],
      [`head`, `You want your ex diagnosed. The book judges behavior, not people.`],
      [`push`, `You want a reply that wins, or gets back at them.`],
      [`shield`, `You’re afraid of your ex, or they monitor you. A script isn’t the answer there. Talk to a domestic violence advocate first (Chapter 11 explains how).`],
    ],
  },

  alternatives: {
    kicker: `What people usually try`,
    title: `What people try with a narcissistic ex, and what settles the pickup.`,
    items: [
      [`The long reply that sets the record straight`, `Each defense can give them something new to argue with.`],
      [`Answering at 9:40 p.m.`, `Angela waited until the next morning, after coffee. Unless it’s urgent for the kids, yours can wait too.`],
      [`Asking the kids what they want`, `Children shouldn’t be asked to choose between parents or carry messages.`],
      [`Ignoring everything`, `The digs can go unanswered. The pickup still needs a reply.`],
      [`Waiting for them to be fair`, `No reply can make them communicate fairly. It can keep you out of the fight.`],
    ],
    included: [
      `The one-line text to send after a phone call, so what you agreed is in writing`,
      `What to do when they deny the messages that are right there`,
      `What Luis did when the record showed he was the one who got it wrong`,
      `What to say when your ex’s version reaches friends and family`,
      `When contact crosses into danger, and where to get help (Chapter 11)`,
      `A companion app that suggests what tactic might be at work in a text, and a calm reply`,
    ],
  },

  freeChapter: {
    title: `Get a free chapter by email first.`,
    lead: `It explains why a late-night text keeps replaying in your head, and what the replay is telling you. When you’re ready, Chapters 8 and 25 are in the book.`,
  },
};

export default s;
