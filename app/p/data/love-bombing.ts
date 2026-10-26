import type { Problem } from '../problems';

/**
 * Problem 7: love bombing. Hook: "New partner showering you with gifts and 'I love you' after 3 weeks?" /
 * "5 signs to watch for." The book does not number five signs: the 5 here are drawn from Chapter 10's
 * love-bombing paragraph (Pleasant pressure), so always say "drawn from Chapter 10". Never claim any sign or test tells you "for sure": the book says signs 1 to 3 (speed) prove
 * nothing alone, and to watch for weeks, not one reply. Also uses Chapter 10 (When pressure feels good, Slow it down,
 * What Shauna saw) and Chapter 25 (A new relationship that moves too fast).
 */
const loveBombing: Problem = {
  slug: 'love-bombing',
  startHere: `Start with Chapter 10 for a relationship that moves too fast.`,
  metaTitle: 'New Partner Showering You With Gifts and "I Love You" After 3 Weeks? 5 Signs to Watch For | Shadow Persuasion',
  metaDescription:
    'Roses at work, texts all day, talk of moving in within weeks. 5 signs of love bombing to watch for, why speed alone proves nothing, the words to say "slower," and what to watch for next. Free, from Chapter 10 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: 5 love bombing signs to watch for, drawn from Chapter 10',
  h1: ['New partner showering you', 'with gifts and “I love you”', 'after 3 weeks?'],
  h1Gold: '5 signs to watch for, plus the exact words to say “slower.”',
  lead: `Roses at your office. Texts all day. "I've never felt like this with anyone." It can feel wonderful and rushed at the same time. Here are 5 signs to watch for, drawn from Chapter 10, and how to tell which ones count.`,
  topLink: 'The 5 signs',
  cta: 'Read the 5 free signs',
  ctaNote: 'Free. No sign-up. Takes 3 minutes to read.',
  tool: {
    kicker: 'The 5 signs',
    title: '5 signs to watch for.',
    intro: `Gifts and constant texts don't settle it on their own. Read the 5 signs, then watch how they respond when you slow the pace. No single sign settles it for sure. A few weeks of watching tells you a lot.`,
    blocks: [
      {
        kind: 'p',
        text: `The book defines love bombing as "an early flood of attention, affection and plans for the future that builds strong attachment before you really know the person." Here are 5 signs to watch for, drawn from that chapter:`,
      },
      {
        kind: 'steps',
        items: [
          { title: 'Constant messages.', text: `Texts all day. An answer expected during your workday. "Everything okay?" when you don't reply fast enough.` },
          { title: 'Big gifts.', text: 'A dozen roses at your office in week three. Gestures much bigger than how well you know each other.' },
          { title: 'Talk of moving in or a shared future within weeks.', text: 'Meeting the kids next weekend. A trip planned for March. All before you really know the person.' },
          { title: 'Hurt or anger when you slow down.', text: `You keep your Saturday plans, and their face changes. "Oh. I thought we were building something here."` },
          { title: 'Criticism or control once you are attached.', text: 'Comments about your friends. Questions about where you were. Affection depends on doing what they want.' },
        ],
      },
      {
        kind: 'p',
        text: `Here's the part that matters most. Signs 1 to 3 are **speed**. Speed alone proves nothing. In the book's words, "Not everyone who falls fast is doing this. Some people are just enthusiastic." The warning sign is "speed combined with pressure." Signs 4 and 5 are the **pressure**. And you usually only see them after you slow down.`,
      },
      { kind: 'h', text: 'The one rule that tells them apart' },
      { kind: 'card', title: 'From Chapter 10', lines: [`**Enthusiasm leaves room for your pace, and pressure doesn't.**`] },
      {
        kind: 'p',
        text: `Someone who's excited about you can handle "Let's go slower." They may be disappointed. Then they adjust. Pressure pushes for a decision faster than you'd choose, and reacts badly when you slow down.`,
      },
      { kind: 'note', text: `If you're afraid of their reaction, or they already control or monitor you, don't test them with a new limit. Start with Chapter 11 and talk to a domestic violence advocate first.` },
      { kind: 'h', text: 'Before the next big yes: one question' },
      { kind: 'p', text: 'Before you agree to the next big thing (meeting the kids, a trip, a key to their place), ask yourself the book\'s question:' },
      { kind: 'card', lines: [`If the compliment, the promise or the deadline weren't there, would I still say yes?`] },
      {
        kind: 'p',
        text: `If the answer is no, the roses are doing the persuading. Enjoy them anyway. Then take your time: "Let me think about it and get back to you tomorrow."`,
      },
      { kind: 'h', text: 'The test: say "slower" (the exact words)' },
      { kind: 'p', text: `Keep it warm. You're not ending anything. You're setting the pace. Pick the lines that fit:` },
      {
        kind: 'say',
        lines: [
          { label: 'The kids', text: `I really like spending time with you. I'm not ready to meet your kids yet, though.` },
          { label: 'The trip', text: `And I'm not ready to plan a trip for March.` },
          { label: 'Your plans', text: `One more thing. I'm keeping Saturdays with my friends.` },
          { label: 'Messages', text: `I like hearing from you. I can't keep replying during work, though. I'll answer when I'm free.` },
          { label: 'Money, home', text: `I'm enjoying this. I'm not ready to lend money, move in or share passwords.` },
        ],
      },
      {
        kind: 'p',
        text: `If they push back, say it again, shorter. When Kevin asked, "Every Saturday? That's a lot of my weekend gone," Shauna's whole answer was: "Every Saturday. Sundays are free."`,
      },
      { kind: 'h', text: 'Then watch what happens (for weeks, not one reply)' },
      { kind: 'p', text: 'The book calls this the most telling step. Not their first answer. The next few weeks. This is where signs 4 and 5 show up, or don\'t.' },
      {
        kind: 'grid',
        items: [
          { title: 'Good sign: disappointed, then adjusts.', text: `Told to stop texting during work, Mitch said: "Okay. I guess I get excited. Dinner Friday?"` },
          { title: 'Good sign: keeps their word.', text: 'Kevin agreed the kids and the trip could wait, and never brought either up again.' },
          { title: 'Pressure: sulking until you give in.', text: `A text on Friday: "Sure you can't skip it this once?"` },
          { title: 'Pressure: guilt.', text: `"I guess I care more than you do."` },
          { title: 'Pressure: bigger gestures, more urgent plans.', text: 'Concert tickets for your Saturday, bought without asking.' },
          { title: 'Pressure: pushing past a small no.', text: `"Just this once," after you've already answered.` },
        ],
      },
      {
        kind: 'p',
        text: `One of these on a bad day doesn't settle anything. A steady pattern tells you a lot. And it can be mixed. Kevin respected two of Shauna's limits and kept pushing on the one that mattered most to her. She learned more from how he handled "slower" than she did from the roses.`,
      },
      { kind: 'h', text: 'While you find out' },
      {
        kind: 'list',
        items: [
          { text: 'Keep your own friends, routines and plans.' },
          { text: `Don't move in or combine money in the first few months.` },
          { text: `If a new partner asks for money, especially early or online, slow everything down. Don't send money to someone you haven't known well for a long time, and check their story through sources you found yourself.` },
          { text: 'Notice how they handle small nos. That tells you more than any compliment.' },
        ],
      },
      { kind: 'note', text: 'No sign tells you for sure. A few weeks of watching tells you a lot.' },
    ],
  },
  why: {
    kicker: 'Why it slips past smart people',
    title: 'Nobody guards against being liked.',
    intro: 'Most people are on guard against anger and guilt. Very few are on guard against being liked. That is part of why this kind of pressure works.',
    items: [
      { title: 'It feels like being chosen.', text: `Praise, attention and promises are lovely. They also make it easier to agree before you've thought. When your coworkers applaud the roses, "slow down" feels ungrateful.` },
      { title: 'Each step looks small.', text: `Meet the kids next weekend. A trip in March. A key. No single step looks like pressure. Together they can add up to something you'd never have agreed to on day one.` },
      { title: 'Limits are easiest at the start.', text: `Before habits form, "slower" is a small word. Months in, after you've moved your plans and your money around someone, it feels like a big one.` },
      { title: 'Your own life goes first.', text: `Shauna gave up a Saturday she'd looked forward to for a month, in one sentence, before she knew why. Friends, routines and plans are usually the first things to go.` },
    ],
  },
  bridge: {
    title: 'They accept some limits and keep pushing on one. Now what?',
    blocks: [
      {
        kind: 'p',
        text: `The 5 signs and the words for "slower" are the easy part. The hard part is mixed behavior: kind on most things, pushy on one. Here is what the book adds:`,
      },
      {
        kind: 'p',
        text: `**When they respect some limits but keep pushing on one.** Kevin agreed to wait on the kids and the trip, but kept pushing her to give up her Saturdays with friends. The book shows Shauna's final answer, and how she decided whether to keep seeing him.`,
      },
      {
        kind: 'p',
        text: `**When the pressure comes wrapped as a secret, a deadline or a promise.** "I've never told anyone this," then a request a week later. "There's no time to think." "Get me through this month and I'll pay you back." Each one gets its own answer.`,
      },
      {
        kind: 'p',
        text: `**When a rushed relationship turns controlling.** The signs to watch for, and why a calm reply is not the answer then.`,
      },
      {
        kind: 'p',
        text: `What the book can't promise: it won't tell you whether someone loves you, or read their mind. It helps you set the pace and see clearly what they do with it.`,
      },
    ],
  },
  pull: 'Enthusiasm can wait. Pressure can\'t.',
  inside: {
    kicker: 'What the book adds',
    title: 'What to decide once you\'ve seen how they handle "slower."',
    intro: 'The free part gives you the signs and the test. These pages pick up from there, page by page.',
    items: [
      { ch: 10, section: 'What Shauna saw', text: `The worked conversation with Kevin, and what Shauna decided after weeks of watching how he handled "slower."` },
      { ch: 10, section: 'Pleasant pressure', text: `Praise right before a request, false deadlines, shared secrets and promises about the future: what each sounds like, and how to reply.` },
      { ch: 10, section: 'The slow squeeze', text: `Twenty dollars, then fifty, then two hundred. How requests grow after you agree, and when to stop agreeing.` },
      { ch: 25, section: 'A new relationship that moves too fast', text: `Linda's second answer, when Mitch says "My ex used to go quiet on me too," and why his next reply was a good sign.` },
      { ch: 25, section: 'Dating again, or going back', text: `Dating again after a relationship that left you doubting yourself, and what to ask when an ex says "I've changed."` },
      { ch: 6, section: 'What about narcissists?', text: `Is it a narcissist? Why nobody can diagnose from a checklist, and the pattern you can judge instead: denial, blame, control, no repair, and punishment when you say no.` },
      { ch: 11, section: 'A hard conversation, or a dangerous one', text: `The signs that charm has turned into control (tracking your phone, controlling money, cutting you off from friends), and why a better line is not the answer then.` },
    ],
  },
  excerpts: [
    {
      ch: 10,
      chapterTitle: 'Charm, Urgency, and the Slow Squeeze',
      section: 'What Shauna saw',
      blocks: [
        {
          kind: 'talk',
          lines: [
            { who: 'Shauna', text: '"I really like spending time with you. I\'m not ready to meet your kids yet, though."' },
            { who: 'Kevin', text: '"Okay. That\'s fair. They can wait."' },
            { who: 'Shauna', text: '"And I\'m not ready to plan a trip for March."' },
            { who: 'Kevin', text: '"We can talk about Lisbon later. No rush."' },
            { who: 'Shauna', text: '"One more thing. I\'m keeping Saturdays with my friends."' },
            { who: 'Kevin', text: '"Every Saturday? That\'s a lot of my weekend gone."' },
            { who: 'Shauna', text: '"Every Saturday. Sundays are free."' },
          ],
        },
        { kind: 'p', text: 'Over the next few weeks, Kevin keeps his word about the kids and the trip. He doesn\'t bring either up. But Saturdays keep coming back. A text on Friday: "Sure you can\'t skip it this once?" Tickets for a Saturday concert he bought without asking. A comment about her friends "taking up all your time."' },
        { kind: 'p', text: 'No single message settles anything. But the whole picture is clear enough. He can respect a limit, and he respects some of hers. On the one that matters most to her, he keeps pushing after she\'s answered.' },
      ],
    },
    {
      ch: 10,
      chapterTitle: 'Charm, Urgency, and the Slow Squeeze',
      section: 'Pleasant pressure',
      blocks: [
        { kind: 'p', text: `Fake urgency. "This price ends at midnight." "I need an answer by end of day." "There's no time to think." Urgency shuts down careful thinking. Some deadlines are real: a flight fills up, a landlord has other applicants. So check. Ask what happens if you answer tomorrow, and who set the clock. If someone insists it must be decided right now and you can't check, you can say: "If it has to be decided now, my answer is no."` },
        { kind: 'p', text: `Borrowed intimacy. "I've never told anyone this," followed a week later by a request. A shared secret creates a feeling of closeness and obligation. You can keep a confidence without owing a yes: "Thank you for trusting me with that. I can't help with this, though."` },
        { kind: 'p', text: `Future faking. "Once this project's done, you'll get the promotion." "Get me through this month and I'll pay you back with interest." A promise about later is used to get you to accept something unfair now. One broken promise isn't the pattern. Look at whether promises keep replacing action while you're asked to give more. Ask for specifics: "That sounds good. Can we agree on a date and put it in writing?" And watch the track record.` },
      ],
    },
  ],
  offerTitle: 'Get the book that helps you spot love bombing before you move in, meet the kids or lend money.',
  faq: [
    {
      q: 'Does this mean anyone who falls fast is love bombing?',
      a: `No. The book is clear: "Not everyone who falls fast is doing this. Some people are just enthusiastic." Constant messages, big gifts and early talk of the future are speed. The warning sign is speed combined with pressure: hurt or anger when you slow down, or criticism and control once you're attached.`,
    },
    {
      q: 'How long do I have to watch before I know?',
      a: `The book says several weeks, not one reply. It doesn't give a magic number, and no amount of watching tells you for sure what someone feels. What you're looking for is a steady pattern in how they handle "slower."`,
    },
    {
      q: 'Will saying "slower" end the relationship?',
      a: `You're not ending anything. You're setting the pace, warmly. Someone who's simply excited about you may be disappointed, then adjust, like Mitch in the book's example. Nobody can promise how a particular person will react. How they react is exactly what you're trying to learn.`,
    },
    {
      q: 'What if they get hurt or angry when I slow down?',
      a: `One bad day doesn't settle anything. A steady pattern of sulking, guilt, bigger gestures or pushing past your no tells you a lot. If their reaction ever makes you afraid, don't keep testing them. Start with Chapter 11 and talk to a domestic violence advocate.`,
    },
    {
      q: 'They asked to borrow money. What now?',
      a: `The book's advice: slow everything down, especially if it's early or online. Romance scams are real. Don't send money to someone you haven't known well for a long time, and check their story through sources you found yourself.`,
    },
    {
      q: 'Is my new partner a narcissist?',
      a: `The book won't guess, and you can't tell from a checklist either. Narcissistic personality disorder is a diagnosis made by trained professionals. What you can judge is the pattern: does it repeat, is there ever repair, and what happens when you say no. Chapter 6 covers this.`,
    },
    {
      q: 'Is this just for women?',
      a: `No. The book's stories here happen to be women dating men (Shauna and Kevin, Linda and Mitch). The signs and the words are about behavior, so they work whoever you're dating.`,
    },
  ],
  closeLine: 'Enthusiasm can wait. Pressure can’t. Say “slower” and watch.',
  ps: 'In the book\'s worked example, Kevin agreed the kids and the trip could wait. On Saturdays, he kept pushing. Shauna learned more from how he handled "slower" than she did from the roses. What she decided, and why, is in {ref}.',
  psRef: { ch: 10, section: 'What Shauna saw' },
  limits: [
    'This is not therapy, and no sign or test can tell you for sure what someone feels or intends. It helps you watch what they do over time.',
    'The book judges behavior instead of diagnosing anyone.',
    'Never send money to someone you haven\'t known well for a long time. Check their story through sources you found yourself.',
    'If charm has turned into control, criticism, checking your phone or tracking where you are, slowing the pace isn\'t enough. Start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.',
  ],
};

export default loveBombing;
