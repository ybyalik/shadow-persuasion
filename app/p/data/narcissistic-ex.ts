import type { Problem } from '../problems';

/**
 * Problem page: a high-conflict ex ("narcissistic ex") who turns pickup texts into fights. Audience: co-parents.
 * Owner-approved hook: "Narcissistic ex turns every pickup text into a fight?" / "Copy these 3 replies."
 * The 3 replies are word for word from Ch 25 "After a separation: when your ex still controls everything":
 * the pickup change (Keep messages brief and about the kids), the digs (When the messages keep coming),
 * the kids in the middle (Angela's line to Craig). Safety note sits above them; family-lawyer limit stays.
 */
const DANGER_LIMIT =
  'If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.';

const problem: Problem = {
  slug: 'narcissistic-ex',
  startHere: `Start with Chapter 25 for texts with your ex.`,
  metaTitle: 'Narcissistic Ex Turns Every Pickup Text Into a Fight? Copy These 3 Replies | Shadow Persuasion',
  metaDescription:
    'For co-parents: 3 word-for-word replies for a "changed" pickup, a message full of digs, and "ask the kids." Plus what to do when they push back, and when to call a family lawyer. Free, from Chapter 25 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: 3 word-for-word replies for a narcissistic ex, from Chapter 25',
  h1: ['Narcissistic ex turns', 'every pickup text', 'into a fight?'],
  h1Gold: 'Copy these 3 replies.',
  lead: `For co-parents. One reply for a "changed" pickup, one for the digs, one for when they pull the kids in. Word for word from the book. Fill in your own day and time, and send.`,
  topLink: '3 free replies',
  cta: 'Read the 3 free replies',
  ctaNote: 'Free. No sign-up. Use them on the next text.',
  tool: {
    kicker: 'The 3 replies',
    title: 'Copy these 3 replies.',
    intro: 'First, one safety note. Then the 3 replies, word for word from Chapter 25, each with a fill-in version for your own day and time. Then what to do when they push back.',
    blocks: [
      { kind: 'note', text: `Read this first. If you're afraid of your ex, or they monitor or control you, talk to a domestic violence advocate before changing how you respond. Start with Chapter 11. Scripts are not a safety plan.` },
      { kind: 'p', text: `In the book, Angela's ex texts at 9:40 p.m.: "Since you obviously can't handle Thursdays, I'll pick the kids up from school at 3 from now on. Maybe if you didn't work until 6 every night you'd remember what they actually need."` },
      { kind: 'p', text: `One piece of that is about the schedule. Everything else is about her as a person. **The schedule part needs an answer. The rest does not.** She typed three angry paragraphs, deleted them all, and replied the next morning, after coffee.` },

      { kind: 'h', text: 'Reply 1: when they "change" the pickup' },
      { kind: 'p', text: `Restate the arrangement. Say what you'll do. Ask for any change in writing.` },
      {
        kind: 'say',
        lines: [{ label: 'Word for word', text: `Our schedule has me picking the kids up from aftercare at 5 on Thursdays. I'll be there at 5 this week as usual. If you'd like to change the schedule going forward, please send me the proposal in writing and I'll think about it.` }],
      },
      {
        kind: 'card',
        title: 'Copy and fill in',
        lines: [`Our schedule has me picking the kids up from [place] at [time] on [day]. I'll be there at [time] this week as usual. If you'd like to change the schedule going forward, please send me the proposal in writing and I'll think about it.`],
      },
      { kind: 'p', text: `**If they push back** ("We never agreed on 5. We said 'after work.' Typical of you to twist things."), don't argue the history. Say it again, shorter:` },
      { kind: 'say', lines: [{ text: `My copy of the schedule says 5. I'll be at aftercare at 5 on Thursday.` }] },

      { kind: 'h', text: 'Reply 2: when the text is mostly digs' },
      { kind: 'p', text: `Ten messages in an hour. Comments about your new partner, your family or your past. You can leave the digs unanswered and still deal with the practical matter.` },
      {
        kind: 'say',
        lines: [
          { label: 'Word for word', text: `I'm happy to talk about the pickup schedule. I'm not going to discuss the past.` },
          { label: 'Or', text: `I'll answer messages about the kids. I won't respond to the rest.` },
        ],
      },
      { kind: 'p', text: `Say it once. Then answer only practical questions. Don't defend your parenting or bring up old history. Each of those can give them something new to argue with.` },

      { kind: 'h', text: 'Reply 3: when they pull the kids in' },
      { kind: 'p', text: `"The kids would rather come with me anyway. Ask Maya." Don't ask Maya. Children shouldn't be asked to choose between parents or carry messages between them.` },
      { kind: 'say', lines: [{ label: 'Word for word', text: `Please don't ask the kids to decide the schedule. I'll see them at 5 on Thursday.` }] },
      { kind: 'p', text: `**When the last line is "Fine. But we're talking about this."** Don't reply. There's nothing to answer yet. If a written proposal arrives, consider it then.` },

      { kind: 'h', text: 'Before you hit send: 4 checks' },
      {
        kind: 'card',
        lines: [
          `**1. Is it about one practical thing?** The day, the time, the place.`,
          `**2. Does it include the facts needed to handle it?**`,
          `**3. Did I leave out feelings, history, defenses and digs?**`,
          `**4. Am I answering in anger?** Angela waited until the next morning. Unless it's urgent for the kids, yours can wait too.`,
        ],
      },

      { kind: 'h', text: 'If they show up at the new time anyway' },
      { kind: 'p', text: `A text can't settle a disputed pickup. Before the day, gather what a family lawyer or mediator would need:` },
      {
        kind: 'list',
        items: [
          { text: `**The current arrangement.** Your parenting plan or court order, if there is one, and what it says about this day, time and place. If it's informal, write down what you've both been doing and for how long.` },
          { text: `**The disputed change.** In one line: what they say is changing, and when they said it.` },
          { text: `**The messages.** Save the ones about this change, theirs and yours, with dates, somewhere your ex can't reach.` },
          { text: `**Questions for a family lawyer or mediator.** Does my plan cover this? What should I do if they arrive at the earlier time? Should the school be told anything, and by whom?` },
        ],
      },
      { kind: 'note', text: `Keep the kids out of it. Don't ask them where they want to go, and don't argue in front of them at the handover. If you or the kids are ever in immediate danger, call 911.` },
      { kind: 'p', text: `**These replies answer a text. They don't decide a custody question.** Whether a bigger, lasting change to the schedule is allowed is a question for a family lawyer.` },
    ],
  },
  why: {
    kicker: 'Why every text turns into a fight',
    title: 'The divorce is finished. The argument isn’t.',
    intro: `Here's what keeps pulling you back in, and what it costs.`,
    items: [
      { title: 'The old question: who sets the terms.', text: `The hidden pressure after a separation is the old assumption about who gets to set the terms. A "changed" pickup tests it.` },
      { title: 'Each defense can become new material.', text: `Defend your parenting, bring up the recital, explain why you work late, and each one can give them something new to argue with.` },
      { title: 'Asking a text to deliver closure.', text: `Wanting them to admit they were unfair is human. A pickup message can't do that, and trying usually gets you neither the pickup nor the closure.` },
      { title: 'The kids in the middle.', text: `Once children are asked to carry messages or pick a side, the schedule fight moves into their lives too.` },
      { title: 'The 9:40 p.m. knot.', text: `The cost is your evenings: three paragraphs typed and deleted, and the same argument, in your own living room, long after the divorce is done.` },
    ],
  },
  bridge: {
    title: 'You have the 3 replies for the next text. Here is what the book adds.',
    blocks: [
      { kind: 'p', text: `The replies answer the pickup, the digs and the kids, and the checklist gets you ready if they show up anyway. The next fight is often about something else: what you both agreed. Here is what you may face next, and what the free part doesn't cover:` },
      {
        kind: 'list',
        items: [
          { text: `**When they say you never agreed to something you settled by phone.** A call leaves no record, and that gap is where the story changes.` },
          { text: `**When they deny the messages you show them.** Then they tell a different story.` },
          { text: `**When the record shows you were wrong.** How to admit it without assuming they're right next time just because they sound certain.` },
        ],
      },
      { kind: 'p', text: `Start with Chapter 8, then Chapter 25. The digital edition comes tonight.` },
      { kind: 'p', text: `What the book can't do: make your ex communicate fairly, or give you custody tactics. It helps you choose which conversation to have, and sends you to a family lawyer for the rest.` },
    ],
  },
  pull: `Repeating the same calm sentence is not weakness. It's choosing which conversation to have.`,
  inside: {
    kicker: 'What the book adds',
    title: 'When the fight moves from the pickup to what you agreed.',
    intro: 'Worked conversations and page references for what comes after the 3 replies.',
    items: [
      { ch: 8, section: 'Protecting your memory', text: `All 4 steps to protect your memory, including the one-line text to send after a phone call with your ex, so "we never agreed on 5" has a written answer.` },
      { ch: 8, section: 'When the record shows you were wrong', text: `Luis, divorced three years, was sure he and his ex had agreed he'd take only the first half of spring break. What he found when he checked, the message he sent instead, and how they sorted out the day he couldn't cover.` },
      { ch: 8, section: 'When the story keeps changing anyway', text: `When someone denies the messages that are right there: the one message Carla sent instead of more proof, and the one line she repeated after it.` },
      { ch: 8, section: 'When the story spreads to other people', text: `When your ex tells friends or family damaging claims about you: whom to answer, and why trying to turn everyone against your ex can backfire.` },
      { ch: 25, section: 'After a separation: when your ex still controls everything', text: `When a real change is needed, like a delayed flight: how to ask for it, and the question to ask before you agree to mediation if there has been fear or control.` },
      { ch: 9, section: 'When you can’t avoid contact', text: `Grey rock, the brief and boring reply: the one time you shouldn't switch to it on your own, and why a very flat reply can feel cold to an ex who is hurt or anxious.` },
      { ch: 6, section: 'What about narcissists?', text: `Is your ex a narcissist? Why the book won't diagnose anyone, and the 5 behaviors you can act on without a label.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs an ex has crossed from hard to dangerous (following you, tracking your phone, threats), and why a better text is not the answer then.` },
    ],
  },
  excerpts: [
    {
      ch: 8,
      chapterTitle: 'When the Story Keeps Changing',
      section: 'Protecting your memory',
      sub: '2. Confirm agreements in writing',
      blocks: [
        { kind: 'p', text: `After a phone call or a meeting, send one short message that says what you understood and asks them to reply. A parent confirming a holiday plan made by phone might write:` },
        { kind: 'say', lines: [`"Just confirming what we said on the phone: I'll have the kids from Saturday the 12th to Wednesday the 16th. Can you reply to confirm, or tell me if you have something different?"`] },
        { kind: 'p', text: `At work, it's an ordinary email after a meeting: "To confirm, I'll take Thursday off and Sam will cover the client call."` },
        { kind: 'p', text: `Keep it neutral. Don't add "since you always forget." And remember that a message nobody answers records what you said. It doesn't prove the other person agreed.` },
      ],
    },
    {
      ch: 25,
      chapterTitle: 'Dating, Intimacy, and Difficult Relationships',
      section: 'After a separation: when your ex still controls everything',
      sub: 'When arrangements change',
      blocks: [
        { kind: 'p', text: `Ordinary life needs some flexibility. A sick child or a delayed flight raises a practical question, so keep the request specific: "My flight is delayed. Can you cover pickup today?"` },
        { kind: 'p', text: `Whether a bigger, lasting change is allowed is a question for a family lawyer. If you're considering mediation, ask whether it suits your situation, especially if there has been fear or control.` },
      ],
    },
    {
      ch: 8,
      chapterTitle: 'When the Story Keeps Changing',
      section: 'You don’t have to win the argument about the past',
      blocks: [
        { kind: 'p', text: `When two people remember something differently, it's tempting to fight it out. You list the details. You get more and more certain, and so do they.` },
        { kind: 'p', text: `Sometimes checking the facts clears it up, in either direction. When the same dispute keeps circling, another round of argument may add nothing.` },
        { kind: 'p', text: `Arguing about what happened is a different task from deciding what happens next. You can say once how you remember it, and then move straight to the decision. You don't need their agreement about the past to make a clear choice about the present.` },
      ],
    },
  ],
  offerTitle: 'Get the book to answer pickup questions without answering insults.',
  faq: [
    {
      q: 'What if they reply with even more digs?',
      a: `Say it once: "I'll answer messages about the kids. I won't respond to the rest." After that, only answer the practical part. You don't have to repeat the line every time.`,
    },
    {
      q: 'Do I have to answer every message?',
      a: `No. When Craig wrote "Fine. But we're talking about this," Angela didn't reply, because there was nothing to answer yet. Answer what needs answering, and anything urgent about the kids.`,
    },
    {
      q: 'Will these replies make my ex stop?',
      a: `No reply can promise that. You can't make the other person communicate fairly. Short replies give them less to argue with, and they keep you out of the old fight. That part is up to you.`,
    },
    {
      q: 'What if they show up at the new time anyway?',
      a: `The book says ask a family lawyer what to do if it happens again, because the answer depends on your actual arrangement. If it's safe, note the date, time and what happened somewhere private. If you or the kids are ever in immediate danger, call 911.`,
    },
    {
      q: 'What if my kids say they want to go with the other parent?',
      a: `Keep the kids out of the schedule fight. Children shouldn't be asked to choose between parents or carry messages between them. If a lasting change is on the table, that's a question for a family lawyer.`,
    },
    {
      q: 'Should I just go "grey rock"?',
      a: `Where you aren't afraid, brief, factual, calm replies can help. But if you feel afraid of your ex, don't change how you deal with them on your own. A sudden change can make things worse. Talk to a domestic violence advocate first.`,
    },
    {
      q: 'Is this legal advice?',
      a: `No. The book gives no custody tactics and promises no outcomes. For a parenting plan, a court order or a disputed pickup, it sends you to a family lawyer.`,
    },
    {
      q: 'Is this just for moms?',
      a: `No. The story in the book is a mother and her ex-husband, but the replies are about the message, not who sent it. They work for any co-parent.`,
    },
  ],
  closeLine: 'Answer pickup questions. Skip insults.',
  ps: `Luis was sure he and his ex had agreed he'd take only the first half of spring break. Before he sent the text that said so, he checked his email. What he found, and the message he sent instead, are in {ref}.`,
  psRef: { ch: 8, section: 'When the record shows you were wrong' },
  limits: [
    `The book judges behavior instead of diagnosing anyone. These replies are about what the message says, not what kind of person sent it.`,
    `Not legal advice. No custody tactics, and no promised outcomes. For a parenting plan, a court order or a disputed pickup, talk to a family lawyer.`,
    `Scripts are not a safety plan. If you're afraid of your ex, or they control money, track your phone or monitor you, start with Chapter 11 and talk to a domestic violence advocate before you change anything.`,
    DANGER_LIMIT,
  ],
};

export default problem;
