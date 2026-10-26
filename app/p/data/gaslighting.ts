import type { Problem } from '../problems';

/**
 * Problem page: someone keeps rewriting what happened ("gaslighting").
 * Owner-approved hook: "He says 'that never happened' and you start doubting yourself?" / "Do these 2 things after every argument."
 * The 2 things are Ch 8 "Protecting your memory": 1. Write it down soon, 2. Confirm agreements in writing.
 * The one reply is Ch 8 "The common ways a story changes" (flat denial). The honest point that a record can also show
 * you were wrong is Ch 8 "Protecting your memory" intro and "When the record shows you were wrong" (Luis).
 * Note format and privacy check from Ch 6 "Keep a simple record".
 */
const DANGER_LIMIT =
  'If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.';

const problem: Problem = {
  slug: 'gaslighting',
  startHere: `Start with Chapter 8 for "that never happened."`,
  metaTitle: 'He Says "That Never Happened"? Do These 2 Things After Every Argument | Shadow Persuasion',
  metaDescription:
    'When he insists it never happened and you start doubting yourself: write it down soon, confirm agreements in writing, and the one reply to say instead of arguing. Free, from Chapter 8 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: The 2 things to do after every argument, plus the one reply',
  h1: ['He says “that never happened”', 'and you start', 'doubting yourself?'],
  h1Gold: 'Do these 2 things after every argument.',
  lead: `Write it down soon. Confirm what you agreed in writing. Both come from Chapter 8, along with the one sentence to say when he insists it never happened.`,
  topLink: 'The 2 things',
  cta: 'Read the 2 free steps',
  ctaNote: 'Free. No sign-up. Start after the next argument.',
  tool: {
    kicker: 'The 2 things',
    title: 'Do these 2 things after every argument.',
    intro: 'First, record what happened. Then confirm agreements in writing. Use one short reply instead of arguing about the past.',
    blocks: [
      { kind: 'p', text: `**Arguing about what happened is a different task from deciding what happens next.** You can say once how you remember it, and then move straight to the decision. You don't need his agreement about the past to make a clear choice about the present.` },

      { kind: 'h', text: 'Thing 1: Write it down soon' },
      { kind: 'p', text: `After an important conversation, note the date, what was said, and what was agreed. A few lines is plenty. Use his exact words where you remember them. Keep what happened and what you think it means on separate lines.` },
      {
        kind: 'card',
        title: 'Your note: copy this format',
        lines: [
          `**Date:**`,
          `**What was said:** his exact words, if you remember them. What was agreed, if anything.`,
          `**Observation:** what a camera would have recorded. "He said I made it up."`,
          `**Interpretation:** what you think it means. Mark it as a guess. "Guess: he didn't want to go."`,
          `**Decision:** what you'll do, if anything. "Ask him directly whether he wants to go."`,
        ],
      },
      { kind: 'note', text: `Check first: keep notes where only you can reach them. A shared laptop, a family tablet or a notes app that syncs to a shared account is not private. If someone may be checking your phone, read Chapter 11 before you keep any record.` },

      { kind: 'h', text: 'Thing 2: Confirm agreements in writing' },
      { kind: 'p', text: `After a phone call or a talk in the kitchen, send one short message that says what you understood and asks him to reply. Here's the book's example:` },
      { kind: 'say', lines: [{ text: `Just confirming what we said on the phone: I'll have the kids from Saturday the 12th to Wednesday the 16th. Can you reply to confirm, or tell me if you have something different?` }] },
      {
        kind: 'card',
        title: 'Copy and fill in',
        lines: [`Just confirming what we said [on the phone / this morning]: [the plan, with the day and time]. Can you reply to confirm, or tell me if you have something different?`],
      },
      { kind: 'p', text: `Keep it neutral. Don't add "since you always forget." And know its limit: a message nobody answers records what you said. It doesn't prove he agreed.` },

      { kind: 'h', text: 'The one reply: say it once, then stop' },
      { kind: 'p', text: `When he says "That never happened" or "I never said that," you don't need to rebuild the whole conversation. Answer once, then move on:` },
      { kind: 'say', lines: [{ text: `I remember it differently. Here's what I need now.` }] },
      { kind: 'p', text: `Then say what needs deciding: which day, how much, by when. Keep it short. **Every extra reason becomes a new thing to dispute.**` },
      { kind: 'p', text: `The risky moment is when you're upset and he's certain. That's when you're most likely to agree to his version just to end it. If you feel yourself wobbling, pause:` },
      { kind: 'say', lines: [{ label: 'Pause', text: `I want to check my notes. Let's come back to this tonight.` }] },

      { kind: 'h', text: 'The honest part: the record can show you were wrong' },
      { kind: 'p', text: `A good record does a second job. Sometimes it shows you were the one who got it wrong.` },
      { kind: 'p', text: `In the book, Luis is sure he and his ex agreed he'd take only the first half of spring break. Before he texts her to say so, he checks his email. In January, he had written: "Sure, whole week works. Go ahead and book." He had merged two conversations into one. So he told her: "I had that wrong."` },
      { kind: 'card', title: 'From Chapter 8', lines: [`**An honest correction comes from evidence.** Accepting someone else's version just because they are certain, or angry, or because you want the pressure to stop, hands your judgment over.`] },
      { kind: 'p', text: `That's why the record helps you either way. When it backs you up, you can stop doubting yourself. When it doesn't, you change your answer because of evidence, not because he insisted.` },

      { kind: 'h', text: 'If he says something else' },
      {
        kind: 'grid',
        items: [
          { title: 'Minimizing', text: `"It was a joke." "You're too sensitive." Say: "Maybe it was meant as a joke. I'd still like you to stop."` },
          { title: 'Blame-shifting', text: `"You made me do it." Say: "I'm happy to talk about what I said. I'm not taking responsibility for what you did."` },
          { title: 'Rewriting the past', text: `"You agreed to this." Say: "I don't think I agreed to that. Either way, I'm not agreeing to it now."` },
          { title: '"Everyone agrees with me"', text: `"Your brother thinks you overreacted." Say: "Other people can have their views. I'm talking with you."` },
        ],
      },
      { kind: 'note', text: `One disagreement about the past is not gaslighting. Neither is a mistaken memory, yours or his. The pattern is what matters.` },
    ],
  },
  why: {
    kicker: 'Why you start doubting yourself',
    title: 'You don’t have to win the argument about the past.',
    intro: `One disagreement about the past is not gaslighting. Neither is a mistaken memory, yours or theirs. The pattern is what wears you down.`,
    items: [
      { title: 'His version, with total certainty.', text: `The version that always favors him, delivered again and again, until you stop trusting yourself.` },
      { title: 'It works through closeness.', text: `We rely on the people closest to us to help confirm what's real. So when he says it didn't happen, it lands harder than a stranger's word would.` },
      { title: 'Arguing feeds the doubt.', text: `You list the details. He gets more certain. Each round adds nothing, except more reasons to second-guess yourself.` },
      { title: 'The certain moment.', text: `When you're upset and he's sure, it's easiest to accept his version just to end it. Then you apologize for something you're not sure you did.` },
      { title: 'The eleven tabs.', text: `In the book, Joanne apologizes at dinner, then spends her break with eleven tabs open, searching whether her husband is a narcissist. She ends up more confused than when she started.` },
    ],
  },
  bridge: {
    title: 'You have the 2 things and the one reply. Here is what the book adds.',
    blocks: [
      { kind: 'p', text: `The note and confirmation text record what happened. The reply lets you stop debating the past. Some people keep rewriting anyway. Here is what you may face next, and what the free part doesn't cover:` },
      {
        kind: 'list',
        items: [
          { text: `**When he denies the texts you show him.** Then he tells a different story. More proof can lead to another argument.` },
          { text: `**When his version reaches your family.** A relative calls to say you've been "difficult," or someone is sent to tell you how hurt he is.` },
          { text: `**When you need to know if it keeps happening, or if part of it is you.** How to read your notes across weeks, and the honest questions to ask yourself before you decide.` },
        ],
      },
      { kind: 'p', text: `Start with Chapter 8. The digital edition comes tonight.` },
      { kind: 'p', text: `What the book can't do: make anyone admit what happened. You can't stop someone rewriting the past. You can keep your own record, keep your replies short, and keep making decisions based on what you know.` },
    ],
  },
  pull: `You don't need their agreement about the past to make a clear choice about the present.`,
  inside: {
    kicker: 'What the book adds',
    title: 'For when he keeps rewriting it.',
    intro: 'Worked conversations and page references for what comes after the 2 things.',
    items: [
      { ch: 8, section: 'When the story keeps changing anyway', text: `Carla's brother denied the March texts, then changed his story twice more. The one message she sent instead of more proof, the one line she repeated, and what happened by September.` },
      { ch: 6, section: 'Joanne’s next step', text: `How Joanne raised it on a Sunday morning, not mid-fight. What she said when Tom answered "Because you were wrong," and why she went to the lunch alone.` },
      { ch: 8, section: 'When the story spreads to other people', text: `When the family hears his account: whom to answer, why trying to turn everyone against him can backfire, and what Carla told her cousin.` },
      { ch: 8, section: 'When the record shows you were wrong', text: `Luis's full exchange after he found he had it wrong: what he said to his ex, what she said back, and how they worked out the day he couldn't cover.` },
      { ch: 6, section: 'What about narcissists?', text: `What gaslighting is and isn't, why one disagreement doesn't count, and the 5 behaviors that make a pattern.` },
      { ch: 6, section: 'Keep a simple record', text: `Review weeks of notes: does it repeat, do they admit mistakes or make amends, and what happens when you say no?` },
      { ch: 6, section: 'Is it them, or is it me?', text: `The hard check: 5 honest questions to ask yourself before you decide it's all him.` },
      { ch: 11, section: 'What helps instead', text: `When keeping notes isn't safe: shared devices, synced accounts, and why deleting your history or changing passwords can alert someone who's watching.` },
    ],
  },
  excerpts: [
    {
      ch: 6,
      chapterTitle: 'A Bad Moment or a Pattern?',
      section: 'Joanne’s next step',
      blocks: [
        { kind: 'p', text: `Over the next three days, Joanne reviewed earlier messages and made a few private notes. She found four disputed plans from the past month. Three ended with her apologizing. Once, Tom said, "Okay, maybe I forgot."` },
        { kind: 'p', text: `It's mixed. She doesn't need to decide what Tom is. She decides what she'll do next: suggest a shared calendar, and only count plans once they've both said yes.` },
        { kind: 'p', text: `She raises it on Sunday morning, not in the middle of a fight. She doesn't mention her notes. They're for her.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Joanne', text: `"Can I talk to you about plans for a minute? Not the lunch. How we make plans."` },
            { who: 'Tom', text: `"Here we go."` },
            { who: 'Joanne', text: `"A few times lately, we've remembered plans differently. It ends in an argument, and I end up apologizing even when I'm not sure I was wrong."` },
            { who: 'Tom', text: `"Because you were wrong. I never said I'd go to Carol's."` },
          ],
        },
      ],
    },
    {
      ch: 8,
      chapterTitle: 'When the Story Keeps Changing',
      section: 'When the story keeps changing anyway',
      blocks: [
        { kind: 'p', text: `Some people keep rewriting no matter how calmly you confirm things. They deny messages that are right there. They tell a new version to someone else.` },
        { kind: 'p', text: `Carla's brother turned out to be one of them. In March, Ray texted to ask whether she would pay a third of their mother's home aide. She replied, "Yes, a third, starting April." By June he was saying she had agreed to half. She sent him the March texts. He wrote back, "That was before. You know we said half." A month later it was, "You promised to cover the summer." Each time she showed him the record, the story moved.` },
      ],
    },
  ],
  offerTitle: 'Get the book for the next time he says “that never happened.”',
  faq: [
    {
      q: 'Is it gaslighting, or do we just remember things differently?',
      a: `It could be either. The book defines gaslighting as "a pattern of denying or distorting events that leads someone to doubt their own memory or judgment." One disagreement about the past is not gaslighting. Neither is a mistaken memory, yours or his. Your notes, read across weeks, help you see which one you're dealing with.`,
    },
    {
      q: 'What if my notes show I was wrong?',
      a: `Then say so, the way Luis did: "I had that wrong." Changing your answer because of evidence is different from giving in to pressure. It also makes your record worth more the next time it backs you up.`,
    },
    {
      q: 'What if he denies the texts that are right there?',
      a: `Some people keep rewriting no matter what you show them. Chapter 8 walks through what Carla did when her brother did exactly that, including the one message she sent instead of more proof. You can't stop someone rewriting the past. You can stop joining the argument.`,
    },
    {
      q: 'What if he never replies to my confirmation text?',
      a: `Then you have a record of what you said, not proof that he agreed. The book is honest about that limit. It still helps your own memory, and it puts the plan in writing where you can both see it.`,
    },
    {
      q: 'Where should I keep my notes?',
      a: `Somewhere only you can reach. A shared laptop, a family tablet or an app that syncs to a shared account isn't private. If he may be checking your phone or accounts, read Chapter 11 before you keep any record.`,
    },
    {
      q: 'Is he a narcissist?',
      a: `The book won't guess, and a checklist can't tell you. Narcissistic personality disorder is a diagnosis made by trained professionals. What you can judge is the pattern: repeated denial, blame that always lands on you, no repair, punishment when you say no. You don't need a label to act on any of that.`,
    },
    {
      q: 'Is this just for women?',
      a: `No. The 2 things work for anyone. In the book, the people keeping records include a divorced dad, a woman dealing with her brother and a wife dealing with her husband.`,
    },
  ],
  closeLine: 'You don’t need him to agree about the past to decide what happens next.',
  ps: `In the book's worked example, Carla stopped sending proof about her share of their mother's care costs. She sent one message, repeated one line, and paid on the first of every month. In September, her brother asked for the call she had offered. The whole story is in {ref}.`,
  psRef: { ch: 8, section: 'When the story keeps changing anyway' },
  limits: [
    `The book judges behavior instead of diagnosing anyone. One disagreement about the past is not gaslighting; the pattern is what matters.`,
    `It can't make anyone admit what happened. A record protects your memory, and sometimes it shows you were wrong.`,
    `Not therapy or legal advice. If a changing story affects your job, your money or your children, the book points you to HR, a family lawyer or a mediator.`,
    `If someone may be checking your phone or accounts, read Chapter 11 before you keep any record.`,
    DANGER_LIMIT,
  ],
};

export default problem;
