import type { Problem } from '../problems';

/**
 * Problem 9: a coworker left and you got their job at the same pay.
 * Owner-approved hook: "Coworker quit and you got their job for free?" / "Say this to your boss to ask for the raise."
 * Script is word for word from Chapter 23 (Omar, "The conversation").
 * Order (owner-approved 26 Oct): the private preparation worksheet first (Ch 23 "Prepare before you ask", Ch 17 "How to prepare an ask"),
 * then the meeting request and opening, the reply to "no budget" with a separate summary to send (never the worksheet), Nora's Clean Ask
 * (Ch 23 "When the work keeps piling up") and "How it might end". Never promise the raise or "get PAID".
 */
const twoJobs: Problem = {
  slug: 'two-jobs',
  startHere: `Start with Chapter 23 for the pay talk.`,
  metaTitle: `Coworker Quit and You Got Their Job for Free? Say This to Ask for the Raise | Shadow Persuasion`,
  metaDescription:
    'A coworker left and their work landed on you at the same pay? The word-for-word opening to ask your boss for a raise, the reply to "there\'s no budget," and a worksheet to prepare your pay request. Free, from Chapter 23 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: The exact words to ask your boss for a raise for the extra job',
  h1: ['Coworker quit', 'and you got their job', 'for free?'],
  h1Gold: 'Say this to your boss to ask for the raise.',
  lead: `"It's just until we hire someone." That was months ago. Here are the exact words to open the pay talk, the reply to "there's no budget," and a worksheet to prepare your pay request.`,
  topLink: 'Free raise script',
  cta: 'Read the free raise script',
  ctaNote: 'Free. No sign-up. Fill in the blanks tonight.',
  tool: {
    kicker: 'The free script',
    title: 'Say this to your boss.',
    intro: `In Chapter 23 of the book, Omar, a fleet supervisor, took over a second garage when a colleague retired. Nobody adjusted his pay. First, prepare your pay request with the book's steps, using Omar's answers as the example. Then use his opening, word for word, as a fill-in script, and his reply to "no budget."`,
    blocks: [
      { kind: 'h', text: '1. Prepare your pay request' },
      { kind: 'p', text: `**Keep this worksheet to yourself.** It holds your minimum and your backup plan. It follows the book's preparation steps, with Omar's answers as the example, and it fills the brackets in your opening.` },
      {
        kind: 'card',
        title: 'What you took on',
        lines: [
          'Since [date, or the day ___ left], I have also been doing: [list every task, one per line]',
          `**Omar's:** Since Frank retired, I've run both garages.`,
          `Write it as a list. A list turns a vague feeling of overload into something a manager can act on.`,
        ],
      },
      {
        kind: 'card',
        title: 'Results you can point to',
        lines: [
          '[What you did] · [The result] · [Who knew about it]. Pick two or three.',
          `**Omar's:** Two garages instead of one. A brake overhaul across the fleet, finished under budget. Two new mechanics trained.`,
          `No record yet? Start one tonight: the date, what you did, the result. Five minutes on Friday keeps it going. Use your own words, and never copy confidential company files.`,
        ],
      },
      {
        kind: 'card',
        title: 'What the job pays',
        lines: [
          'Look up your job in your area. In the US, the Bureau of Labor Statistics publishes pay by job and region. Add current job listings that show pay ranges.',
          'Range I found: $_____ to $_____. Where each number came from: _____',
          `**Omar's:** Most fell between $74,000 and $82,000. He wrote down where each number came from.`,
        ],
      },
      {
        kind: 'card',
        title: 'Your number and your floor',
        lines: [
          'My ask (the top of what I can honestly justify): $_____',
          'My floor (what I would accept, and on what terms; keep it private): $_____',
          `**Omar's:** Ask for $79,000. Accept $75,000 with a written review date.`,
        ],
      },
      {
        kind: 'card',
        title: 'Who controls the money, and when',
        lines: [
          'Who can recommend a raise? _____ Who approves it? _____ When are pay decisions made? _____',
          `**Omar's:** Irene can recommend. Her director, Rick, approves. Payroll told him pay is set when the budget is drawn up each July.`,
          `This is where many good cases stall. If you don't know, ask your manager or HR when pay decisions are made and who approves them. Use the meeting to give your manager reasons to recommend your raise to their boss.`,
        ],
      },
      {
        kind: 'card',
        title: 'Your fallback',
        lines: [
          'If there\'s no raise or way to earn one, I will: _____',
          `**Omar's:** Start applying elsewhere. He won't say it as a threat. Knowing it stops him from accepting anything just to end the discomfort.`,
          `Don't invent another offer or bluff about leaving. If you have a real offer, you can say so honestly.`,
        ],
      },

      { kind: 'h', text: '2. The opening' },
      { kind: 'p', text: `Ask for a dedicated meeting first, so pay doesn't get squeezed into five minutes at the end of something else:` },
      { kind: 'say', lines: [{ text: `I'd like to set up thirty minutes to talk about my pay. Would Wednesday at two work?` }] },
      { kind: 'p', text: 'In the meeting, fill the brackets from your answers in step 1. Say it in this order:' },
      {
        kind: 'card',
        title: 'Your opening',
        lines: [
          `"Thanks for making time. I like this job and I want to stay. Since [date, or when ___ left], I've [the job you took on]. I [result 1] and [result 2]. [Your job] in this area [is / are] paid [range]. I'm asking for [your number]."`,
          `**Then stop talking.** Give them time to think. Don't trim your number before they answer.`,
        ],
      },
      { kind: 'p', text: `Omar's, word for word:` },
      { kind: 'say', lines: [{ label: 'Omar', text: `Thanks for making time. I like this job and I want to stay. Since Frank retired, I've run both garages. I finished the brake overhaul under budget and trained Evan and Jada. Supervisors in this area with one garage are paid $74,000 to $82,000. I'm asking for $79,000.` }] },

      { kind: 'h', text: `3. When you hear "There's no budget right now"` },
      { kind: 'p', text: `Omar's manager, Irene, said exactly that: "There's no budget for raises right now, and everyone on the team is at about the same level." His reply:` },
      { kind: 'say', lines: [{ text: `I'm not asking for special treatment. I'm asking for pay that matches the job I'm doing now, which is two garages. I know the July budget is when this gets decided. What would Rick need to see to include it?` }] },
      { kind: 'p', text: `Use your job and the name of whoever approves raises. Then offer the next step, with a date:` },
      { kind: 'say', lines: [{ text: `Understood. I'll send you a one-page summary tomorrow. Could you come back to me by the end of the month, before the July figures are set?` }] },
      { kind: 'p', text: `This summary is not the worksheet. Send your manager a separate short summary: the extra work, your results, the pay evidence and the amount you're asking for. Put the follow-up date in the email. **Leave out your minimum and your backup plan.**` },

      { kind: 'h', text: '4. How it might end' },
      {
        kind: 'grid',
        items: [
          { title: 'Yes.', text: 'Thank them, and ask for it in writing with the start date.' },
          { title: 'Lower than you asked.', text: `Don't accept on the spot unless it meets your floor. "Thank you. It's lower than I hoped. Could we get closer to [your number], or set a review in six months?"` },
          { title: '"Not now."', text: 'Ask what would need to be true, and get those conditions in writing.' },
          { title: 'Something other than money.', text: 'A title, training or an earlier review may be worth having. Say clearly that pay is still the question, and get the review date in writing.' },
        ],
      },
      { kind: 'note', text: 'In the book\'s worked example, Omar asked for $79,000. He got $75,000 from July, with a review in January. His minimum, not his target. He asked for the review date in writing.' },

      { kind: 'h', text: 'Not ready to ask for a raise? Ask which tasks you can drop.' },
      { kind: 'p', text: 'In another worked example, Nora, who runs a theater costume shop, picked up three extra jobs one task at a time. She listed them and asked:' },
      { kind: 'say', lines: [{ text: `My job has grown. I now do the inventory, the benefit show and the volunteer paperwork, on top of the shop. I can't do all of it well. Which should come off my list? If it all stays, I'd like to talk about my title and pay.` }] },
      { kind: 'p', text: 'Nothing came off that month. She wrote down the date she asked. The bigger job is now part of her pay case.' },
    ],
  },
  why: {
    kicker: 'Why it keeps happening',
    title: '"Temporary" has a way of becoming the job.',
    intro: 'Nobody decided you would do two jobs. It happened one task at a time, because you were good and said yes.',
    items: [
      { title: '"Only until we hire someone."', text: 'Temporary arrangements are easy to agree to because they have an end. Often the end never comes.' },
      { title: 'Nobody adjusts it for you.', text: 'Omar ran two garages at the old pay. Nobody refused him a raise. Nobody brought it up at all.' },
      { title: 'The person you ask may not decide.', text: 'Your manager may only be able to recommend. Someone else approves pay, often at one set time of year. Ask in the wrong month, and "no budget" can be true.' },
      { title: '"I\'ll push for it" is not a yes.', text: 'A supportive meeting is not a commitment. Without a date and a written next step, it fades.' },
      { title: 'The goalposts move.', text: `"Let's see if you can keep it up another quarter." A "not now" with no written conditions can roll on and on.` },
    ],
  },
  bridge: {
    title: `Your boss has more than one way to say no.`,
    blocks: [
      { kind: 'p', text: `"There's no budget" is usually the first answer, not the last. The free part covers that one. The book covers the ones that stall people for years:` },
      { kind: 'p', text: `**When they say your performance doesn't justify it.** What to ask instead of arguing on the spot, so you leave with something specific to work on.` },
      { kind: 'p', text: `**When "not now" keeps moving.** You hit the number and hear "Let's see if you can keep it up another quarter." Or "you're next" never quite arrives. The book shows how to name the original agreement, and how to tell an honest delay from a broken promise.` },
      { kind: 'p', text: `**When raises are refused year after year, with no way to earn one.** The four paths open to you, what each one costs, and a one-page plan you can act on without bluffing.` },
      { kind: 'p', text: `What it can't promise: a raise. No book can. It helps you give a clear case to the person who decides, at the right time, and know your next move if the answer is no.` },
    ],
  },
  pull: `You're not asking for special treatment. You're asking for pay that matches the job you're doing now.`,
  inside: {
    kicker: 'What the book adds',
    title: 'What to do after "I\'m asking for [your number]."',
    intro: 'The free script opens the talk. These pages cover the answers it leaves out, the people who really decide, and your move if it stays no.',
    items: [
      { ch: 23, section: 'Asking for a raise', text: `The two endings the free part leaves out: "your performance doesn't justify it," and a no with no path, year after year.` },
      { ch: 23, section: 'When you were passed over: learn the real rules', text: `Told you need "more presence"? The question that turns vague feedback into specific things you can do and point to, confirmed in writing.` },
      { ch: 17, section: 'How to prepare an ask', text: `How to plan your trades (what you could offer in return) and set your limit before you walk in.` },
      { ch: 17, section: 'Priya makes her ask', text: `Priya's full negotiation: what was agreed, what was refused, and the limits she kept.` },
      { ch: 19, section: 'How to become credible and visible', text: `Short updates and a simple record of your work, so the person who approves pay sees the second job you're doing.` },
      { ch: 28, section: 'Four paths, and what each one costs', text: `Accept, escalate, step back or leave: what each one costs, so you choose instead of drifting into one.` },
      { ch: 28, section: 'Build your No-Agreement Plan', text: `If it's no, with no path, year after year: a one-page plan for your next move, without bluffing.` },
    ],
  },
  excerpts: [
    {
      ch: 10,
      chapterTitle: 'Charm, Urgency, and the Slow Squeeze',
      section: 'The slow squeeze',
      blocks: [
        { kind: 'p', text: `Moving goalposts. You hit the target, and a new one appears. "Bring in ten accounts and we'll talk about a raise." Then: "Let's see if you can keep it up another quarter." Name the original agreement: "In March, the goal was ten accounts. I brought in twelve. I'd like to talk about the raise."` },
        { kind: 'p', text: `Scope creep. A role that keeps growing without anyone deciding it should. An analyst starts running reports for two other teams, then fixing the office software, then managing who has access to it. Nobody decided this. It happened because he was good and said yes. List what you actually do now, and ask for a decision about which parts stay. Chapter 23, Work, Pay, and Recognition, covers that conversation and the raise that may go with it.` },
        { kind: 'p', text: `"Temporary" that never ends. "Just until I find a place." "Only until we hire someone." Temporary arrangements are easy to agree to because they have an end. Often the end never comes. Put a date on it at the start: "Happy to help until the end of March. Let's check in then." If it's already run long, set a date now.` },
      ],
    },
    {
      ch: 28,
      chapterTitle: 'When They Still Say No',
      section: 'Name the kind of no you are facing',
      blocks: [
        { kind: 'p', text: `Start with the facts. "The spot went to a new hire" is a fact. "Lloyd never meant it" is a guess. It may be right, but your plan works better if it rests on what happened.` },
        { kind: 'p', text: `A plain refusal. They heard you and said no. "We can't offer remote work in this role." Disappointing, but you know where you stand.` },
        { kind: 'p', text: `A broken promise. They said yes, then didn't do it, maybe more than once. Lloyd's "you're next" is this kind. It's harder than a refusal, because it keeps hope alive and makes you feel unreasonable for doubting it.` },
      ],
    },
  ],
  offerTitle: 'Get the book for what your boss might say next.',
  faq: [
    { q: 'Will this get me the raise?', a: 'No book can promise that, and this one doesn\'t. It helps you make a clear case to the person who decides, at the right time. In the book, Omar asked for $79,000 and got $75,000, his floor, with a review date. Sometimes the answer is no, and the book covers that too.' },
    { q: `What if my boss says there's no budget?`, a: `Use Omar's reply: "I'm not asking for special treatment. I'm asking for pay that matches the job I'm doing now." Then ask what the person who approves pay would need to see, and offer to send a short summary, with a date for them to come back to you.` },
    { q: `My boss isn't the one who decides. Now what?`, a: `That's common. Find out who approves pay and when it gets decided. If you don't know, ask your manager or HR. Your job in the meeting is to give your manager a case they can carry upstairs.` },
    { q: 'Should I say I\'ll quit if they don\'t pay me?', a: 'No threats. Decide your fallback privately, so you don\'t accept anything just to end the discomfort. If you have a real offer, you can say so honestly. Don\'t invent one.' },
    { q: 'How much should I ask for?', a: 'Look up what your job pays in your area (in the US, the Bureau of Labor Statistics publishes pay by job and region) and check job listings with pay ranges. Ask for the top of what you can honestly justify. Set your floor privately before you walk in.' },
    { q: 'What if they offer a new title instead of money?', a: 'A title, training or an earlier review may be worth having. Say clearly that pay is still the question, and get the review date in writing.' },
    { q: 'I haven\'t kept track of what I did. Is it too late?', a: 'No. Start tonight: the date, what you did, the result. Five minutes on Friday keeps it going. Write it in your own words, and never copy confidential company files.' },
    { q: 'Do I ask in an email or in person?', a: `Ask for a dedicated thirty-minute meeting: "I'd like to set up thirty minutes to talk about my pay. Would Wednesday at two work?" After the meeting, send a short summary (the extra work, results, pay evidence and your number, not your minimum or backup plan) in an email that confirms the date they gave you.` },
  ],
  closeLine: `You're already doing the job. Ask to be paid for it.`,
  ps: 'In the book\'s worked example, Irene said, "I\'m not promising anything." That afternoon Omar sent the summary and a short email confirming the date. Four weeks later, Irene told him Rick had approved $75,000 from July, with a review in January: his floor, not his number. What to do if you hear "your performance doesn\'t justify it," or a no that comes back year after year, starts in {ref}.',
  psRef: { ch: 23, section: 'Asking for a raise' },
  limits: [
    'No book can promise a raise. This one helps you make a clear case and know what to do if the answer is no.',
    'Don\'t invent another offer or bluff about leaving. The book explains why a bluff that gets called leaves you with less.',
    'Keep your work record in your own words, and check your workplace rules first. Never copy confidential company files to a personal account.',
    'If you believe pay or credit is being held back because of your race, sex, age or another protected trait, or as payback for raising a concern, the book says to talk to HR or an employment lawyer.',
  ],
};

export default twoJobs;
