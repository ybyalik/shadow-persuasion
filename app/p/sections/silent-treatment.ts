/**
 * v2 sections for /b/silent-treatment (he goes silent after a disagreement; one text, then stop chasing).
 * Sources: Ch 9 (all of it: Greg and Renee, space or pressure, why silence is hard, what withdrawal looks like, the five
 * steps, when you can't avoid contact), Ch 3 (The Good Person Contract), Ch 5 (Notice, Pause, Hold), Ch 7 (visible
 * suffering, the martyr, "If you loved me"), Ch 25 (the same argument again), Ch 28 (four paths), Ch 11 (danger).
 * The replay is Greg's Sunday-to-Tuesday, retold to "you" with the partner as "he".
 */
import type { ProblemSections } from '../sections';

const s: ProblemSections = {
  replay: {
    kicker: `The silence`,
    title: `Sunday you disagreed. It's Tuesday.`,
    log: [
      { t: `Sun 8:15 p.m.`, h: 20, m: 15, line: `You tell him you can't do the whole week at the lake this year. "Fine," he says.`, mark: `"Fine," he says.` },
      { t: `Sun 10:40 p.m.`, h: 22, m: 40, line: `No goodnight.` },
      { t: `Mon 7:05 p.m.`, h: 19, m: 5, line: `"Yes." "No." "Whatever you want." His phone stays face-down at dinner.` },
      { t: `Tue 12:30 p.m.`, h: 12, m: 30, line: `On your lunch break, you look up whether you could change your plans after all.` },
      { t: `Tue 6:10 p.m.`, h: 18, m: 10, line: `You ask if he's okay. "I'm fine." The TV goes on.`, mark: `"I'm fine."` },
      { t: `Tue 6:45 p.m.`, h: 18, m: 45, line: `You're rehearsing an apology. You're not sure what it's for.` },
    ],
    outro: `Anger gives you something to answer. Silence gives you nothing, so your mind fills the gap, and you start fixing a problem nobody has named.`,
    note: `Adapted from Greg and Renee's example in Chapter 9. Why silence works so well on kind people: {ref}.`,
    noteRef: { ch: 9, section: `Why silence is so hard to sit through` },
  },
  loop: {
    kicker: `Why it keeps happening`,
    title: `Apologizing to end silence can make it a habit.`,
    body: [
      `Many people go quiet because they're hurt and never learned how to say so. Others have learned that silence gets results. From the outside, the two can look the same.`,
      `Either way, silence that lifts when you give in tends to come back the next time you disagree.`,
    ],
    steps: [
      { icon: `speech`, t: `You disagree` },
      { icon: `moon`, t: `He goes silent` },
      { icon: `smooth`, t: `You give in` },
      { icon: `learn`, t: `It comes back` },
    ],
    center: `The silence loop`,
  },
  tactics: {
    kicker: `Not in the free text`,
    title: `Six more ways the cold shoulder shows up, and the calm reply to each.`,
    lead: `What each one looks like, and the words from the book that answer it.`,
    items: [
      { name: `"I'm Fine"`, ch: `Chapter 9`, says: `"I'm fine," in a tone that says you should know why.`, reply: `"Okay. If that changes and you want to talk, let me know."`, art: `t-silence` },
      { name: `Visible Suffering`, ch: `Chapter 7`, says: `A long sigh. "I've just been so tired lately," right after you say no.`, reply: `"You seem upset. If you want to talk about it, I'm here."`, art: `t-guilt` },
      { name: `Ghosting and Fading`, ch: `Chapter 9`, says: `A friend stops replying. No conversation, just absence.`, reply: `"I've missed hearing from you. If something's bothering you, I'm open to talking."`, art: `t-silence` },
      { name: `Going Cold at Work`, ch: `Chapter 9`, says: `A coworker stops sharing what you need after you decline a favor.`, reply: `"I'll need your answer by Thursday to keep the project on schedule."`, art: `t-intimidate` },
      { name: `The Martyr`, ch: `Chapter 7`, says: `"No, you go and have fun. I'll stay and finish up."`, reply: `"Okay. Let me know if you want help with something specific."`, art: `t-guilt` },
      { name: `"If You Loved Me"`, ch: `Chapter 7`, says: `"I guess I'm not that important to you."`, reply: `"I love you. I'm not going to do this."`, art: `t-charm` },
    ],
  },
  reset: {
    closeLine: `Three weeks from now, he may still go quiet. You just won't put your life on hold.`,
  },

  forYou: {
    lines: [
      [`moon`, `He goes quiet after you disagree, and [[you end up apologizing]] without knowing what for.`],
      [`speech`, `You've sent [["Are we okay?"]] twice, and you're drafting a third.`],
      [`house`, `You'd [[cancel a plan you made for good reasons]] just to make the house feel normal.`],
      [`ice`, `You want to stay warm [[without chasing]], and without going cold back.`],
      [`compass`, `You want [[one line to send]], and to know what to do after it.`],
    ],
    notFor: [
      [`shield`, `You're afraid of him. Start with Chapter 11 and an advocate`],
      [`speech`, `You want a text that makes him talk`],
      [`ice`, `You want to win by going silent back`],
    ],
  },
  alternatives: {
    kicker: `What people usually try`,
    title: `The usual fixes for the silent treatment.`,
    items: [
      [`Apologizing to make it stop`, `It often teaches both of you that silence is the way to settle disagreements.`],
      [`Texting until he answers`, `Sending repeated texts can keep you waiting all evening for his reply.`],
      [`Going silent back`, `It turns into a contest about who can hold out longer.`],
      [`Giving in on the plan`, `The coldness ends. Silence may return after the next disagreement.`],
      [`Waiting it out in your head`, `Two days of guessing what rule you broke.`],
    ],
    included: [
      `The one text to send, and why you send it once`,
      `What to do with your evening instead of chasing`,
      `How to tell healthy space from silence used as pressure`,
      `The words to raise the silences later, when things are calm`,
      `How to listen when he finally talks, from Greg and Renee's conversation`,
      `What to do when it's a coworker, a relative or an ex`,
    ],
  },
  freeChapter: {
    title: `Start with a free chapter instead.`,
    lead: `It's about the conversation you keep replaying, like the one right before the silence started: why the right words show up hours late, and what the replay is telling you.`,
  },
};

export default s;
