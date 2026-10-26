import type { Problem } from '../problems';

/**
 * Problem 8: a coworker repeats your idea in a meeting. Content reused from the hand-built preview
 * (app/p/idea-credit/page.tsx), all from Chapter 23. Promise: the email puts your work on the record
 * and asks who owns the next step. Never promise the credit or the lead role.
 */
const ideaCredit: Problem = {
  slug: 'idea-credit',
  metaTitle: 'The Email to Send After Someone Repeats Your Idea in a Meeting | Shadow Persuasion',
  metaDescription:
    'Coworker took credit for your idea? A short email, sent the same day, to the person who decides. A free template with three asks, from Chapter 23 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE TEMPLATE: The 5-line email to send your manager today',
  h1: ['Coworker took credit', 'for your idea?'],
  h1Gold: 'Send this 5-line email today. It names your work and asks who owns the next step.',
  lead: `Five lines, sent today to the manager who ran the meeting, with your original work attached. No accusing anyone. No guessing why they did it. The template is free, right below.`,
  bullets: [
    'The 5 lines to send the same day, plus a filled-in example from the book',
    'The 3 kinds of credit that count at work, and the line that asks for one by name',
    `What to say in the room next time, in one or two sentences`,
    `The one line for "Can you do the follow-up for him?" (the trap that gives you the work and him the credit)`,
  ],
  cta: 'YES! Show Me the 5-Line Email',
  ctaNote: 'Free. No sign-up. Fill in the brackets in 5 minutes.',
  teaser: {
    label: `TO: Glen · RE: Today's meeting`,
    lines: [
      `Hi Glen, following up on today's meeting. The software overlap Tyler mentioned is the one in my summary from Monday, attached again. It shows three tools doing the same job, at about $40,000 a year.`,
      `==I'd be glad to lead the next step==, and Tyler's welcome to join. Can we confirm who's taking it?`,
    ],
    note: 'Same day. Original attached.',
  },
  tool: {
    kicker: 'The free template',
    title: 'The 5-line email.',
    intro: 'Five lines. Send them to the manager who ran the meeting, before you leave today. Fill the brackets, pick one ask for line 4, attach your original work, send.',
    blocks: [
      {
        kind: 'card',
        title: 'Copy this: 5 lines',
        lines: [
          `**1.** Hi [Manager], following up on today's meeting.`,
          `**2.** The [idea] [Colleague] mentioned is the one in my [summary] from [day], attached again.`,
          `**3.** It shows [the one key number].`,
          `**4.** ==I'd be glad to [lead the next step]==, and [Colleague]'s welcome to join.`,
          `**5.** Can we confirm who's taking it?`,
        ],
      },
      { kind: 'p', text: `Line 2 names your work and the day you sent it. Line 5 asks who owns the next step. In line 4, put the one kind of credit you want (below).` },
      { kind: 'p', text: `Here's the real one from the book. Keisha spent two weeks on the numbers. In the meeting, Tyler said the idea out loud and the manager said "Good thinking." This is what she could send that afternoon:` },
      {
        kind: 'card',
        title: 'Filled in, from Chapter 23',
        lines: [
          `"Hi Glen, following up on today's meeting. The software overlap Tyler mentioned is the one in my summary from Monday, attached again. It shows three tools doing the same job, at about $40,000 a year. I'd be glad to lead the next step, and Tyler's welcome to join. Can we confirm who's taking it?"`,
        ],
      },
      { kind: 'h', text: 'Line 4: pick one ask. At work, credit means one of three things.' },
      { kind: 'p', text: 'Credit is rarely a thank-you. It means your name on the work, the chance to present it, or ownership of the next step. Those are what decision-makers remember. Ask for one by name.' },
      {
        kind: 'steps',
        items: [
          { title: 'The next step', text: `"I'd be glad to lead the next step." (Keisha's email, Chapter 23.)` },
          { title: 'The presentation', text: `"I'd like to present my findings." (Keisha's words to her manager, Chapter 23.)` },
          { title: 'Your name on the work', text: `"I'd like to be named on the work." (Also Keisha's words. If your manager took the credit, talk to them privately instead. See below.)` },
        ],
      },
      { kind: 'h', text: 'Six rules that keep it from sounding petty.' },
      {
        kind: 'grid',
        items: [
          { title: 'Same day.', text: `Before everyone's memory settles on "it was his idea."` },
          { title: 'To the person who decides.', text: 'Not the coworker. Not the whole team.' },
          { title: 'Attach the original.', text: `The date on it says "I had it first" so you don't have to.` },
          { title: 'One number.', text: 'One key finding shows the work is real and further along.' },
          { title: 'One clear ask.', text: `The lead, the presentation, or your name. Not "just so you know."` },
          { title: 'Invite him in.', text: `It keeps it about the work, not a feud, and it's easy to say yes to.` },
        ],
      },
      { kind: 'note', text: `Never put in it: "stole," "took my idea," guesses about his motive, old grievances, or the whole team on copy.` },
      { kind: 'h', text: 'If it was your manager who took the credit' },
      { kind: 'p', text: `Skip the email. Correcting your manager in front of their boss rarely helps. Talk to them privately, about next time:` },
      { kind: 'say', lines: [{ text: `The summary that went to Paula was the one I put together. Next time, could my name go on it, or could I present it with you?` }] },
      { kind: 'p', text: `Then keep putting your name on your own updates, in the places your team normally shares work.` },
      { kind: 'h', text: 'If they ask you to do the follow-up for him' },
      { kind: 'p', text: `Watch for this trap: "Since you know the numbers, can you do the follow-up for Tyler?" That gives you the effort and leaves the credit with someone else. Before you say yes, ask what you would own:` },
      { kind: 'say', lines: [{ text: `I'm glad to do the follow-up. If I'm doing it, I'd like to present it and be named as the owner of that part.` }] },
      { kind: 'h', text: 'Next time, in the room' },
      { kind: 'p', text: 'If it happens again, build on what was said instead of accusing anyone. A sentence or two is enough:' },
      {
        kind: 'say',
        lines: [
          { text: `Glad that's come up. I sent Glen a summary on Monday with the numbers. I can walk everyone through it.` },
          { text: `I've already done the analysis. I'd like to lead the cost review. Can we agree who handles the next step?` },
        ],
      },
      { kind: 'p', text: 'Better still, get there first. Send your work to the person who decides, with your name on it, before the meeting, and ask for ten minutes to present it.' },
      { kind: 'h', text: 'A quiet word with the colleague (optional)' },
      { kind: 'p', text: 'Keep it about the future, not the past:' },
      { kind: 'say', lines: [{ text: `Next time you're building on something I've done, could you mention it? Then I can back you up with the numbers.` }] },
      { kind: 'p', text: `Then keep your own short note of what you contributed and when, in a place you control and are allowed to use. Don't forward confidential company files to a personal account.` },
    ],
  },
  why: {
    kicker: 'Why staying quiet costs more than it feels',
    title: 'Managers remember voices, not inboxes.',
    intro: 'Credit, projects and pay are decided by busy people, based on what reaches them. In a meeting, whoever says the idea out loud is who they remember. Nobody decides it. It just sets. And it quietly costs you:',
    items: [
      { title: 'The next project.', text: 'When the manager picks who leads, they may well remember the voice saying the idea, and forget who did the analysis.' },
      { title: 'The review.', text: 'At review time, the record is whatever the manager remembers. Two weeks of work can vanish from it.' },
      { title: 'The raise.', text: `A pay case is built from work someone can point to. Work credited to someone else can be missing from your pay case.` },
      { title: 'The follow-up trap.', text: `"Since you know the numbers, can you help him?" Now you have the effort and he has the credit.` },
    ],
  },
  bridge: {
    title: 'The email is the first move. The next one is harder.',
    blocks: [
      { kind: 'p', text: `In the book, Keisha sent hers. Her manager didn't reply. A week later he told the team the review would start now, and Tyler would lead it.` },
      { kind: 'p', text: `When she asked him about it, his story had shifted. "It was a bit of a team idea anyway." Then: "Are you really this worried about who gets credit?"` },
      { kind: 'p', text: `That's the moment most people back down or blow up. The template doesn't cover it. The book does, line by line:` },
      {
        kind: 'list',
        items: [
          { text: 'What to say when the manager does nothing, or the story changes, and how to answer "It was a team idea" without sounding petty.', ref: { ch: 23, section: 'When someone repeats your idea in a meeting' } },
          { text: 'Why not to argue about whose memory is right: point to the record once, then ask about what happens next.', ref: { ch: 8, section: 'Protecting your memory' } },
          { text: 'How to get your work seen before the meeting, so it happens less.', ref: { ch: 19, section: 'Good work and visible work are different' } },
          { text: 'How to build allies who see your work directly, without becoming political.', ref: { ch: 20, section: 'How to build allies' } },
          { text: 'When it keeps happening: how to tell a visibility problem from a job problem, and how to build another option while you still have this one.', ref: { ch: 18, section: 'How to build an alternative' } },
        ],
      },
      { kind: 'p', text: `Keisha didn't get the lead role. She did get her name in front of her manager's boss, the presentation that carries the credit, and a written record of who does what. No book can promise you the credit. This one helps you make sure the people who decide have accurate information.` },
    ],
  },
  pull: `Caring who gets credit isn't ego. It's how the next project gets handed out.`,
  finalCta: 'See the full method for getting credit at work →',
  limits: [
    `It can't promise the credit, a promotion or a raise. It helps you put your work on the record and ask clearly.`,
    `It won't ask you to prove anyone's motive. The goal is accurate credit, not a confession.`,
    'Keep your notes in your own words. Never forward confidential company files to a personal account.',
    'If you believe credit is being withheld because of your race, sex, age or another protected trait, or as payback for raising a concern, the book says to talk to HR or an employment lawyer.',
  ],
  inside: {
    kicker: 'What the book adds for this problem',
    title: 'The email is line one. Here is the rest.',
    intro: 'The template covers the same day. The book covers what your manager says back, what to do before the next meeting, and how to tell when it is no longer about visibility.',
    items: [
      { ch: 23, section: 'When someone repeats your idea in a meeting', text: `What to say when your manager answers "It was a bit of a team idea anyway" and "Are you really this worried about who gets credit?" Keisha's full reply, line by line.` },
      { ch: 23, section: 'When someone repeats your idea in a meeting', text: `The one email to send before the meeting, so your name is on the idea before anyone else says it.` },
      { ch: 23, section: 'When someone repeats your idea in a meeting', text: `Talked over halfway through your point? The line to finish it, and what to ask for before the next meeting.` },
      { ch: 23, section: 'When someone repeats your idea in a meeting', text: `The 3 things to check in your notes that tell you it may be the job, not how you present your work.` },
      { ch: 23, section: 'When you were passed over: learn the real rules', text: `Told you need "more presence"? The question that turns it into specific things you can do, and the 5-minute Friday record that keeps a year of work from vanishing before your review.` },
      { ch: 19, section: 'How to become credible and visible', text: `The 3-line Friday update that took 5 minutes and got one analyst's work forwarded to her manager's boss.` },
      { ch: 20, section: 'How to build allies', text: `How to get people on your side before the meeting, not during it, without playing politics.` },
      { ch: 8, section: 'Protecting your memory', text: `When the story changes: say your version once, then stop. 4 steps that keep you out of an argument about whose memory is right.` },
      { ch: 18, section: 'How to build an alternative', text: `When it keeps happening no matter what you do: how to build another option while you still have this job.` },
    ],
  },
  excerpts: [
    {
      ch: 23,
      chapterTitle: 'Work, Pay, and Recognition',
      section: 'When someone repeats your idea in a meeting',
      sub: 'Afterward: send a short note the same day',
      blocks: [
        { kind: 'p', text: 'Write to the person who decides. Keep it factual and friendly. Attach the original work.' },
        { kind: 'say', lines: ['"Hi Glen, following up on today\'s meeting. The software overlap Tyler mentioned is the one in my summary from Monday, attached again. It shows three tools doing the same job, at about $40,000 a year. I\'d be glad to lead the next step, and Tyler\'s welcome to join. Can we confirm who\'s taking it?"'] },
        { kind: 'p', text: 'You can also have a quiet word with the colleague, about the future: "Next time you\'re building on something I\'ve done, could you mention it? Then I can back you up with the numbers."' },
      ],
    },
    {
      ch: 23,
      chapterTitle: 'Work, Pay, and Recognition',
      section: 'When someone repeats your idea in a meeting',
      sub: 'In the meeting: correct it calmly',
      blocks: [
        { kind: 'p', text: 'If it happens anyway, build on what was said instead of accusing anyone. Keep it to a sentence or two. A short correction is easy for the room to follow, and it keeps the talk on the work instead of on how you said it.' },
        { kind: 'say', lines: ['"Glad that\'s come up. I sent Glen a summary on Monday with the numbers. I can walk everyone through it."', '"I\'ve already done the analysis. I\'d like to lead the cost review. Can we agree who handles the next step?"'] },
        { kind: 'p', text: 'If you go blank, as Keisha did, that\'s normal (Chapter 4 explains why). The next step works whether or not you spoke up.' },
      ],
    },
    {
      ch: 23,
      chapterTitle: 'Work, Pay, and Recognition',
      section: 'When someone repeats your idea in a meeting',
      sub: 'When the manager does nothing, or changes the story',
      blocks: [
        {
          kind: 'talk',
          lines: [
            { who: 'Keisha', text: '"Here\'s the email from the 3rd with my analysis. The numbers Tyler is pulling are already in it."' },
            { who: 'Glen', text: '"Okay. I didn\'t connect the two. But I\'ve already told Tyler he\'s leading it. Are you really this worried about who gets credit?"' },
            { who: 'Keisha', text: '"Credit affects who gets the next project, so I\'d like it to be accurate. If Tyler leads, I\'d like to be named on the work and present the cost findings when it goes to Paula."' },
            { who: 'Glen', text: '"Fine. Tyler runs the project. You present the cost section to Paula next month."' },
            { who: 'Keisha', text: '"Thanks. I\'ll send a quick note so we\'re all clear."' },
          ],
        },
        { kind: 'p', text: 'She doesn\'t get the lead role. She does get her name in front of Glen\'s boss, the presentation that carries the credit, and a written record of who does what.' },
      ],
    },
  ],
  forYou: [
    `You did the work, a coworker said it out loud in the meeting, and the room gave them the credit.`,
    `You froze in the meeting, then thought of five things you could have said that night.`,
    `You want your name back on your work without starting a feud with the coworker.`,
    `Your manager remembers what gets said in meetings, not what sits in their inbox.`,
    `You've been told you need "more presence" and have no idea what that means.`,
  ],
  notForYou: [
    `You want to expose the coworker or prove they did it on purpose. The goal here is accurate credit, not a confession.`,
    `You want a promise of the credit, the lead role, a promotion or a raise. No book can promise those.`,
    `You want to build a case by forwarding company files to your personal account. Don't.`,
    `You want body-language tricks or fake confidence. Chapter 19 explains why those don't fix this.`,
    `You think it's discrimination or payback for raising a concern. The book says to talk to HR or an employment lawyer. This isn't legal advice.`,
  ],
  offerTitle: 'Get the book with the next move for every time your work gets someone else\'s name.',
  faq: [
    { q: `Won't the email make me look petty?`, a: `It's built not to. It goes only to the person who decides, states one fact, attaches your work, invites the coworker in, and asks one clear question. No "stole," no guesses about motive. If someone asks why you care, Keisha's answer works: "Credit affects who gets the next project, so I'd like it to be accurate."` },
    { q: `What if they honestly had the same idea?`, a: `You may never know, and you don't need to. The email doesn't accuse anyone. It says the idea is in your summary from Monday and asks who's taking the next step. That's true either way.` },
    { q: `Should I talk to the coworker first?`, a: `The book puts the email to the person who decides first. A quiet word with the coworker is optional, and it's about the future: "Next time you're building on something I've done, could you mention it? Then I can back you up with the numbers."` },
    { q: `What if my manager doesn't reply?`, a: `Keisha's didn't. A week later Tyler was named lead. The book shows what she did next: she pointed to the record once, didn't argue about whose memory was right, and asked for the part of the credit she could still get. She got the presentation to her manager's boss, not the lead role.` },
    { q: `What if it was my manager who took the credit?`, a: `Don't correct them in front of their boss. That rarely helps. Talk privately about next time: "The summary that went to Paula was the one I put together. Next time, could my name go on it, or could I present it with you?"` },
    { q: `I froze in the meeting and said nothing. Is it too late?`, a: `No. Going blank is normal (Chapter 4 explains why). The same-day email works whether or not you spoke up in the room.` },
    { q: `Can I keep copies of my work as proof?`, a: `Keep your own short notes of what you did and when, in your own words, somewhere you're allowed to use. The book is clear: don't forward confidential company files to a personal account.` },
    { q: `Will this get me the promotion?`, a: `It can't promise that. It helps make sure the people who decide know what you did. If your work is clearly seen and still credited to others month after month, the book helps you tell whether the problem is the job, and how to build another option.` },
  ],
  closeLine: `You did the work. Put your name back on it today.`,
  ps: 'Keisha\'s manager asked, "Are you really this worried about who gets credit?" Her answer was two sentences, and it got her the presentation to his boss. The full exchange is in {ref}.',
  psRef: { ch: 23, section: 'When someone repeats your idea in a meeting' },
};

export default ideaCredit;
