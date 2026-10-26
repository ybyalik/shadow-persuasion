import type { ProblemSections } from '../sections';

/**
 * v2 sections for /b/narcissistic-parent (a critical, guilt-tripping mother).
 * Sources: Ch 26 "The parent who still makes you feel small" (Gabriela's Sunday call, "come today" with Hank and Calvin,
 * Scott and Warren), Ch 7 (the martyr, visible suffering, the character test, "If you loved me", the favor with a
 * hidden price), Ch 6 (What about narcissists?), Ch 28 (four paths).
 * Tactic cards only use moves the free replies do not already cover.
 */
const s: ProblemSections = {
  replay: {
    kicker: `The Sunday call`,
    title: `Your mother’s Sunday call, minute by minute.`,
    log: [
      { t: `Sun 4:00 p.m.`, h: 16, m: 0, line: `You call your mother, like every Sunday. “Good, Mom. Busy week.”` },
      { t: `Sun 4:01 p.m.`, h: 16, m: 1, line: `“You sound tired. Are you sleeping?”` },
      { t: `Sun 4:02 p.m.`, h: 16, m: 2, line: `“I’m only saying this because I care. Have you thought about doing something with your hair?”`, mark: `because I care.` },
      { t: `Sun 4:03 p.m.`, h: 16, m: 3, line: `“My hair is fine, Mom.” “I’m just saying. You always get so defensive.”` },
      { t: `Sun 4:05 p.m.`, h: 16, m: 5, line: `Five minutes in, the capable adult is gone. You are about twelve, explaining yourself.`, mark: `about twelve, explaining yourself.` },
      { t: `Sun 4:31 p.m.`, h: 16, m: 31, line: `You hang up and stand at the kitchen counter for a long time.` },
    ],
    outro: `Nothing terrible was said. Told to a friend, it sounds like nothing: a comment about your hair. But it’s every Sunday, and it has been for years.`,
    note: `Adapted from Gabriela’s Sunday call, a worked example in {ref}.`,
    noteRef: { ch: 26, section: `The parent who still makes you feel small` },
  },

  loop: {
    kicker: `Why it keeps happening`,
    title: `Mother brings up your hair again? Repeat your answer, don’t add another explanation.`,
    body: [
      `The same comment about your hair can come back next Sunday. A new explanation can turn it into the same debate again.`,
      `Then the guilt after the call can push you to apologize. If the apology takes back your answer, the loop starts again.`,
    ],
    steps: [
      { icon: `speech`, t: `She criticizes` },
      { icon: `smooth`, t: `You explain yourself` },
      { icon: `learn`, t: `It becomes a debate` },
      { icon: `calendar`, t: `It returns Sunday` },
    ],
    center: `Every Sunday`,
  },

  tactics: {
    kicker: `Chapters 7 and 26`,
    title: `6 more things she may say, and what the book says to do.`,
    lead: `The free replies cover criticism, comparisons, guilt trips and ending the call. These are lines that may come next.`,
    items: [
      { name: `The Martyr`, ch: `Chapter 7`, says: `“Don’t worry, I’ll do it myself, like always.”`, reply: `Take her words at face value: “Okay. Let me know if you want help with something specific.” Don’t rush in to take over.`, art: `t-squeeze` },
      { name: `Visible Suffering`, ch: `Chapter 7`, says: `A long sigh. A heavy pause on the phone. “I’ve just been so tired lately.”`, reply: `“You seem upset. If you want to talk about it, I’m here.” If she says “nothing,” believe her. “Okay.” Then carry on.`, art: `t-silence` },
      { name: `“You Need to Come Today”`, ch: `Chapter 26`, says: `“You need to come over today. I don’t feel right.”`, reply: `Ask first: “Are you hurt or in danger right now?” If it might be an emergency: “Hang up and call 911. Then call me.” If you can’t tell, treat it as an emergency. If it can wait: “I can’t come today. Today I can ___. I’ll be there on ___ at ___.”`, art: `t-urgency` },
      { name: `The Character Test`, ch: `Chapter 7`, says: `“I thought you were someone I could count on.”`, reply: `“I can be someone you count on and still not be able to do this.” Don’t start listing all the times you’ve been reliable.`, art: `t-guilt` },
      { name: `“If You Loved Me,” Every Week`, ch: `Chapter 7`, says: `“If you loved me, you’d do this,” again and again.`, reply: `Raise it at a calm time: “When you say ‘if you loved me,’ every request starts to feel like a test. I want to be able to say no without it meaning I don’t love you.”`, art: `t-guilt` },
      { name: `The Favor With a Price`, ch: `Chapter 7`, says: `“I helped with your move, so I figured you wouldn’t mind watching the dog.”`, reply: `“That was kind of you, and I appreciated it. I can’t take the dog this weekend.” She chose the favor. You choose what, if anything, you give back.`, art: `t-charm` },
    ],
  },

  reset: {
    closeLine: `Three weeks from now, she may still bring up your hair. You just won’t explain it again.`,
  },

  forYou: {
    lines: [
      [`speech`, `You [[explain your hair, your job or your kids]] to your mother every Sunday.`],
      [`moon`, `You [[replay her call]] for an hour after you hang up.`],
      [`pen`, `You send [[“Sorry if I was short, love you!”]] when you did nothing wrong.`],
      [`house`, `You want to [[keep some contact]] with her, on terms you can live with.`],
    ],
    notFor: [
      [`head`, `You want a diagnosis. The book judges what she does, not what she is.`],
      [`push`, `You want comebacks that win the argument or hurt her back.`],
      [`book`, `You want therapy for what happened when you were a child.`],
      [`shield`, `You are afraid of her, or she controls your money or movements. A script isn’t the answer there. Talk to a trained advocate first (Chapter 11 explains how).`],
    ],
  },

  alternatives: {
    kicker: `What people usually try`,
    title: `What people try with a narcissistic mother, and what changes the call.`,
    items: [
      [`Explaining yourself better`, `You’ve already answered. A longer defense can turn the call into a debate, and the comment can come back next Sunday.`],
      [`Reading about narcissistic mothers`, `You learn the label. You still don’t know what to say at four o’clock.`],
      [`Arguing back`, `Argue with “I care” and it sounds like you’re rejecting her care. Now the call is about you.`],
      [`Waiting for her to change`, `She may never. The book doesn’t promise she will.`],
      [`Cutting her off overnight`, `Sometimes right. Often not what you want. Each level of contact has real costs.`],
    ],
    included: [
      `Replies for the sigh, “I’ll do it myself, like always,” and “If you loved me” every week`,
      `How to tell a real emergency from “You need to come over today”`,
      `Worked conversations with a parent: Gabriela and her mother, Hank and his father, Scott and his father`,
      `How to judge the pattern without diagnosing her`,
      `Low contact or no contact: what each one costs`,
      `A companion app that suggests what tactic might be at work in her text, and a calm reply`,
    ],
  },

  freeChapter: {
    title: `Get a free chapter by email first.`,
    lead: `It explains why a hard call keeps replaying in your head afterward, and what the replay is telling you. When you’re ready for her next call, Chapter 26 is in the book.`,
  },
};

export default s;
