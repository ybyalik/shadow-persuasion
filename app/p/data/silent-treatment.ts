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
  startHere: `Start with Chapter 9 for the silent treatment.`,
  metaTitle: `He's Giving You the Silent Treatment? Send This One Text, Then Stop | Shadow Persuasion`,
  metaDescription: `The one text to send when he goes silent after a disagreement, word for word, and what to do instead of chasing him or giving in. Free, from Chapter 9 of Shadow Persuasion: The Hidden Rules of Power.`,
  topBar: `FREE: The one text to send when he goes silent, and what to do after`,
  h1: [`He's giving you`, `the silent treatment`, `again?`],
  h1Gold: `Send this one text, then stop.`,
  lead: `One-word answers. No goodnight. "I'm fine," and the TV goes on. Here's the one text to send, word for word, and what to do after it instead of chasing him.`,
  topLink: `The one text`,
  cta: `Read the free text`,
  ctaNote: `Free. No sign-up. Send it once, then put the phone down.`,
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
      { kind: 'note', text: `Send one text. Then carry on with your evening instead of waiting for him to speak.` },
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
    title: `When he finally talks, what do you say back?`,
    blocks: [
      { kind: 'p', text: `The free text gets you through the silence. The harder part starts when the talking does, and the free part stops there.` },
      { kind: 'p', text: `**He tells you what the silence was about, and some of it is about you.** In the book, Renee does exactly that. Greg has to own his part and still keep the decision he made for good reasons. The free part gives you one line of hers. The book shows what she told him, what he said back, and what changed in their next disagreement.` },
      { kind: 'p', text: `**It isn't full silence.** The warmth goes, the replies slow down, or affection is switched off until you agree. The book shows what each one looks like, so you can name it.` },
      { kind: 'p', text: `**It keeps coming back.** How to weigh your options, and what each one costs you.` },
      { kind: 'p', text: `What it can't do: no text makes someone talk. Start with Chapter 9 tonight. The digital edition comes with your order.` },
    ],
  },
  pull: `You don't need to know why he went quiet to stop letting the silence decide for you.`,
  inside: {
    kicker: `What the book adds`,
    title: `The conversation after the silence, and what to do if it keeps coming back.`,
    intro: `The free text is the first step. These pages cover what comes after, including times the problem isn't him, and times it isn't safe.`,
    items: [
      { ch: 9, section: 'What Greg learned', text: `The rest of the conversation after the silence: what Renee said it was really about, how Greg owned his part without giving up his decision, and what changed two weeks later.` },
      { ch: 9, section: 'What withdrawal can look like', text: `Going cold, withholding affection, ghosting and fading: what each one looks like, so you can name what's happening.` },
      { ch: 9, section: "When you can't avoid contact", text: `When it's a coworker, a relative or an ex you share kids with: brief, calm replies like "Pickup is at five on Friday. I'll bring the soccer bag."` },
      { ch: 5, section: 'Notice, Pause, Hold', text: `Three steps to use when you're about to cancel your plans just to end the coldness at home.` },
      { ch: 7, section: "When someone's distress is treated as your job", text: `Sighs or heavy pauses after you say no: what to say once, and why to accept their answer if they say nothing's wrong.` },
      { ch: 28, section: 'Four paths, and what each one costs', text: `If the silences never stop: live with it, get outside help, step back or leave, and what each path costs you.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs that silence has become part of something dangerous, and why a better line is not the answer when you're afraid.` },
    ],
  },
  excerpts: [
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
    {
      ch: 9,
      chapterTitle: 'Silence, Distance, and Conditional Warmth',
      section: "When you can't avoid contact",
      blocks: [
        { kind: 'p', text: `Sometimes you have to keep dealing with someone who uses coldness, provocation or silence: a coworker, a relative at family events, an ex you share children with.` },
        { kind: 'p', text: `First, a limit. If you feel afraid of someone, don't change how you deal with them on your own. With some people, a sudden change in how you respond can make things worse, sometimes more dangerous. Talk to a domestic violence hotline or advocate first. Chapter 11, When Pressure Becomes Danger, explains why and lists where to get help.` },
        { kind: 'p', text: `Where you aren't afraid, one approach is to keep your replies brief, factual and calm. Answer what needs answering. Skip the emotional bait. This is sometimes called grey rock, which means being as plain and uninteresting as a grey rock, so there's little for the other person to argue with.` },
        { kind: 'say', lines: [`"Pickup is at five on Friday. I'll bring the soccer bag."`] },
        { kind: 'p', text: `Don't assume the other person is after a reaction. Some are hurt or anxious, and a very flat reply can feel like coldness to them. Chapter 25, Dating, Intimacy, and Difficult Relationships, covers ordinary communication with an ex in more detail.` },
      ],
    },
  ],
  offerTitle: `Get the book for what comes after the text.`,
  faq: [
    { q: `What if he doesn't answer the text?`, a: `That's okay. It isn't a question he has to answer. It opens a door. Don't send another one. Carry on with your normal life, keep the decision you made, and notice what ends the silence.` },
    { q: `Shouldn't I just apologize to make it stop?`, a: `If you did something wrong, apologize for that. If you're apologizing only to end the silence, the book's warning is that it often teaches both of you that silence is the way to settle disagreements.` },
    { q: `Isn't ignoring him back the same thing?`, a: `You're not ignoring him. You sent the text, and you stay pleasant and ordinary. The book is clear: don't go silent back. You just don't put your life on hold until he decides to speak.` },
    { q: `Is the silent treatment abuse?`, a: `Not always. The book separates healthy space from silence used as pressure, and warns against assuming motive. If the silence comes with fear, threats or control, that's different. Start with Chapter 11 and talk to a hotline or advocate before you change how you respond.` },
    { q: `What if it's my wife, my mother or a friend?`, a: `The steps are the same. For a friend who's gone quiet, the book's message is: "I've missed hearing from you. If something's bothering you, I'm open to talking." At work, keep it practical: "I'll need your answer by Thursday to keep the project on schedule."` },
    { q: `How do I bring it up without starting another fight?`, a: `Wait until nobody is upset. Describe what happens, not what kind of person he is: "When we disagree, you sometimes stop talking to me for a day or two." Then listen to his whole answer before you give yours.` },
    { q: `What if he withholds affection until I give in?`, a: `The book is careful here. Nobody owes touch or affection, and anyone can decline them. The concern is closeness switched off again and again until you agree or apologize, not someone wanting space. The same steps apply: name it once, carry on with your life, and don't change your decision just to end it. If it comes with fear or control, start with Chapter 11 and talk to an advocate first.` },
    { q: `What if it never changes?`, a: `Watch what ends it. If it only ends when you give in, take that seriously. The book suggests a counselor on your own to think it through, and Chapter 28 walks through your options and what each one costs.` },
  ],
  closeLine: `Send one text. Then stop trying to get him to reply.`,
  ps: `In the book's worked example, Greg didn't make the apology speech or cancel his son's graduation. He gave the tulips because he wanted to, made dinner, and two days later asked one question. What Renee told him next, and what he said back, is in {ref}.`,
  psRef: { ch: 9, section: 'What Greg learned' },
  limits: [
    `This isn't therapy. The book says a counselor on your own can help you think it through. Couples counseling can help with ordinary conflict, but if there's abuse or control, talk privately with an abuse advocate first.`,
    `It can't make anyone talk, and it doesn't promise the pattern changes. It helps you respond without chasing, giving in or punishing back.`,
    DANGER_LIMIT,
  ],
};

export default problem;
