/**
 * Problem page: the silent treatment.
 * Owner-approved hook: "He's giving you the silent treatment again?" / "Send this one text, then stop."
 * The one text is Ch 9's "I can tell you're upset. When you want to talk, I'm here." (How to respond without chasing,
 * step 1). Then steps 2 to 5 as what to do instead of chasing, "Space, or pressure", and "What Greg learned"
 * (listen to the whole thing). Safety note sits above the text, from "When you can't avoid contact".
 */
import type { Problem } from '../problems';

const DANGER_LIMIT = `If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.`;

const problem: Problem = {
  slug: 'silent-treatment',
  metaTitle: `He's Giving You the Silent Treatment? Send This One Text, Then Stop | Shadow Persuasion`,
  metaDescription: `The one text to send when he goes silent after a disagreement, word for word, and what to do instead of chasing him or giving in. Free, from Chapter 9 of Shadow Persuasion: The Hidden Rules of Power.`,
  topBar: `FREE: The one text to send when he goes silent, and what to do after`,
  h1: [`He's giving you`, `the silent treatment`, `again?`],
  h1Gold: `Send this one text, then stop.`,
  lead: `One-word answers. No goodnight. "I'm fine," and the TV goes on. Here's the one text to send, word for word, and what to do after it instead of chasing him.`,
  bullets: [
    `**The one text**, word for word, from Chapter 9 of the book`,
    `Why you send it once, not five times`,
    `What to do for the rest of the day instead of chasing him, or going silent back`,
    `The words to bring up the silences later, when things are calm`,
  ],
  cta: `YES! Show Me the Text`,
  ctaNote: `Free. No sign-up. Send it once, then put the phone down.`,
  teaser: {
    label: `The one text`,
    lines: [
      `=="I can tell you're upset. When you want to talk, I'm here."==`,
      `Then: make dinner. Call your friend. Go to the gym. Be pleasant and ordinary.`,
    ],
    note: `Say it once. Not five times.`,
  },
  tool: {
    kicker: `The free text`,
    title: `Send this. Then stop.`,
    intro: `The text and the steps after it come from Chapter 9 of the book. You don't need to know why he went quiet to use them. You only need to stop letting the silence make your decisions.`,
    blocks: [
      {
        kind: 'card',
        title: `Read this first`,
        lines: [
          `If the silence comes with fear, threats or control, don't change how you respond on your own. With some people, a sudden change can make things worse, sometimes more dangerous.`,
          `Talk to a domestic violence hotline or advocate first. In the US: **1-800-799-7233**, or text START to 88788. Chapter 11 of the book explains why.`,
        ],
      },

      { kind: 'h', text: `The one text` },
      { kind: 'say', lines: [{ text: `I can tell you're upset. When you want to talk, I'm here.` }] },
      { kind: 'p', text: `**Send it once. Then stop.** Don't repeat it an hour later or send five messages. Don't add "Are we okay?" Don't explain your side. The text isn't a question he has to answer. It opens a door and leaves it open.` },

      { kind: 'h', text: `Then: what to do instead of chasing` },
      {
        kind: 'steps',
        items: [
          { title: `Carry on with your normal life.`, text: `Make dinner. Call your friend. Go to the gym. Be pleasant and ordinary. This isn't a contest about who can hold out longer. **Don't go silent back.** You're simply not putting your life on hold until he decides to speak.` },
          { title: `Don't change your decision just to end the silence.`, text: `This is the hard part, because you know exactly what would end it. Notice the urge to fix it by giving in. Pause before you act on it. Hold the decision you made for good reasons. If you learn something new, you can change your mind for that reason. ==Just not to end the silence.==` },
          { title: `Raise the pattern later, when things are calm.`, text: `If it keeps happening, talk about it when nobody is upset. Describe what happens, not what kind of person he is. The words are below.` },
          { title: `Notice what ends it.`, text: `Does the coldness lift after you apologize, or after you give in? Or does it pass on its own, followed by a real conversation? If it only ends when you give way, you've learned what the silence is doing, whatever the reason behind it. Take that seriously.` },
        ],
      },
      { kind: 'p', text: `For step 3, on a calm day:` },
      { kind: 'say', lines: [{ text: `When we disagree, you sometimes stop talking to me for a day or two. I'd rather we talk about it, even if it's hard. I can't fix something I don't know about.` }] },

      { kind: 'h', text: `Is it space, or pressure?` },
      {
        kind: 'grid',
        items: [
          { title: `Healthy space`, text: `Usually temporary, and sometimes said out loud: "I need tonight to cool off." It ends with talking, and it doesn't depend on you giving in.` },
          { title: `Silence used as pressure`, text: `Tends to start after a no, a disagreement or a limit. It ends when you give way. And it comes back the next time you disagree.` },
        ],
      },
      { kind: 'p', text: `Be careful about assuming motive. Many people go quiet because they're hurt and never learned how to say so. Others have learned that silence gets results. From the outside, the two can look the same. **The text and the steps work either way.**` },

      { kind: 'h', text: `When he does talk: listen to the whole thing` },
      { kind: 'p', text: `When the silence breaks, the urge is to explain why you were right. In the book, Greg starts to, and his partner tells him: "You decide, then you explain why you're right, and I can't get a word in. So I stop talking."` },
      { kind: 'p', text: `So open the door, then let him finish before you answer. What you hear may change your view, and your own habits may be part of the pattern.` },
      { kind: 'say', lines: [{ label: `To start`, text: `Can I talk to you about the last few days? Since Sunday, you've barely spoken to me. I'd rather know what's wrong than guess.` }] },
      { kind: 'note', text: `One text. Then your evening, not the silence, decides what you do next.` },
    ],
  },
  why: {
    kicker: `Why the silence gets to you`,
    title: `Anger gives you something to answer. Silence gives you nothing.`,
    intro: `No request to decline. No point to argue with. Only a heavy feeling that something is wrong. So your mind fills the gap.`,
    items: [
      { title: `You guess the worst.`, text: `Studies of the silent treatment describe this: the person on the receiving end often feels guilty and unsure what rule they broke. So they work hard to fix a problem nobody has named.` },
      { title: `His feelings feel like your job.`, text: `If you live by that rule (the book calls it The Good Person Contract), someone else's unhappiness feels like a task you left undone. So giving in feels like kindness.` },
      { title: `Giving in can teach the pattern.`, text: `Often the apology just teaches both of you that silence is the way to settle disagreements.` },
      { title: `Chasing puts your life on hold.`, text: `Five texts and "Are we okay?" mean your evening waits until he decides to speak. That's why the book says to send one line, once.` },
      { title: `It costs you both.`, text: `A review of research linked the silent treatment to lower relationship satisfaction over time, for the person going quiet as well as the one on the receiving end.` },
    ],
  },
  bridge: {
    title: `The text opens the door. What comes through it is the hard part.`,
    blocks: [
      { kind: 'p', text: `In the book, Greg is the one getting two days of silence. He gave Renee the tulips because he wanted to, then made dinner. Two days later the silence eased, and he raised it. Then Renee told him what the silence was really about, and some of it was about him.` },
      { kind: 'p', text: `That's the moment most people either defend themselves or give in all over again. The free part doesn't cover it. The book does:` },
      {
        kind: 'list',
        items: [
          { text: `The full conversation: how Greg stopped explaining, listened, and found the part he could change without giving up his decision.`, ref: { ch: 9, section: 'What Greg learned' } },
          { text: `When you can't avoid him: a coworker, a relative, an ex you share kids with.`, ref: { ch: 9, section: 'When you can’t avoid contact' } },
          { text: `Notice, Pause, Hold: the tool behind "don't change your decision," for every time you feel the pull to give in.`, ref: { ch: 5, section: 'Notice, Pause, Hold' } },
          { text: `If the silences keep coming back: accept, escalate, step back or leave, and what each one costs.`, ref: { ch: 28, section: 'Four paths, and what each one costs' } },
        ],
      },
      { kind: 'p', text: `What it can't do: no text makes someone talk. The book helps you stop chasing, keep your decisions, and see the pattern clearly enough to decide what you want.` },
    ],
  },
  pull: `You don't need to know why he went quiet to stop letting the silence decide for you.`,
  finalCta: `See the full method for handling the silent treatment →`,
  inside: {
    kicker: `What the book adds`,
    title: `What to do on day two, day five, and the day he finally talks.`,
    intro: `The free text covers the first move. These pages cover what comes after, including the times it isn't him, and the times it isn't safe.`,
    items: [
      { ch: 9, section: 'What Greg learned', text: `The conversation after the silence: the one sentence Greg used to stop explaining, and what his partner said the silence was really about.` },
      { ch: 9, section: 'Space, or pressure', text: `How to tell "I need tonight to cool off" from silence that only ends when you give in.` },
      { ch: 9, section: 'What withdrawal can look like', text: `Going cold, withholding affection, ghosting and fading: what each one looks like, so you can name what's happening.` },
      { ch: 9, section: 'When you can’t avoid contact', text: `When it's a coworker, a relative or an ex you share kids with: brief, calm replies like "Pickup is at five on Friday. I'll bring the soccer bag."` },
      { ch: 5, section: 'Notice, Pause, Hold', text: `The three-step tool for the moment you're about to cancel your plans just to make the house warm again.` },
      { ch: 7, section: 'When someone’s distress is treated as your job', text: `The long sigh, the heavy pause, "I've just been so tired lately" right after you say no: one line, then believe them.` },
      { ch: 28, section: 'Four paths, and what each one costs', text: `If the silences never stop: accept, escalate, step back or leave, and what each path costs you.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs that silence has become part of something dangerous, and why a better line is not the answer when you're afraid.` },
    ],
  },
  excerpts: [
    {
      ch: 9,
      chapterTitle: 'Silence, Distance, and Conditional Warmth',
      section: 'How to respond without chasing',
      sub: '1. Name it once, kindly, and open a door',
      blocks: [
        { kind: 'say', lines: [`"I can tell you're upset. When you want to talk, I'm here."`, `"Okay. If that changes and you want to talk, let me know."`] },
        { kind: 'p', text: `Say it once. Don't repeat it an hour later or send five messages. For a friend who's gone quiet, one warm message is enough: "I've missed hearing from you. If something's bothering you, I'm open to talking."` },
      ],
    },
    {
      ch: 9,
      chapterTitle: 'Silence, Distance, and Conditional Warmth',
      section: 'How to respond without chasing',
      sub: '3. Don’t change your decision just to end the silence',
      blocks: [
        { kind: 'p', text: `This is the hard part, because you know exactly what would end the silence.` },
        { kind: 'p', text: `Use Notice, Pause, Hold from Chapter 5: notice the urge to fix it by giving in, pause before you act on it, and hold the decision you made for good reasons.` },
        { kind: 'p', text: `Greg can still bring Renee tulips if he wants to. He doesn't need to cancel his son's graduation to make the house warm again. But if he learns something new, he can change his mind for that reason.` },
      ],
    },
    {
      ch: 9,
      chapterTitle: 'Silence, Distance, and Conditional Warmth',
      section: 'What Greg learned',
      blocks: [
        { kind: 'p', text: `Greg doesn't make the apology speech. He gives Renee the tulips because he wants to, says, "These made me think of you," and goes to make dinner.` },
        { kind: 'p', text: `Two days later, the silence has eased a little. After dinner, while they're clearing up, he raises it.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Greg', text: `"Can I talk to you about the last few days? Since Sunday, you've barely spoken to me. I'd rather know what's wrong than guess."` },
            { who: 'Renee', text: `"You decided about the lake without even asking me. My sister plans this every year."` },
            { who: 'Greg', text: `"I could have raised it sooner. But the graduation..."` },
            { who: 'Renee', text: `"See? You always do this. You decide, then you explain why you're right, and I can't get a word in. So I stop talking."` },
          ],
        },
        { kind: 'p', text: `Greg starts to answer and stops. She has just described what he was about to do.` },
        {
          kind: 'talk',
          lines: [{ who: 'Greg', text: `"Okay. I'm going to stop explaining. Tell me the whole thing, how it looks from your side. I'll just listen."` }],
        },
      ],
    },
  ],
  forYou: [
    `He goes quiet for a day or two after you disagree, and you end up apologizing without knowing what for.`,
    `You've sent "Are we okay?" twice already and you're drafting a third.`,
    `You'd give up a plan you made for good reasons just to make the house feel normal again.`,
    `You want to stay kind without chasing, and without going cold back.`,
    `It's your wife, your mother, a friend or a coworker who goes silent. The book uses the same steps for each.`,
  ],
  notForYou: [
    `You're afraid of him, or the silence comes with threats or control. Start with Chapter 11 and talk to an advocate before you change anything.`,
    `You want a text that makes him talk. No text can do that.`,
    `You want to win by going silent back. The book says don't.`,
    `You're looking for therapy or couples counseling. The book points you to a counselor, and to an abuse advocate first if there's control.`,
    `You want proof he's a villain. Many people go quiet because they're hurt and never learned to say so. The book asks you to listen when he talks.`,
  ],
  offerTitle: `Get the book for what comes after the text.`,
  faq: [
    { q: `What if he doesn't answer the text?`, a: `That's okay. It isn't a question he has to answer. It opens a door. Don't send another one. Carry on with your normal life, keep the decision you made, and notice what ends the silence.` },
    { q: `Shouldn't I just apologize to make it stop?`, a: `If you did something wrong, apologize for that. If you're apologizing only to end the silence, the book's warning is that it often teaches both of you that silence is the way to settle disagreements.` },
    { q: `Isn't ignoring him back the same thing?`, a: `You're not ignoring him. You sent the text, and you stay pleasant and ordinary. The book is clear: don't go silent back. You just don't put your life on hold until he decides to speak.` },
    { q: `Is the silent treatment abuse?`, a: `Not always. The book separates healthy space from silence used as pressure, and warns against assuming motive. If the silence comes with fear, threats or control, that's different. Start with Chapter 11 and talk to a hotline or advocate before you change how you respond.` },
    { q: `What if it's my wife, my mother or a friend?`, a: `The steps are the same. For a friend who's gone quiet, the book's message is: "I've missed hearing from you. If something's bothering you, I'm open to talking." At work, keep it practical: "I'll need your answer by Thursday to keep the project on schedule."` },
    { q: `How do I bring it up without starting another fight?`, a: `Wait until nobody is upset. Describe what happens, not what kind of person he is: "When we disagree, you sometimes stop talking to me for a day or two." Then listen to his whole answer before you give yours.` },
    { q: `What if it never changes?`, a: `Watch what ends it. If it only ends when you give in, take that seriously. The book suggests a counselor on your own to think it through, and Chapter 28 walks through your options and what each one costs.` },
  ],
  closeLine: `Send the one text. Then stop chasing the silence.`,
  ps: `Greg didn't make the apology speech or cancel his son's graduation. He gave the tulips because he wanted to, made dinner, and two days later asked one question. What Renee told him changed how he handles disagreements. The full conversation is in {ref}.`,
  psRef: { ch: 9, section: 'What Greg learned' },
  limits: [
    `This isn't therapy. The book says a counselor on your own can help you think it through. Couples counseling can help with ordinary conflict, but if there's abuse or control, talk privately with an abuse advocate first.`,
    `It can't make anyone talk, and it doesn't promise the pattern changes. It helps you respond without chasing, giving in or punishing back.`,
    `Nobody owes touch, sex or affection. The book is about closeness used again and again as a bargaining chip, not about someone wanting space.`,
    DANGER_LIMIT,
  ],
};

export default problem;
