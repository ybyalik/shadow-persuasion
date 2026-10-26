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
  metaTitle: 'Narcissistic Ex Turns Every Pickup Text Into a Fight? Copy These 3 Replies | Shadow Persuasion',
  metaDescription:
    'For co-parents: 3 word-for-word replies for a "changed" pickup, a message full of digs, and "ask the kids." Plus what to do when they push back, and when to call a family lawyer. Free, from Chapter 25 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: 3 word-for-word replies for a narcissistic ex, from Chapter 25',
  h1: ['Narcissistic ex turns', 'every pickup text', 'into a fight?'],
  h1Gold: 'Copy these 3 replies.',
  lead: `For co-parents. One reply for a "changed" pickup, one for the digs, one for when they pull the kids in. Word for word from the book. Fill in your own day and time, and send.`,
  bullets: [
    `**Reply 1:** when they suddenly "change" a pickup that's been yours for years`,
    `**Reply 2:** when the text is mostly digs about your parenting, your past or your new partner`,
    `**Reply 3:** when they pull the kids in: "The kids would rather come with me. Ask Maya."`,
    `What to send when they push back, and which message to leave unanswered`,
  ],
  cta: 'YES! Show Me the 3 Replies',
  ctaNote: 'Free. No sign-up. Use them on the next text.',
  teaser: {
    label: 'The 3 replies, from Chapter 25',
    lines: [
      `**1. The pickup change:** "Our schedule has me picking the kids up from aftercare at 5 on Thursdays. I'll be there at 5 this week as usual."`,
      `**2. The digs:** "I'm happy to talk about the pickup schedule. I'm not going to discuss the past."`,
      `**3. The kids:** "Please don't ask the kids to decide the schedule. I'll see them at 5 on Thursday."`,
    ],
    note: 'Short. Polite. One job.',
  },
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
      { kind: 'p', text: `Say it once. After that, simply answer the logistics. Don't defend your parenting or bring up old history. Each of those gives them something new to argue with.` },

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
      { kind: 'p', text: `**These replies settle a text, not a custody question.** Whether a bigger, lasting change to the schedule is allowed is a question for a family lawyer.` },
    ],
  },
  why: {
    kicker: 'Why every text turns into a fight',
    title: 'The divorce is finished. The argument isn’t.',
    intro: `Here's what keeps pulling you back in, and what it costs.`,
    items: [
      { title: 'The old question: who sets the terms.', text: `The hidden pressure after a separation is the old assumption about who gets to set the terms. A "changed" pickup tests it.` },
      { title: 'Every defense is new material.', text: `Defend your parenting, bring up the recital, explain why you work late, and each one gives them something new to argue with.` },
      { title: 'Asking a text to deliver closure.', text: `Wanting them to admit they were unfair is human. A pickup message can't do that, and trying usually gets you neither the pickup nor the closure.` },
      { title: 'The kids in the middle.', text: `Once children are asked to carry messages or pick a side, the schedule fight moves into their lives too.` },
      { title: 'The 9:40 p.m. knot.', text: `The cost is your evenings: three paragraphs typed and deleted, and the same argument, in your own living room, long after the divorce is done.` },
    ],
  },
  bridge: {
    title: 'The 3 replies handle the next text. Not what happens if they show up at 3 anyway.',
    blocks: [
      { kind: 'p', text: `In the book, Angela has to think about what she'd do if Craig showed up at 3 anyway. A reply can't settle that. It needs the right advice, records kept safely, and a plan for when your ex denies what's in writing.` },
      { kind: 'p', text: `What the book can't do: make your ex communicate fairly, or give you custody tactics. It helps you choose which conversation to have, and sends you to a family lawyer for the rest.` },
    ],
  },
  pull: `Repeating the same calm sentence is not weakness. It's choosing which conversation to have.`,
  finalCta: 'See the full method for dealing with a narcissistic ex →',
  inside: {
    kicker: 'What the book adds',
    title: 'For every text after these three.',
    intro: 'The free part gives you the 3 replies. These pages cover the rest of co-parenting with someone who argues about everything.',
    items: [
      { ch: 25, section: 'After a separation: when your ex still controls everything', text: `The full Angela and Craig exchange, line by line: what she said, what she didn't say, and why repeating one calm sentence isn't weakness.` },
      { ch: 25, section: 'After a separation: when your ex still controls everything', text: `If they show up at 3 anyway: what to gather before the day, and the exact questions to take to a family lawyer or mediator.` },
      { ch: 25, section: 'After a separation: when your ex still controls everything', text: `Before you change a password: why it can alert an ex who's watching your phone, and who to talk to first.` },
      { ch: 8, section: 'Protecting your memory', text: `The one-line text to send after every phone call with your ex, so "we never agreed on 5" has a written answer.` },
      { ch: 8, section: 'When the story keeps changing anyway', text: `When your ex denies the messages that are right there: stop sending proof, send one message, and repeat one line.` },
      { ch: 9, section: 'When you can’t avoid contact', text: `Grey rock, the brief and boring reply, and the one time you shouldn't switch to it on your own.` },
      { ch: 6, section: 'What about narcissists?', text: `Is your ex a narcissist? Why the book won't diagnose anyone, and the 5 behaviors you can act on without a label.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs an ex has crossed from hard to dangerous (following you, tracking your phone, threats), and why a better text is not the answer then.` },
    ],
  },
  excerpts: [
    {
      ch: 25,
      chapterTitle: 'Dating, Intimacy, and Difficult Relationships',
      section: 'After a separation: when your ex still controls everything',
      sub: 'A practical message has a practical job',
      blocks: [
        { kind: 'p', text: `A pickup message has one job: to settle a pickup. It can't finish the marriage, win the old argument, or get him to admit he was unfair. Wanting those things is human. They belong somewhere else, with a friend, a counselor or a notebook. When you ask a logistics message to deliver closure, you usually get neither.` },
        { kind: 'p', text: `Look at what Craig's message actually contains. One piece is about the schedule. Everything else is about Angela as a person. The schedule part needs an answer. The rest does not.` },
      ],
    },
    {
      ch: 25,
      chapterTitle: 'Dating, Intimacy, and Difficult Relationships',
      section: 'After a separation: when your ex still controls everything',
      sub: 'Keep messages brief and about the kids',
      blocks: [
        { kind: 'p', text: `A useful message to an ex is short, polite and about one practical thing. Include the facts needed to handle it. Leave out feelings, history, defenses and digs.` },
        { kind: 'p', text: `Angela wrote her reply the next morning, after coffee.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Angela', text: `"Our schedule has me picking the kids up from aftercare at 5 on Thursdays. I'll be there at 5 this week as usual. If you'd like to change the schedule going forward, please send me the proposal in writing and I'll think about it."` },
            { who: 'Craig', text: `"We never agreed on 5. We said 'after work.' Typical of you to twist things."` },
            { who: 'Angela', text: `"My copy of the schedule says 5. I'll be at aftercare at 5 on Thursday."` },
            { who: 'Craig', text: `"The kids would rather come with me anyway. Ask Maya."` },
          ],
        },
        { kind: 'p', text: `This one matters. Angela doesn't ask Maya. Children shouldn't be asked to choose between parents or carry messages between them.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Angela', text: `"Please don't ask the kids to decide the schedule. I'll see them at 5 on Thursday."` },
            { who: 'Craig', text: `"Fine. But we're talking about this."` },
          ],
        },
        { kind: 'p', text: `Angela doesn't reply to the last line. There is nothing to answer yet. If he sends a written proposal, she'll consider it then.` },
      ],
    },
    {
      ch: 9,
      chapterTitle: 'Silence, Distance, and Conditional Warmth',
      section: 'When you can’t avoid contact',
      blocks: [
        { kind: 'p', text: `Sometimes you have to keep dealing with someone who uses coldness, provocation or silence: a coworker, a relative at family events, an ex you share children with.` },
        { kind: 'p', text: `First, a limit. If you feel afraid of someone, don't change how you deal with them on your own. With some people, a sudden change in how you respond can make things worse, sometimes more dangerous. Talk to a domestic violence hotline or advocate first. Chapter 11, When Pressure Becomes Danger, explains why and lists where to get help.` },
        { kind: 'p', text: `Where you aren't afraid, one approach is to keep your replies brief, factual and calm. Answer what needs answering. Skip the emotional bait. This is sometimes called grey rock, which means being as plain and uninteresting as a grey rock, so there's little for the other person to argue with.` },
        { kind: 'say', lines: [`"Pickup is at five on Friday. I'll bring the soccer bag."`] },
      ],
    },
  ],
  forYou: [
    `You share kids with an ex, and one text about pickup comes back as three paragraphs about you.`,
    `You've typed long, angry replies late at night, then deleted them.`,
    `Your ex says you agreed to things you didn't, or tells you to "ask the kids."`,
    `You want short, polite replies you can actually send, not a new fight.`,
  ],
  notForYou: [
    `You want custody tactics or legal advice. For a parenting plan, a court order or a disputed pickup, talk to a family lawyer.`,
    `You want your ex diagnosed. The book judges behavior, not people.`,
    `You want a reply that makes them fair. No reply can. It helps you choose which conversation to have.`,
    `You want closure from a text. A pickup message can't give you that.`,
    `You're afraid of your ex, or they track your phone or control money. Start with Chapter 11 and a domestic violence advocate before you change anything.`,
  ],
  offerTitle: 'Get the book that answers the schedule and leaves the rest.',
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
  closeLine: 'Answer the schedule. Leave the rest.',
  ps: `Craig sent three more messages. Angela answered with three short lines: the schedule, the schedule again, and a request not to make the kids decide. She never once defended her parenting, and she left his last line unanswered. The full exchange is in {ref}.`,
  psRef: { ch: 25, section: 'After a separation: when your ex still controls everything' },
  limits: [
    `The book judges behavior instead of diagnosing anyone. These replies are about what the message says, not what kind of person sent it.`,
    `Not legal advice. No custody tactics, and no promised outcomes. For a parenting plan, a court order or a disputed pickup, talk to a family lawyer.`,
    `Scripts are not a safety plan. If you're afraid of your ex, or they control money, track your phone or monitor you, start with Chapter 11 and talk to a domestic violence advocate before you change anything.`,
    DANGER_LIMIT,
  ],
};

export default problem;
