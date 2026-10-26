/**
 * Problem page: said yes again to something you didn't want to do.
 * Owner-approved hook: "Said yes again to something you didn't want to do?" / "Copy this text to take it back today."
 * Tool leads with ONE take-back text built from Ch 7 "Taking back a yes you gave too fast" (Hector's line and the
 * 5 steps), then the time-buying line for next time (Ch 31 Day 1, Ch 5 "Notice, Pause, Hold"), then the hour-after
 * routine (Ch 26 "The hour after the call", generalized from a call to any no).
 */
import type { Problem } from '../problems';

const DANGER_LIMIT = `If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.`;

const problem: Problem = {
  slug: 'people-pleasing',
  metaTitle: `Said Yes to Something You Didn't Want to Do? Copy This Text to Take It Back | Shadow Persuasion`,
  metaDescription: `One word-for-word text to take back a yes you gave too fast, the line that buys you time before the next one, and a 4-step plan for the guilty hour after. Free, from Chapter 7 of Shadow Persuasion: The Hidden Rules of Power.`,
  topBar: `FREE: The text that takes back a yes you didn't mean`,
  h1: [`Said yes again`, `to something you`, `didn't want to do?`],
  h1Gold: `Copy this text to take it back today.`,
  lead: `It came out before they finished asking. Now it's on your calendar, and you're dreading it. Here's the exact text to send today, then the line that stops the next automatic yes.`,
  bullets: [
    `**One take-back text**, word for word. Fill in two blanks and send it.`,
    `What to say when they answer, "But you gave me your word"`,
    `The one line that buys you time before the next yes`,
    `A 4-step plan for the guilty hour after you hit send`,
  ],
  cta: `YES! Give Me the Text`,
  ctaNote: `Free. No sign-up. Send it today.`,
  teaser: {
    label: `What Hector said on Monday morning`,
    lines: [
      `On Sunday he'd agreed to run the parish fundraiser again. On Monday he called back:`,
      `=="I said yes too quickly on Sunday. I'm not going to be able to run it this year."==`,
      `Then one offer: his notes, and the bake sale table.`,
    ],
    note: `One sentence. Not a speech.`,
  },
  tool: {
    kicker: `The free text`,
    title: `Copy it. Fill two blanks. Send it today.`,
    intro: `This text is built from Chapter 7 of the book: the words Hector used to take back his yes, set in the book's five steps. Under it: what to say if they push back, the line for next time, and what to do with the guilt afterward.`,
    blocks: [
      { kind: 'h', text: `1. The take-back text` },
      {
        kind: 'card',
        title: `Copy this`,
        lines: [
          `"Hi [name]. I said yes too quickly [on Sunday]. I'm not going to be able to [do the thing]. I can [one smaller thing you'll really do], if that helps."`,
          `No real offer to make? Delete the last sentence. The text still works.`,
        ],
      },
      { kind: 'p', text: `Why it's built this way. These are the book's five steps for taking back a yes:` },
      {
        kind: 'steps',
        items: [
          { title: `Do it soon.`, text: `Speaking up early gives them more time to adjust. That's why the text goes today, not the night before.` },
          { title: `Own it briefly.`, text: `"I said yes too quickly." One sentence, not a speech.` },
          { title: `Give the clear new answer.`, text: `"I'm not going to be able to." Not "I'm not sure," which just invites more pressure.` },
          { title: `Offer what you genuinely can, if anything.`, text: `A handover, a smaller part, a name. Only offer what you'll actually do.` },
          { title: `Don't reopen it.`, text: `Once you've sent it, you don't need to send it again with more reasons.` },
        ],
      },
      { kind: 'p', text: `**When a text isn't enough.** If someone has already relied on your yes (they booked flights because you said you'd host), the book says that deserves more than a text. Call, say so, and help fix what you can. If money has been spent, a contract signed or legal duties are involved, get proper advice first.` },

      { kind: 'h', text: `2. If they say "But you gave me your word"` },
      { kind: 'p', text: `That's the first thing Gail said to Hector. He didn't argue, and he didn't list everything he'd done for her. He owned it:` },
      { kind: 'say', lines: [{ label: `Hector`, text: `I did, and I'm sorry to go back on it. That's why I'm calling now and not in September.` }] },
      { kind: 'p', text: `If they ask again, give the same answer again. **No new reasons.** Five reasons give them five things to argue with.` },

      { kind: 'h', text: `3. Next time: buy time before you answer` },
      { kind: 'p', text: `The take-back text fixes this yes. This line stops the next one. You don't have to change your answer. **Just change the speed.**` },
      { kind: 'say', lines: [{ text: `Let me check and get back to you.` }] },
      { kind: 'p', text: `"Let me check" is one of the most ordinary sentences in adult life. You can still say yes later. If they push for an answer on the spot, the book's firmer version:` },
      { kind: 'say', lines: [{ text: `I'm not going to decide this right now. I'll call you tomorrow.` }] },

      { kind: 'h', text: `4. The hour after you send it` },
      { kind: 'p', text: `Sending the text is one part. The hour afterward can be harder. You may feel cruel, anxious, or about twelve years old. This short routine is adapted from Chapter 26. It won't make the guilt vanish. It helps you check whether you **owe something** or just **feel uncomfortable**.` },
      {
        kind: 'steps',
        items: [
          { title: `Check for real harm.`, text: `Did you break a promise someone was counting on, or say something unkind? If so, plan a short apology for tomorrow. If you only took back a yes early and kindly, the bad feeling is discomfort, not a debt.` },
          { title: `Hold the make-up message.`, text: `A quick "Sorry, forget it, I'll do it!" undoes everything. If you need to write it, write it in your notes and look again tomorrow.` },
          { title: `Settle your body.`, text: `Walk around the block, drink some water, breathe out slowly, do something with your hands.` },
          { title: `Decide whether a follow-up has a job.`, text: `Sending the notes you promised or answering a real question are jobs. Easing your own guilt is not.` },
        ],
      },
      { kind: 'note', text: `Guilt that comes back doesn't prove you did something wrong.` },
    ],
  },
  why: {
    kicker: `Why the yes keeps coming out`,
    title: `It isn't weakness. It's a contract you never signed.`,
    intro: `The book calls it The Good Person Contract: unspoken rules that say yes for you before you've thought. Most people find one or two that fit almost perfectly.`,
    items: [
      { title: `"Other people's feelings are your job."`, text: `Their face falls and your no turns into "maybe." Their feelings are real. They still belong to the person feeling them.` },
      { title: `"Your needs are a burden."`, text: `"I don't mind," when you do. "Sorry to bother you, it's totally fine if not."` },
      { title: `"Conflict means something went wrong."`, text: `Every disagreement feels like a small emergency, so you give in early to end it.` },
      { title: `People learn from your yes.`, text: `The instant yes teaches them your time needs no thought. Most of them aren't scheming. Your coworker simply learned you never say no, so she asks you first.` },
      { title: `The guilt is borrowed.`, text: `Real guilt tells you when you've broken a promise or caused harm. Guilt pressure borrows that feeling for a fair decision someone doesn't like. Hector said yes because Gail reminded him of the meals people brought when Elena passed. Those meals were a gift. The fundraiser was a favor he could decline.` },
    ],
  },
  bridge: {
    title: `The text takes it back. Their reply is the hard part.`,
    blocks: [
      { kind: 'p', text: `Hector's call didn't end with "You gave me your word." Gail tried, "But who else is going to do it?" Then the big one: "After everything this parish did for you."` },
      { kind: 'p', text: `That's where most people fold, or apologize their way back into the job. The free part above doesn't cover what to say next. The book does:` },
      {
        kind: 'list',
        items: [
          { text: `Hector's answer to "After everything this parish did for you," and what he did when Gail hung up without saying goodbye.`, ref: { ch: 7, section: 'Taking back a yes you gave too fast' } },
          { text: `What to say to "A real friend would do this" and "If you loved me."`, ref: { ch: 7, section: 'When affection or character is made conditional' } },
          { text: `How to tell a duty from a favor, so guilt stops making the decision.`, ref: { ch: 7, section: 'Duties, favors, and agreements' } },
          { text: `What to do at two o'clock, after you said "Let me check my week," and he sighs.`, ref: { ch: 5, section: 'Notice, Pause, Hold' } },
          { text: `What to do when someone keeps refusing to accept your no.`, ref: { ch: 28, section: 'Build your No-Agreement Plan' } },
        ],
      },
      { kind: 'p', text: `One honest thing: the book can't make the guilt skip you. Hector felt guilty for about a week. He also sent his notes on Thursday, before his first woodworking class.` },
    ],
  },
  pull: `A yes you didn't choose isn't kindness. It's a bill you pay later.`,
  finalCta: `See the full method for taking back a yes →`,
  inside: {
    kicker: `What the book adds`,
    title: `The words for every guilt trip that comes after the text.`,
    intro: `The free text handles one yes. These pages handle the pushback, the next request, and the person who won't take no.`,
    items: [
      { ch: 7, section: 'Taking back a yes you gave too fast', text: `What to do when the guilt gets louder and other people get recruited: "Everyone's surprised you'd do this."` },
      { ch: 7, section: 'When affection or character is made conditional', text: `The one-line answer to "I thought you were someone I could count on," and the one to "If you loved me, you'd do this."` },
      { ch: 7, section: 'When past help is treated as a debt', text: `What to say when they bring up everything they've done for you, without starting a list of what you've done for them.` },
      { ch: 7, section: 'Duties, favors, and agreements', text: `The quick test that tells you whether you owe this or only feel like you do. (Hosting Thanksgiving for twelve years is still a favor.)` },
      { ch: 3, section: 'Gloria goes back', text: `Gloria's talk with her boss the morning after a double yes: she kept one job, handed back the other, and let the silence sit.` },
      { ch: 3, section: 'What other people learn from you', text: `The six habits that teach people to ask you first, from the instant yes to the "Are we okay?" text after every small disagreement.` },
      { ch: 3, section: 'The five clauses', text: `The five rules of The Good Person Contract that say yes for you, and a fairer rule to swap in for each one.` },
      { ch: 5, section: 'Notice, Pause, Hold', text: `How to hold a no when your coworker asks you to cover his shift for the third Monday running, and sighs when you say no.` },
      { ch: 31, section: 'Day 1: The pause', text: `A three-day practice plan, low stakes first: the pause on day one, no reflex "sorry" on day two, one clean no on day three.` },
    ],
  },
  excerpts: [
    {
      ch: 7,
      chapterTitle: 'Guilt, Favors, and Hidden Debts',
      section: 'Taking back a yes you gave too fast',
      blocks: [
        { kind: 'p', text: `Here's Hector, on Monday morning, calling Gail.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Hector', text: `"Gail, it's Hector. I need to talk to you about the fundraiser. I said yes too quickly on Sunday. I'm not going to be able to run it this year."` },
            { who: 'Gail', text: `"Oh, Hector. You gave me your word."` },
            { who: 'Hector', text: `"I did, and I'm sorry to go back on it. That's why I'm calling now and not in September."` },
            { who: 'Gail', text: `"But who else is going to do it? You know how it works."` },
            { who: 'Hector', text: `"I do. I can write down everything I know: the vendors, the timeline, who to call for tables. And I'll run the bake sale table on the day."` },
            { who: 'Gail', text: `"That's not the same as running it."` },
            { who: 'Hector', text: `"No, it isn't. It's what I can do this year."` },
            { who: 'Gail', text: `"I just don't understand. After everything this parish did for you."` },
          ],
        },
        { kind: 'p', text: `Hector doesn't argue about whether he owes the parish. He doesn't list the years he's given.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Hector', text: `"People here were very good to me. I'll never forget that. I still can't take this on."` },
            { who: 'Gail', text: `"Well. I suppose I'll have to find someone."` },
            { who: 'Hector', text: `"I'll have the notes to you by Friday."` },
            { who: 'Gail', text: `"Fine."` },
          ],
        },
        { kind: 'p', text: `Gail hangs up without saying goodbye. At coffee the next Sunday, she's polite but cool. Hector feels it, and he feels guilty for about a week.` },
        { kind: 'p', text: `He also sends the notes on Thursday, before his first woodworking class.` },
      ],
    },
    {
      ch: 3,
      chapterTitle: 'The Rules You Never Chose',
      section: 'Gloria goes back',
      blocks: [
        { kind: 'p', text: `Gloria goes to Stuart's office the next morning.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Gloria', text: `"Stuart, about yesterday. I said yes to both things before I'd looked at my calendar."` },
            { who: 'Stuart', text: `"Oh? Is something wrong?"` },
            { who: 'Gloria', text: `"Nothing's wrong. Next week is quarter-end. I can train the new hire, but I'll need two afternoons where I'm not covering the phones."` },
            { who: 'Stuart', text: `"We can probably manage that. And the lunch?"` },
            { who: 'Gloria', text: `"I'm not able to organize the lunch this year."` },
            { who: 'Stuart', text: `"Really? You're so good at it. Nobody else knows the caterer."` },
          ],
        },
        { kind: 'p', text: `Gloria feels the old flinch in her chest. She doesn't add five reasons.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Gloria', text: `"I'm glad it went well. I can give whoever does it my notes and the caterer's number."` },
            { who: 'Stuart', text: `"I don't know who else would do it."` },
          ],
        },
        { kind: 'p', text: `A silence. Gloria lets it sit. Who organizes the lunch is Stuart's decision, not hers.` },
      ],
    },
    {
      ch: 26,
      chapterTitle: 'Family, Friends, and the Roles That Stick',
      section: 'The parent who still makes you feel small',
      sub: 'The hour after the call',
      blocks: [
        { kind: 'p', text: `Holding a limit on the phone is one part. The hour afterward can be harder. You may feel cruel, anxious, or about twelve years old. A short routine helps.` },
        { kind: 'p', text: `1. Check for real harm. Did you break a promise, or say something unkind? If so, plan a short apology for tomorrow. If you only declined a topic or ended on time, the bad feeling is discomfort, not a debt.` },
        { kind: 'p', text: `2. Hold the make-up message. A quick "Sorry if I was short, love you!" usually takes the limit back. If you need to write it, write it in your notes and look again tomorrow.` },
        { kind: 'p', text: `3. Settle your body. Walk around the block, drink some water, breathe out slowly, do something with your hands.` },
        { kind: 'p', text: `4. Decide whether a follow-up has a job. Confirming a visit, making a real apology or answering a real question are jobs. Easing your own guilt is not.` },
      ],
    },
  ],
  forYou: [
    `You said yes this week to something you didn't want to do, and it's still on your calendar.`,
    `You agree before they finish asking, then spend the drive home rehearsing what you should have said.`,
    `You give five reasons for a no, and they argue with all five.`,
    `You send a "Sorry if I was short!" text an hour after every no.`,
    `You want to stay generous, and pick who gets your time.`,
  ],
  notForYou: [
    `You want out of a signed contract, money already spent, or a legal duty. Get proper advice first. The book says so too.`,
    `You want a way to make people happy about your no. No book can control how anyone reacts.`,
    `You're looking for therapy. This is practical words and steps for everyday requests.`,
    `You're afraid of the person asking. Start with Chapter 11, When Pressure Becomes Danger, and the hotline below.`,
    `You want permission to stop caring. The book is about choosing your yes, not giving up on people.`,
  ],
  offerTitle: `Get the book with the words for every yes you want back.`,
  faq: [
    { q: `Isn't it rude to take back a yes?`, a: `The book's answer: you're allowed to. The earlier you speak up, the less it usually costs everyone. Waiting until the night before leaves them with few options. One sentence owning it, a clear new answer, and an offer only if you'll really do it. That's polite.` },
    { q: `Should I text it or call?`, a: `A text is fine for most everyday yeses. If someone has already relied on your yes (they booked flights because you said you'd host), the book says that deserves more than a text. Call, say so, and help fix what you can.` },
    { q: `What if they say, "But you gave me your word"?`, a: `Use Hector's reply: "I did, and I'm sorry to go back on it. That's why I'm calling now and not in September." Own it. Don't argue. His answer to the harder line that came next, "After everything this parish did for you," is in Chapter 7.` },
    { q: `Do I have to give a reason?`, a: `No. A short reason that helps them plan is fine. What you're dropping is the pile of reasons offered to earn permission. Each extra one is something to argue with.` },
    { q: `What if the guilt doesn't go away?`, a: `It may not, right away. Hector felt guilty for about a week. The hour-after routine helps you check whether you owe something or only feel uncomfortable. Guilt that comes back doesn't prove you did something wrong.` },
    { q: `What if they keep pushing?`, a: `Give the same answer, without explaining it again. If someone keeps refusing your no on something important, Chapter 28 helps you decide what you'll do if the answer stays no. If refusing brings threats or fear, go to Chapter 11 first.` },
    { q: `What if I really did break a promise?`, a: `Then the guilt is pointing at something real. The book says apologize, make it right where you can, and keep the next promise. The routine's first step helps you tell which kind of guilt you have.` },
    { q: `Will this make me cold or selfish?`, a: `No. Chapter 3 puts it this way: there's a wide middle ground between doormat and bully, full of people who are kind and also clear. Hector still gave his notes and ran the bake sale table. He just stopped giving up his Thursdays.` },
  ],
  closeLine: `Send the text today. Make the next yes one you chose.`,
  ps: `Hector didn't argue about what he owed. He said one sentence, offered what he could, and sent his notes on Thursday, before his first woodworking class. The book's five steps for taking back a yes, and his whole call, are in {ref}.`,
  psRef: { ch: 7, section: 'Taking back a yes you gave too fast' },
  limits: [
    `This isn't therapy or medical advice. It's practical words and steps for everyday requests.`,
    `If money has been spent, a contract signed or legal duties are involved, get proper advice before you take back a yes.`,
    `It can't control how anyone reacts to your no. It gives you the words, a plan for the guilt, and what to do if the pressure keeps coming.`,
    DANGER_LIMIT,
  ],
};

export default problem;
