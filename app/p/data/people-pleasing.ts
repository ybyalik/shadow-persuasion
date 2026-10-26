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
  startHere: `Start with Chapter 7 for the automatic yes.`,
  metaTitle: `Said Yes to Something You Didn't Want to Do? Copy This Text to Take It Back | Shadow Persuasion`,
  metaDescription: `One word-for-word text to take back a yes you gave too fast, the line that buys you time before the next one, and a 4-step plan for the guilty hour after. Free, from Chapter 7 of Shadow Persuasion: The Hidden Rules of Power.`,
  topBar: `FREE: The text that takes back a yes you didn't mean`,
  h1: [`Said yes again`, `to something you`, `didn't want to do?`],
  h1Gold: `Copy this text to take it back today.`,
  lead: `It came out before they finished asking. Now it's on your calendar, and you're dreading it. Here's the exact text to send today, then the line that buys you time before the next one.`,
  topLink: `Take-back text`,
  cta: `Read the free take-back text`,
  ctaNote: `Free. No sign-up. Send it today.`,
  tool: {
    kicker: `The free text`,
    title: `Copy it. Fill in the blanks. Send it today.`,
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
          { title: `Offer what you genuinely can, if anything.`, text: `Hand over your notes, do a smaller part, or suggest someone else. Only offer what you'll actually do.` },
          { title: `Don't reopen it.`, text: `Once you've sent it, you don't need to send it again with more reasons.` },
        ],
      },
      { kind: 'p', text: `**When a text isn't enough.** If someone has already relied on your yes (they booked flights because you said you'd host), the book says that deserves more than a text. Call, say so, and help fix what you can. If money has been spent, a contract signed or legal duties are involved, get proper advice first.` },

      { kind: 'h', text: `2. If they say "But you gave me your word"` },
      { kind: 'p', text: `That's the first thing Gail said to Hector. He didn't argue, and he didn't list everything he'd done for her. He owned it:` },
      { kind: 'say', lines: [{ label: `Hector`, text: `I did, and I'm sorry to go back on it. That's why I'm calling now and not in September.` }] },
      { kind: 'p', text: `If they ask again, give the same answer again. **No new reasons.** Five reasons give them five things to argue with.` },

      { kind: 'h', text: `3. Next time: buy time before you answer` },
      { kind: 'p', text: `The take-back text handles this yes. This line is for the next one. You can still say yes. **Give yourself time to decide first.**` },
      { kind: 'say', lines: [{ text: `Let me check and get back to you.` }] },
      { kind: 'p', text: `"Let me check" is one of the most ordinary sentences in adult life. You can still say yes later. If they push for an answer on the spot, the book's firmer version:` },
      { kind: 'say', lines: [{ text: `I'm not going to decide this right now. I'll call you tomorrow.` }] },

      { kind: 'h', text: `4. The hour after you send it` },
      { kind: 'p', text: `Sending the text is one part. The hour afterward can be harder. You may feel cruel, anxious, or about twelve years old. This short routine is adapted from Chapter 26. It won't make the guilt vanish. It helps you check whether you **owe something** or just **feel uncomfortable**.` },
      {
        kind: 'steps',
        items: [
          { title: `Check for real harm.`, text: `Did you break a promise someone was counting on, or say something unkind? If so, plan a short apology for tomorrow. If you only took back a yes early and kindly, feeling bad doesn't mean you owe them anything.` },
          { title: `Wait before texting again.`, text: `A quick "Sorry, forget it, I'll do it!" takes your no back. If you need to write it, write it in your notes and look again tomorrow.` },
          { title: `Settle your body.`, text: `Walk around the block, drink some water, breathe out slowly, do something with your hands.` },
          { title: `Check why you want to contact them.`, text: `Sending notes you promised or answering a real question are good reasons. Easing your own guilt is not.` },
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
    title: `You have the text. Here's what comes after it.`,
    blocks: [
      { kind: 'p', text: `You now have the take-back text, the answer to "But you gave me your word," the line that buys you time, and a plan for the hour after. That covers the first exchange.` },
      { kind: 'p', text: `Hector's call kept going. Gail tried "But who else is going to do it?" Then the big one: "After everything this parish did for you." That's where most people fold, or apologize their way back into the job.` },
      { kind: 'p', text: `Three things often come next, and the free part doesn't give you words for them. **A guilt line that turns your no into a verdict on who you are.** **Other people pulled in on their side.** **Someone who simply won't accept the answer.** The book has calm words for each, and a quick test for whether you owe this at all.` },
      { kind: 'p', text: `To be honest, the book can't stop you from feeling guilty. In its worked example, Hector felt guilty for about a week. Start with Chapter 7 tonight. The digital edition comes with your order.` },
    ],
  },
  pull: `You can be grateful without accepting a bill you never agreed to.`,
  inside: {
    kicker: `What the book adds`,
    title: `The words for the guilt trips that come after the text.`,
    intro: `The free text handles one yes. These pages handle the pushback, the next request, and the person who won't take no.`,
    items: [
      { ch: 7, section: 'Taking back a yes you gave too fast', text: `Hector's answer to "After everything this parish did for you," what he did when Gail hung up without saying goodbye, and what to do when other people get recruited: "Everyone's surprised you'd do this."` },
      { ch: 7, section: 'When affection or character is made conditional', text: `The one-line answer to "I thought you were someone I could count on," and the one to "If you loved me, you'd do this."` },
      { ch: 7, section: 'When past help is treated as a debt', text: `What to say when they bring up everything they've done for you, without starting a list of what you've done for them.` },
      { ch: 7, section: 'Duties, favors, and agreements', text: `The quick test that tells you whether you owe this or only feel like you do. (Hosting Thanksgiving for twelve years is still a favor.)` },
      { ch: 3, section: 'Gloria goes back', text: `Gloria runs the front office at a small accounting firm. She said "Of course" to two extra jobs before her boss finished asking. The next morning she went back: which job she kept, which she handed back, and what happened after she let the silence sit.` },
      { ch: 3, section: 'What other people learn from you', text: `The six habits that teach people to ask you first, from the instant yes to the "Are we okay?" text after every small disagreement.` },
      { ch: 3, section: 'The five clauses', text: `Five beliefs about being a good person that make you say yes, and a fairer belief to replace each one.` },
      { ch: 5, section: 'Notice, Pause, Hold', text: `What to do at two o'clock, after you said "Let me check my week," when your coworker asks for the third Monday running and sighs at your no.` },
      { ch: 28, section: 'Build your No-Agreement Plan', text: `When someone keeps refusing to accept your no on something important: decide what you'll do if the answer stays no, before you need it.` },
      { ch: 31, section: 'Day 1: The pause', text: `A three-day start, low stakes first: the pause on day one, no reflex "sorry" on day two, one clean no on day three. It opens the book's 21-day practice.` },
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
      ch: 5,
      chapterTitle: 'Stay Steady Without Going Cold',
      section: 'Caring without carrying',
      blocks: [
        { kind: 'p', text: `The next morning, Teresa calls Lorraine back. She doesn't take everything back, and she doesn't pretend the call didn't happen.` },
        { kind: 'p', text: `"I offered a lot yesterday, very fast," she says. "I'd still like to help. What would actually make the biggest difference this week?"` },
        { kind: 'p', text: `Lorraine thinks. "Someone to go with me to look at the two apartments. I hate doing that alone."` },
        { kind: 'p', text: `"I can do Saturday morning, until noon," Teresa says. "And I'm going to hold off on the loan. I'd rather help in other ways."` },
        { kind: 'p', text: `There's a short silence. "Oh. Okay," Lorraine says. She sounds a little hurt. Teresa wants to fill the silence with an offer. She doesn't.` },
        { kind: 'p', text: `"I'll pick you up at nine," she says.` },
        { kind: 'p', text: `Teresa is still helping. She has chosen what she gives, instead of handing over whatever the moment seemed to demand.` },
      ],
    },
  ],
  offerTitle: `Get the book for this yes, and the next one.`,
  faq: [
    { q: `Isn't it rude to take back a yes?`, a: `The book's answer: you're allowed to. The earlier you speak up, the less it usually costs everyone. Waiting until the night before leaves them with few options. One sentence owning it, a clear new answer, and an offer only if you'll really do it. That's polite.` },
    { q: `Should I text it or call?`, a: `A text is fine for most everyday yeses. If someone has already relied on your yes (they booked flights because you said you'd host), the book says that deserves more than a text. Call, say so, and help fix what you can.` },
    { q: `What if they say, "But you gave me your word"?`, a: `Use Hector's reply: "I did, and I'm sorry to go back on it. That's why I'm calling now and not in September." Own it. Don't argue. His answer to the harder line that came next, "After everything this parish did for you," is in Chapter 7.` },
    { q: `Do I have to give a reason?`, a: `No. A short reason that helps them plan is fine. What you're dropping is the pile of reasons offered to earn permission. Each extra one is something to argue with.` },
    { q: `What if the guilt doesn't go away?`, a: `It may not, right away. In the book's example, Hector felt guilty for about a week. The hour-after routine helps you check whether you owe something or only feel uncomfortable. Guilt that comes back doesn't prove you did something wrong.` },
    { q: `What if they keep pushing?`, a: `Give the same answer, without explaining it again. If someone keeps refusing your no on something important, Chapter 28 helps you decide what you'll do if the answer stays no. If refusing brings threats or fear, go to Chapter 11 first.` },
    { q: `What if I really did break a promise?`, a: `Then the guilt is pointing at something real. The book says apologize, make it right where you can, and keep the next promise. The routine's first step helps you tell which kind of guilt you have.` },
    { q: `Will this make me cold or selfish?`, a: `No. Chapter 3 puts it this way: there's a wide middle ground between doormat and bully, full of people who are kind and also clear. In the book's example, Hector still sent his notes and offered to run the bake sale table. He just stopped giving up his Thursdays.` },
  ],
  closeLine: `Send the text today. Make the next yes one you chose.`,
  ps: `In the book's worked example, Hector didn't argue about what he owed. He said one sentence, offered what he could, and sent his notes on Thursday, before his first woodworking class. The book's five steps for taking back a yes, and his whole call, are in {ref}.`,
  psRef: { ch: 7, section: 'Taking back a yes you gave too fast' },
  limits: [
    `This isn't therapy or medical advice. It's practical words and steps for everyday requests.`,
    `If money has been spent, a contract signed or legal duties are involved, get proper advice before you take back a yes.`,
    `It can't control how anyone reacts to your no. It gives you the words, a plan for the guilt, and what to do if the pressure keeps coming.`,
    DANGER_LIMIT,
  ],
};

export default problem;
