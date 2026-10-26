/**
 * Problem page: manipulation tactics. The free cheat sheet is a short preview of the bonus
 * The Tactic Spotter (book-v3/bonuses/drafts/tactic-spotter.md): 9 of its 43 ordinary entries, with its
 * "what it sounds like", "concerning if" and "calm reply" lines, plus its "pattern, not a single moment" check.
 * The nine are an editorial pick, not the book's fixed list. Tactic cards (sections file) are 8 OTHER moves from Ch 7, 8, 10.
 */
import type { Problem } from '../problems';

const DANGER_LIMIT = `If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.`;

const problem: Problem = {
  slug: 'manipulation-tactics',
  startHere: `Start with Chapters 7 to 10 for the tactics themselves.`,
  metaTitle: `Spot 9 Common Pressure Tactics, With a Calm Reply for Each: Free Cheat Sheet | Shadow Persuasion`,
  metaDescription: `A free cheat sheet: 9 pressure tactics from everyday conversations, what each one sounds like, when it becomes a pattern, and one calm reply for each. A preview of The Tactic Spotter, a bonus with Shadow Persuasion: The Hidden Rules of Power.`,
  topBar: `FREE CHEAT SHEET: 9 manipulation tactics, and a calm reply for each`,
  h1: [`9 manipulation tactics`, `partners, parents and bosses`, `use on you.`],
  h1Gold: `Spot each one in the moment, and have the calm reply ready.`,
  lead: `"If you loved me, you'd..." "That never happened." "I need an answer today." You hear these from partners, parents, bosses and friends. Here are 9 of them: what each sounds like, when it's a pattern and not a bad day, and one calm reply you can say word for word.`,
  topLink: `The 9 tactics`,
  cta: `Read the free cheat sheet`,
  ctaNote: `Free. No sign-up. Screenshot it or print it.`,
  tool: {
    kicker: `The free cheat sheet`,
    title: `9 tactics. What each sounds like. One calm reply.`,
    intro: `The 9 tactics, taken from The Tactic Spotter, a quick-reference bonus that comes with the book. For each one: what it sounds like, when it becomes a pattern worth taking seriously, and one calm reply.`,
    blocks: [
      { kind: 'h', text: `Read this first (30 seconds)` },
      { kind: 'p', text: `Everyone sighs, forgets, sulks or gets defensive sometimes. One evening tells you very little. Watch three things over time, then choose your response:` },
      {
        kind: 'grid',
        items: [
          { title: `Repetition.`, text: `Does it keep happening, and does it tend to go the same way?` },
          { title: `Repair.`, text: `Do they ever come back to it, even with a small "I got that wrong"?` },
          { title: `Response to no.`, text: `When you calmly disagree, do you get disappointment, or days of punishment?` },
          { title: `Your decision.`, text: `Pick a reply that works whether your guess about their motive is right or wrong.` },
        ],
      },
      { kind: 'p', text: `A matching phrase is worth noticing. **On its own, it doesn't prove anything.** You don't need to read minds or diagnose anyone. Judge what people do, not what they are.` },
      { kind: 'note', text: `If any of these come with fear, threats or tracking, skip the replies. A calm line won't make that safe. Start with Chapter 11 and talk to a domestic violence advocate before changing how you respond.` },

      { kind: 'h', text: `Guilt and hidden debts` },
      {
        kind: 'card',
        title: `1 · The ledger`,
        lines: [
          `**Sounds like:** "After everything I've done for you." "Remember who covered for you last spring?"`,
          `**Watch for:** past help comes up every time you say no, and the bill never seems to be paid off.`,
          `**Calm reply:** "I haven't forgotten how much you've helped me. This time, I can't."`,
        ],
      },
      {
        kind: 'card',
        title: `2 · The favor with a hidden price`,
        lines: [
          `**Sounds like:** A favor you didn't ask for, then weeks later: "I gave you a lift last week, so I figured you'd help me move on Saturday."`,
          `**Watch for:** they choose the gift, the timing and the repayment, and the repayment is usually bigger than the gift.`,
          `**Calm reply:** "I appreciated the lift last week. I can't help with the move on Saturday."`,
        ],
      },
      {
        kind: 'card',
        title: `3 · "If you loved me"`,
        lines: [
          `**Sounds like:** "If you loved me, you'd do this." "I'd do it for you without thinking."`,
          `**Watch for:** requests often become tests of love, and only agreeing counts as proof.`,
          `**Calm reply:** "I love you. I'm not going to do this."`,
        ],
      },
      {
        kind: 'card',
        title: `4 · The martyr`,
        lines: [
          `**Sounds like:** "Don't worry, I'll do it myself, like always." A sigh while they do the task in front of you.`,
          `**Watch for:** they never ask, so you can never decline, and you're blamed later for not stepping in.`,
          `**Calm reply:** "All right. If there's one part you'd like a hand with, tell me which."`,
        ],
      },

      { kind: 'h', text: `When the story keeps changing` },
      {
        kind: 'card',
        title: `5 · "That never happened"`,
        lines: [
          `**Sounds like:** "I never said that." "You're imagining things."`,
          `**Watch for:** your clear memories are denied with total certainty, again and again, always in their favor, until you doubt yourself. (They may also honestly remember it differently. So might you.)`,
          `**Calm reply:** "I remember it differently. Either way, here's what I need now."`,
        ],
      },
      {
        kind: 'card',
        title: `6 · "You agreed to this"`,
        lines: [
          `**Sounds like:** "We decided together." "You said it was fine." Your hesitant "I guess" comes back as a firm yes.`,
          `**Watch for:** old agreements keep changing shape, always in the direction that suits them.`,
          `**Calm reply:** "My understanding was one afternoon, not every week. Let's check what we actually agreed."`,
          `Next time, confirm plans in a short message and ask them to reply.`,
        ],
      },

      { kind: 'h', text: `Silence and coldness` },
      {
        kind: 'card',
        title: `7 · The silent treatment`,
        lines: [
          `**Sounds like:** Hours or days of no talking, or short, cold answers after you disagree. "I'm fine," in a tone that says they're not.`,
          `**Watch for:** the silence only ends when you apologize or give way, even when you did nothing wrong.`,
          `**Calm reply:** "It seems like something's wrong. I'm ready to talk whenever you are."`,
          `Then carry on with your day. Don't chase, plead or go silent back.`,
        ],
      },

      { kind: 'h', text: `Charm and urgency` },
      {
        kind: 'card',
        title: `8 · Fake urgency`,
        lines: [
          `**Sounds like:** "I need your answer right now." "This price ends at midnight."`,
          `**Watch for:** deadlines appear on decisions that don't need to be fast, and bend once you say no. Some deadlines are real, so check: what happens if I answer tomorrow, and who set the clock?`,
          `**Calm reply:** "I can't decide this today. If it needs an answer now, the answer is no. If it can wait, let's talk tomorrow."`,
        ],
      },
      {
        kind: 'card',
        title: `9 · A small yes becomes a bigger request`,
        lines: [
          `**Sounds like:** "Could you take a quick look?" Then: "While you're in there, could you fix it?" Then: "Actually, could you rewrite it?"`,
          `**Watch for:** a small first yes is regularly used as a step toward a much bigger one.`,
          `**Calm reply:** "I agreed to a quick look, and I've done it. The rest is more than I can take on."`,
        ],
      },
    ],
  },
  why: {
    kicker: `Why these moves work`,
    title: `None of them asks a question you can easily refuse.`,
    intro: `Each move borrows a good instinct and points it somewhere else. The book names five hidden pressures behind them. These are the ones the cheat sheet leans on most.`,
    items: [
      { title: `Obligation.`, text: `Gratitude and loyalty are good things. The ledger turns them into a debt, and today's request into the payment. Ask: what do I actually owe, and what am I only being made to feel I owe?` },
      { title: `Timing.`, text: `A deadline shuts down careful thinking. Ask: why must I decide now, and who set that clock?` },
      { title: `Assumptions.`, text: `"You agreed to this." An unspoken rule makes one answer seem settled. Ask: what is being treated as agreed when nobody asked?` },
      { title: `The rules you already follow.`, text: `If other people's feelings feel like your job, a sigh or a silence feels like a task you left undone. So giving in feels like kindness.` },
    ],
  },
  bridge: {
    title: `You can spot the 9. Here's what the book adds next.`,
    blocks: [
      { kind: 'p', text: `You now have 9 tactics, what each one sounds like, when it becomes a pattern, and one calm reply for each. That's enough to name the move the next time you hear it.` },
      { kind: 'p', text: `Three things come next that the sheet doesn't cover.` },
      { kind: 'p', text: `**The second round.** You give the calm reply, and they answer with a different move: "Your brother thinks you overreacted," or "I thought you were someone I could count on."` },
      { kind: 'p', text: `**The moves that aren't on this sheet.** The full Tactic Spotter, one of three bonuses with the book, covers more than 40 pressure moves, plus a separate section on danger signs.` },
      { kind: 'p', text: `**The move that keeps coming back.** How to decide your next step, instead of waiting for them to change.` },
      { kind: 'p', text: `The book walks through each kind of pressure with worked conversations where the other person argues back. It can't make anyone stop. It helps you keep your answer and decide what to do next. Start with Part II tonight. The digital edition comes with your order.` },
    ],
  },
  pull: `Once you can name the move, you get to choose your answer.`,
  limits: [
    `Matching a pattern isn't proof. The book judges behavior over time instead of diagnosing anyone, and it asks you to check whether you've used any of these moves yourself.`,
    `This isn't therapy or legal advice.`,
    DANGER_LIMIT,
  ],
  inside: {
    kicker: `What the book adds for this problem`,
    title: `The 9 tactics are the start. Here's what comes next.`,
    intro: `The cheat sheet gives you one reply for each move. These pages give you the words for the pushback, the moves the sheet leaves out, and how to tell a pattern from a bad day.`,
    items: [
      { ch: 7, section: 'When past help is treated as a debt', text: `"After everything I've done for you": why it makes a no feel ungrateful, the reply that honors the past, and the one thing never to say back.` },
      { ch: 7, section: 'When affection or character is made conditional', text: `"A real friend would do this" and "If you loved me": how to answer a test of your character or your love without defending your record.` },
      { ch: 8, section: 'The common ways a story changes', text: `"That never happened." "It was a joke." "You made me do it." "Everyone agrees with me." A short reply for each of 6 ways a story gets rewritten.` },
      { ch: 8, section: 'When the story spreads to other people', text: `"Mom's really hurt by what you said." What to do when the pressure arrives through a third person, or someone is telling others a damaging version of you.` },
      { ch: 8, section: 'Protecting your memory', text: `Doubting your memory? 4 steps to record events, stop debating the past and focus on what needs deciding now.` },
      { ch: 9, section: 'How to respond without chasing', text: `The silent treatment after you say no: 5 steps that don't involve chasing, pleading or going silent back.` },
      { ch: 10, section: 'Pleasant pressure', text: `Praise, overwhelming affection, urgent deadlines and future promises: how to judge the request without being swayed by what comes with it.` },
      { ch: 10, section: 'The slow squeeze', text: `When agreeing leads to more: bigger requests, changing targets, extra duties, temporary arrangements that never end and unpaid loans.` },
      { ch: 28, section: 'Build your No-Agreement Plan', text: `When the same move keeps coming back after your no: decide what you'll do if the answer stays no, before you need it.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs that mean a calm reply is the wrong tool, and what to do instead.` },
    ],
  },
  excerpts: [
    {
      ch: 8,
      chapterTitle: 'When the Story Keeps Changing',
      section: 'The common ways a story changes',
      blocks: [
        { kind: 'p', text: `These are patterns to recognize, not labels to pin on anyone after one argument. They overlap, and you don't need to name which one you're facing.` },
        { kind: 'p', text: `Flat denial. "That never happened." "I never said that." Answer once, then move on: "I remember it differently. Here's what I need now."` },
        { kind: 'p', text: `Minimizing. "It was a joke." "You're too sensitive." They don't deny it happened. They deny it matters. You don't need them to agree it hurt: "Maybe it was meant as a joke. I'd still like you to stop."` },
        { kind: 'p', text: `Blame-shifting. "You made me do it." "If you hadn't pushed, I wouldn't have yelled." Separate your part from theirs: "I'm happy to talk about what I said. I'm not taking responsibility for what you did."` },
        { kind: 'p', text: `Fog. Long, circling answers. A new topic every time you get close to the point. Something you did in 2014. Pick one short sentence and keep coming back to it: "I want to come back to my question. Will you pay me back by Friday?"` },
      ],
    },
    {
      ch: 6,
      chapterTitle: 'A Bad Moment or a Pattern?',
      section: 'The same behavior, three explanations',
      blocks: [
        { kind: 'p', text: `Take Tom's line: "I never said I'd go." Here are three very different things it could mean.` },
        { kind: 'p', text: `A misunderstanding. Tom said "sure" while watching a game and genuinely didn't take it in. When Joanne shows him the calendar entry, he says, "Huh. I must have tuned out. Okay, I'll come." The next time, he pays more attention.` },
        { kind: 'p', text: `What helps here is a better system: a shared calendar, and a direct question before counting something as agreed.` },
        { kind: 'p', text: `Ordinary conflict. Tom doesn't want to go because Carol makes digs about his job. "I never said I'd go" is a clumsy way out of a lunch he dreads. When Joanne asks, "Do you not want to go?" he admits it.` },
        { kind: 'p', text: `Now it's a real disagreement about the lunch, and they can talk about that. Maybe he comes for an hour. Maybe she goes alone.` },
        { kind: 'p', text: `Repeated pressure. It happens with many plans, not just this one. It almost always ends with Joanne apologizing. When she shows him a text where he agreed, he says she's twisting things. When she goes ahead with a plan on her own, he barely speaks to her for two days.` },
        { kind: 'p', text: `What helps here is to stop debating memory, make decisions based on what actually happens, and get outside support. If there is fear in the house, safety comes before any of that.` },
        { kind: 'p', text: `Joanne doesn't need to know what's happening inside Tom's head. Each explanation leads to a different next step, and what happens next will show her which one fits.` },
      ],
    },
  ],
  offerTitle: `Get the book for what to say when they keep pushing.`,
  faq: [
    { q: `Won't this make me suspicious of everyone?`, a: `It shouldn't. The book says one moment tells you very little. Everyone sighs, forgets or sulks sometimes. It asks you to watch three things over time: does it repeat, is there ever repair, and what happens when you say no. Matching a tactic is a reason to pay attention, not proof.` },
    { q: `What if I do some of these myself?`, a: `Most people do, sometimes. Chapter 6 has five questions to ask yourself, like "Do I go quiet to make a point?" Chapter 30 shows how to repair it when you're the one who got it wrong. You can change your part without taking the blame for theirs.` },
    { q: `Should I tell them what tactic they're using?`, a: `Usually not. The book calls these patterns to recognize, not labels to pin on anyone. The replies answer the request in front of you ("I love you. I'm not going to do this.") instead of naming the move. That keeps it about the decision, not about who they are.` },
    { q: `Will the calm reply make them stop?`, a: `No reply can promise that. The replies help you keep your answer. If the same move keeps coming back, the book helps you decide what to do next, including The No-Agreement Plan in Chapter 28.` },
    { q: `What if they give me the silent treatment for days?`, a: `Chapter 9 has five steps. Name it once, kindly: "I can tell you're upset. When you want to talk, I'm here." Carry on with your normal life. Don't change your decision just to end the silence. Raise the pattern later, when things are calm. And notice what ends it.` },
    { q: `What if I already said yes?`, a: `You're allowed to take it back. Chapter 7 gives five steps: do it soon, own it in one sentence ("I said yes too quickly"), give the clear new answer, offer only what you'll really do, and don't reopen it.` },
    { q: `Is this about narcissists?`, a: `Some readers come for that word. The book doesn't diagnose anyone. It looks at what people do: denial, blame that always lands on you, control, no repair, and punishment when you say no. You can act on those without a label.` },
    { q: `What's The Tactic Spotter?`, a: `One of three bonuses with the book. This free cheat sheet uses 9 of its entries. The full guide covers more than 40 pressure moves, each with other explanations to check first, when it becomes a pattern, and one calm reply, plus a section on danger signs.` },
  ],
  closeLine: `Notice pressure. Keep your decision.`,
  ps: `In the book's worked example, Darnell's sister helped him move last summer. When her car went into the shop, she expected him to drive her to work every weekday, and reached for the ledger: "After everything I did with your move, you can't do this?" Then: "So you only take favors." Then: "Forget it." He didn't argue about what he owed, and he didn't give in. What he said each time, word for word, is in {ref}.`,
  psRef: { ch: 26, section: 'Caring for an aging parent without doing it all alone' },
};

export default problem;
