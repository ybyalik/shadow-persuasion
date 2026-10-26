import type { Problem } from '../problems';

/**
 * Problem 8: a coworker repeats your idea in a meeting. Content reused from the hand-built preview
 * (app/p/idea-credit/page.tsx), all from Chapter 23. Promise: the email puts your work on the record
 * and asks who owns the next step. Never promise the credit or the lead role.
 */
const ideaCredit: Problem = {
  slug: 'idea-credit',
  startHere: `Start with Chapter 23 for credit at work.`,
  metaTitle: 'The Email to Send After Someone Repeats Your Idea in a Meeting | Shadow Persuasion',
  metaDescription:
    'Coworker took credit for your idea? A short email, sent the same day, to the person who decides. A free template with three asks, from Chapter 23 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE TEMPLATE: The 5-line email to send your manager today',
  h1: ['Coworker took credit', 'for your idea?'],
  h1Gold: 'Send this 5-line email today. It names your work and asks who owns the next step.',
  lead: `Five lines, sent today to the manager who ran the meeting, with your original work attached. No accusing anyone. No guessing why they did it. The template is free, right below.`,
  topLink: 'The 5-line email',
  cta: 'Read the free 5-line email',
  ctaNote: 'Free. No sign-up. Fill in the brackets in 5 minutes.',
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
      { kind: 'p', text: `Here's the worked example from Chapter 23. Keisha spent two weeks on the numbers. In the meeting, Tyler said the idea out loud and the manager said "Good thinking." This is the note the book has her send:` },
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
          { title: 'The presentation', text: `"I'd like to present my findings." (Based on what Keisha tells her manager in Chapter 23.)` },
          { title: 'Your name on the work', text: `"I'd like to be named on the work." (Also based on Keisha's words. If your manager took the credit, talk to them privately instead. See below.)` },
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
          { title: 'One clear ask.', text: `Ask to lead, present, or be named on the work. Be specific.` },
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
    title: 'You have the email. The book covers what happens after you send it.',
    blocks: [
      { kind: 'p', text: `You now have the 5-line email, the three kinds of credit to ask for, and what to say if your manager took it, if you're handed the follow-up, or if it happens again in the room. Here is what the book adds next:` },
      { kind: 'p', text: `**When the manager doesn't reply, or the story changes.** In the book, Keisha sends her note and hears nothing. A week later Tyler is leading the review, and her manager says, "It was a bit of a team idea anyway." Then: "Are you really this worried about who gets credit?" That's the moment most people back down or blow up.` },
      { kind: 'p', text: `**When you're talked over before you finish.** What to say to finish your point, and what to ask whoever runs the meeting before the next one.` },
      { kind: 'p', text: `**When it keeps happening despite your efforts.** Three things in your notes that may show a workplace problem rather than a problem with how you share your work.` },
      { kind: 'p', text: `No book can promise you the credit. This one helps make sure the people who decide have accurate information, and shows you what to ask for when they don't act on it.` },
    ],
  },
  pull: `Caring who gets credit isn't ego. It's how the next project gets handed out.`,
  limits: [
    `It can't promise the credit, a promotion or a raise. It helps you put your work on the record and ask clearly.`,
    `It won't ask you to prove anyone's motive. The goal is accurate credit, not a confession.`,
    'Keep your notes in your own words. Never forward confidential company files to a personal account.',
    'If you believe credit is being withheld because of your race, sex, age or another protected trait, or as payback for raising a concern, the book says to talk to HR or an employment lawyer.',
  ],
  inside: {
    kicker: 'What the book adds for this problem',
    title: 'The email is the start. Here\'s what comes next.',
    intro: 'The template covers the same day. These pages cover your manager\'s reply, sharing work before the next meeting, and signs that credit is denied even when your contribution is known.',
    items: [
      { ch: 23, section: 'When someone repeats your idea in a meeting', text: `The worked conversation after the story changes: how Keisha points to the record once, doesn't fight about the word "team," and asks for the part of the credit she can still get.` },
      { ch: 23, section: 'When you were passed over: learn the real rules', text: `Told you need "more presence"? The question that turns it into specific things you can do, and the 5-minute Friday record that keeps a year of work from vanishing before your review.` },
      { ch: 19, section: 'How to become credible and visible', text: `A worked example: the 3-line Friday update that took 5 minutes and got one analyst's work forwarded to her manager's boss.` },
      { ch: 20, section: 'How to build allies', text: `How to get people on your side before the meeting, not during it, without playing politics.` },
      { ch: 8, section: 'Protecting your memory', text: `When the story changes: say your version once, then stop. 4 steps that keep you out of an argument about whose memory is right.` },
      { ch: 18, section: 'How to build an alternative', text: `When the credit keeps going elsewhere: how to build another option while you still have this job.` },
    ],
  },
  excerpts: [
    {
      ch: 23,
      chapterTitle: 'Work, Pay, and Recognition',
      section: 'When someone repeats your idea in a meeting',
      sub: 'When the manager does nothing, or changes the story',
      blocks: [
        { kind: 'p', text: `Keisha sent the note. Glen didn't reply. A week later, he told the team the budget was tight, so the cost review would start now instead of waiting until spring. Tyler would lead it. When she asked him about it privately, his account of what happened had shifted.` },
        { kind: 'p', text: `Chapter 8, When the Story Keeps Changing, covers this pattern. The short version: don't argue about whose memory is right. Point to the record once, then ask about what happens next.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Keisha', text: `"The analysis for the software idea is in the summary I sent you the Monday before. I'd like to lead the review, or at least present my findings."` },
            { who: 'Glen', text: `"I thought that came from Tyler. It was a bit of a team idea anyway."` },
          ],
        },
        { kind: 'p', text: `This is fog: credit spread so thin that nobody owns it. Keisha doesn't fight about the word "team."` },
        {
          kind: 'talk',
          lines: [
            { who: 'Keisha', text: `"Here's the email from the 3rd with my analysis. The numbers Tyler is pulling are already in it."` },
            { who: 'Glen', text: `"Okay. I didn't connect the two. But I've already told Tyler he's leading it. Are you really this worried about who gets credit?"` },
          ],
        },
      ],
    },
    {
      ch: 19,
      chapterTitle: 'Be Credible, Visible, and Clear',
      section: 'Good work and visible work are different',
      blocks: [
        { kind: 'p', text: `Being reliable is something you do. Being credible is what other people believe about you, based on what they've seen. The two can drift far apart. A person can be excellent and invisible, or average and well known.` },
        { kind: 'p', text: `Many kind, capable people assume the first leads to the second. It usually doesn't. Busy people can't see what you do. They see what reaches them: a message, a meeting, a result with your name on it, a promise kept or broken.` },
      ],
    },
  ],
  offerTitle: 'Get the book with the next move after the email.',
  faq: [
    { q: `Won't the email make me look petty?`, a: `It's built not to. It goes only to the person who decides, states one fact, attaches your work, invites the coworker in, and asks one clear question. No "stole," no guesses about motive. If someone asks why you care, Chapter 23 shows the two-sentence answer Keisha gives her manager.` },
    { q: `What if they honestly had the same idea?`, a: `You may never know, and you don't need to. The email doesn't accuse anyone. It says the idea is in your summary from Monday and asks who's taking the next step. That's true either way.` },
    { q: `Should I talk to the coworker first?`, a: `The book puts the email to the person who decides first. A quiet word with the coworker is optional, and it's about the future: "Next time you're building on something I've done, could you mention it? Then I can back you up with the numbers."` },
    { q: `What if my manager doesn't reply?`, a: `In the book's worked example, Keisha's didn't. A week later Tyler was named lead. The book shows what she did next: she pointed to the record once, didn't argue about whose memory was right, and asked for the part of the credit she could still get. She got the presentation to her manager's boss, not the lead role.` },
    { q: `What if it was my manager who took the credit?`, a: `Don't correct them in front of their boss. That rarely helps. Talk privately about next time: "The summary that went to Paula was the one I put together. Next time, could my name go on it, or could I present it with you?"` },
    { q: `I froze in the meeting and said nothing. Is it too late?`, a: `No. Going blank is normal (Chapter 4 explains why). The same-day email works whether or not you spoke up in the room.` },
    { q: `Can I keep copies of my work as proof?`, a: `Keep your own short notes of what you did and when, in your own words, somewhere you're allowed to use. The book is clear: don't forward confidential company files to a personal account.` },
    { q: `Will this get me the promotion?`, a: `It can't promise that. It helps make sure the people who decide know what you did. If your work is clearly seen and still credited to others month after month, the book helps you tell whether the problem is the job, and how to build another option.` },
  ],
  closeLine: `You did the work. Put your name back on it today.`,
  ps: 'In the book\'s worked example, Keisha\'s manager asked, "Are you really this worried about who gets credit?" Her answer was two sentences, and it got her the presentation to his boss. The full exchange is in {ref}.',
  psRef: { ch: 23, section: 'When someone repeats your idea in a meeting' },
};

export default ideaCredit;
