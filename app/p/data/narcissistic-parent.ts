import type { Problem } from '../problems';

/**
 * Problem page: a critical, guilt-tripping parent ("narcissistic mother").
 * Tool built from Ch 26 "The parent who still makes you feel small" (Criticism dressed as concern,
 * Comparisons and the approval hunt, Calls and visits, The hour after the call) and Ch 7 (The ledger, "If you loved me").
 */
const DANGER_LIMIT =
  'If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.';

const problem: Problem = {
  slug: 'narcissistic-parent',
  metaTitle: '4 Calm Replies to a Critical Mother, and a Plan for the Guilt After the Call | Shadow Persuasion',
  metaDescription:
    'Short replies for criticism "dressed as concern", comparisons, "after everything I\'ve done for you" and ending a call kindly, plus a 4-step plan for the hour after. Free, from Chapter 26 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: 4 calm replies for your mother\'s next call, plus a plan for the guilt after',
  h1: ['Narcissistic mother?', 'Criticism on every call?'],
  h1Gold: '4 calm replies for the next call, and a plan for the guilt after it.',
  lead: `The comment about your hair. "Your sister looks so nice." "After everything I've done for you." Here are 4 short replies you can say word for word on the next call, and what to do in the hour after you hang up.`,
  bullets: [
    `Reply 1: the one line for criticism "dressed as concern" (your hair, your job, your kids)`,
    `Reply 2: what to say when she compares you to your sister or brother`,
    `Reply 3: the answer to "After everything I've done for you" that keeps your no`,
    `Reply 4: how to end the call kindly, on time, when it turns`,
    `The plan: 4 checks for the hour after, before you send a "sorry if I was short" text`,
  ],
  cta: 'YES! Show Me the 4 Replies',
  ctaNote: 'Free. No sign-up. Use them on the next call.',
  teaser: {
    label: 'Sunday, 4 p.m. · The call',
    lines: [
      `"Have you thought any more about your hair?"`,
      `"I know you care, Mom. ==I'm happy with my hair.== How was the church sale?"`,
      `"I'm only trying to help."`,
      `"I know. How was the sale?"`,
    ],
    note: 'Same sentence, twice. No defending.',
  },
  tool: {
    kicker: 'The free replies',
    title: '4 calm replies, and a plan for the hour after.',
    intro: 'These replies come from Chapters 7 and 26. Brackets show wording adapted for your situation. Then use the four checks when the guilt hits.',
    blocks: [
      { kind: 'h', text: '1. When the criticism comes "because I care"' },
      { kind: 'p', text: `"I'm only saying this because I care." The concern may even be real. But the effect is the same each time: you hang up feeling worse. You don't have to argue about whether it was criticism. **Acknowledge the care, and decline the topic.**` },
      {
        kind: 'say',
        lines: [
          { text: `I know you care. I'm happy with my hair.` },
          { text: `I'm not going to talk about [the topic]. Tell me about your week.` },
          { text: `I've heard you. I've made my decision.` },
        ],
      },
      { kind: 'p', text: `Then change the subject, and keep it changed. If the comment comes back, **say the same sentence again**, not a longer one. A long defense tells her this topic gets a reaction.` },

      { kind: 'h', text: '2. When she compares you' },
      { kind: 'p', text: `"Your sister looks so nice." "Your brother calls me every day." A comparison invites you to compete. You don't have to enter the race.` },
      { kind: 'say', lines: [{ text: `I'm glad she's doing well.` }] },
      { kind: 'p', text: `Then nothing more. If favoritism is shaping real decisions, like money or caregiving, you can name it once, calmly. Otherwise, let it pass.` },

      { kind: 'h', text: `3. When she says "After everything I've done for you"` },
      { kind: 'p', text: `This line turns the relationship into an account. The past kindness becomes a debt, and today's request becomes the payment. So honor the past, then separate it from today.` },
      {
        kind: 'say',
        lines: [
          { text: `You've done a lot for me, and I'm grateful. I still can't do this.` },
          { text: `I remember, and it meant a lot. This one doesn't work for me.` },
        ],
      },
      { kind: 'p', text: `Don't start listing what you've done for her. That agrees you're both keeping score. If it comes as "If you loved me, you'd do this," keep the feeling and the request apart:` },
      { kind: 'say', lines: [{ text: `I love you. I'm not going to do this.` }] },

      { kind: 'h', text: '4. When the call turns: end it kindly' },
      { kind: 'p', text: `You're allowed to decide how long a call lasts. Set the length at the start, and end it when it's time.` },
      {
        kind: 'say',
        lines: [
          { label: 'At the start', text: `I've got about twenty minutes before I need to start dinner.` },
          { label: 'At the end', text: `I need to go now. Love you. Talk Sunday.` },
        ],
      },
      { kind: 'p', text: `Holidays work the same way, but plan before you arrive: how long you'll stay, where you'll sleep, and how you'll leave. Driving your own car helps. Say it early, in a matter-of-fact way: "We'll come for dinner on Christmas Day and head home around eight."` },

      { kind: 'h', text: 'The hour after the call' },
      { kind: 'p', text: `Holding a limit on the phone is one part. The hour afterward can be harder. You may feel cruel, anxious, or about twelve years old. Run these four checks.` },
      {
        kind: 'steps',
        items: [
          { title: 'Check for real harm.', text: `Did you break a promise, or say something unkind? If so, plan a short apology for tomorrow. If you only declined a topic or ended on time, the bad feeling is discomfort, not a debt.` },
          { title: 'Hold the make-up message.', text: `A quick "Sorry if I was short, love you!" usually takes the limit back. If you need to write it, write it in your notes and look again tomorrow.` },
          { title: 'Settle your body.', text: `Walk around the block, drink some water, breathe out slowly, do something with your hands.` },
          { title: 'Ask if a follow-up has a job.', text: `Confirming a visit, making a real apology or answering a real question are jobs. Easing your own guilt is not.` },
        ],
      },
      {
        kind: 'card',
        title: 'Copy this to your phone before the next call',
        lines: [
          `**Criticism:** "I know you care. I'm happy with my [hair / job / choice]."`,
          `**Comparison:** "I'm glad she's doing well." Then nothing more.`,
          `**"After everything":** "You've done a lot for me, and I'm grateful. I still can't do this."`,
          `**Time to go:** "I need to go now. Love you. Talk Sunday."`,
          `**After:** No make-up text tonight. Read it again tomorrow.`,
        ],
      },
      { kind: 'note', text: `Expect the guilt to come back, even days later. Guilt that returns doesn't prove you did something wrong.` },
    ],
  },
  why: {
    kicker: 'Why every call ends the same way',
    title: 'One call puts everyone back in their old seats.',
    intro: `Nothing terrible gets said. That's part of what makes it hard. Told to a friend, it sounds like nothing: a comment about your hair. Here's what is working underneath.`,
    items: [
      { title: 'An old role, still in force.', text: `Families hand out roles early: the reliable one, the peacemaker, the fixer. Nobody remembers agreeing to one. A single phone call can put you back in yours.` },
      { title: 'Concern is hard to argue with.', text: `"I'm only saying this because I care." Push back and you're attacking her care. So you explain yourself instead, and now the call is about your hair.` },
      { title: 'Defending feeds the topic.', text: `Every long answer shows which subjects get a reaction. So the same comments come back next Sunday.` },
      { title: 'Past help becomes a bill.', text: `"After everything I've done" turns your yes into a payment. A no starts to feel ungrateful, not just unhelpful.` },
      { title: 'The make-up text undoes it.', text: `The guilt after the call pushes you to apologize. A quick "sorry if I was short" usually takes the limit back, and the cycle starts again.` },
    ],
  },
  bridge: {
    title: 'The replies are your first move. Her next one is the hard part.',
    blocks: [
      { kind: 'p', text: `Not every limit lands. Many meet pushback: a sulk, a guilt trip, a call to your sibling. The book's advice is plain. You don't need a new argument for each one. Repeat your request in the same few words, and give it months, not one call.` },
      { kind: 'p', text: `The free replies don't cover what comes next. The book does:` },
      {
        kind: 'list',
        items: [
          { text: `Gabriela's next calls, including "You never have time for me anymore," and what she did when the guilt hit two days later at a red light.`, ref: { ch: 26, section: 'The parent who still makes you feel small' } },
          { text: `The sigh, the heavy pause, "Don't worry, I'll do it myself, like always." What to say to each, and what not to do.`, ref: { ch: 7, section: 'When someone’s distress is treated as your job' } },
          { text: `"If you loved me" and "I thought you were someone I could count on." The love test and the character test, with replies.`, ref: { ch: 7, section: 'When affection or character is made conditional' } },
          { text: `Why you turn twelve on the phone: the roles families hand out, and how to choose a different rule.`, ref: { ch: 3, section: 'Roles you inherited' } },
          { text: `How to judge the pattern without diagnosing anyone: the five behaviors to watch for, and the three questions to ask.`, ref: { ch: 6, section: 'What about narcissists?' } },
          { text: `How much contact you want: accept, step back (low contact) or leave (no contact), and what each one costs.`, ref: { ch: 28, section: 'Four paths, and what each one costs' } },
        ],
      },
      { kind: 'p', text: `What the book can't do: make your mother change, or heal what happened years ago. It helps with today's call, this year's holiday, and how much contact you want.` },
    ],
  },
  pull: 'One call can put everyone back in their old seats. You can still answer as the adult in the chair.',
  finalCta: 'See the full method for dealing with a narcissistic parent →',
  limits: [
    `The book judges behavior instead of diagnosing anyone. Whether or not your parent would meet a doctor's definition of narcissism, these replies deal with what she says and what you say back.`,
    `Not therapy. It doesn't promise to heal childhood pain. That is work for time, and sometimes for a good therapist.`,
    `It can't make anyone change. It helps you handle the call, the visit and the holiday, and decide how much contact you want.`,
    DANGER_LIMIT,
  ],
  inside: {
    kicker: 'What the book adds for this problem',
    title: 'Every call with her, covered. Page by page.',
    intro: 'The free replies handle the four lines you hear most. The book covers what she says next, the guilt that comes back days later, and how much contact you want.',
    items: [
      { ch: 26, section: 'The parent who still makes you feel small', text: `Gabriela's real Sunday call, line by line: the hair comment, "I'm only trying to help," and why her second answer was the same sentence, not a longer one.` },
      { ch: 26, section: 'The parent who still makes you feel small', text: `What to do when she says "You never have time for me anymore," and what Gabriela did when the guilt hit two days later at a red light.` },
      { ch: 26, section: 'The parent who still makes you feel small', text: `"You need to come over today." The 3 questions to ask first, and the line that keeps your day without ignoring a real emergency.` },
      { ch: 7, section: 'When someone’s distress is treated as your job', text: `The sigh, the heavy pause, "Don't worry, I'll do it myself, like always." What to say to each, and why you shouldn't rush in to fix it.` },
      { ch: 7, section: 'When affection or character is made conditional', text: `"If you loved me, you'd do this." The line that keeps the love and the no apart, and what to say if she uses it every week.` },
      { ch: 6, section: 'What about narcissists?', text: `Is she a narcissist? The 5 behaviors to watch for, the quiet "wounded" version, and the 3 questions that matter more than the label.` },
      { ch: 3, section: 'Roles you inherited', text: `Why a grown adult turns twelve on a Sunday call: the family roles nobody remembers agreeing to, like the reliable one and the peacemaker.` },
      { ch: 28, section: 'Four paths, and what each one costs', text: `Low contact or no contact? What each one costs, why neither makes you a better or worse person, and the safety check to do first.` },
    ],
  },
  excerpts: [
    {
      ch: 26,
      chapterTitle: 'Family, Friends, and the Roles That Stick',
      section: 'The parent who still makes you feel small',
      sub: 'Criticism dressed as concern',
      blocks: [
        { kind: 'p', text: `"I'm only saying this because I care." The concern may even be real. But the effect is the same each time: you hang up feeling worse.` },
        { kind: 'p', text: `You don't have to argue about whether it was criticism. You can acknowledge the care and decline the topic.` },
        { kind: 'say', lines: [`"I know you care. I'm happy with my hair."`, `"I'm not going to talk about my weight. Tell me about your week."`, `"I've heard you. I've made my decision."`] },
        { kind: 'p', text: `Then change the subject, and keep it changed. If the comment comes back, say the same sentence again. A long defense tells the other person this topic gets a reaction.` },
        { kind: 'p', text: `The next Sunday, Gabriela tried it.` },
        {
          kind: 'talk',
          lines: [
            { who: '', text: `"Have you thought any more about your hair?"` },
            { who: '', text: `"I know you care, Mom. I'm happy with my hair. How was the church sale?"` },
            { who: '', text: `"I'm only trying to help."` },
            { who: '', text: `"I know. How was the sale?"` },
          ],
        },
        { kind: 'p', text: `There was a pause. Then her mother told her about the sale. The call was ten minutes shorter than usual, and Gabriela didn't stand at the counter afterward.` },
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
        { kind: 'p', text: `Expect the guilt to come back. Three weeks after the good Sunday, Gabriela's mother said, "You never have time for me anymore," and Gabriela still ended the call when she'd planned to. The guilt hit two days later, at a red light. She ran the first check again: no promise broken, nothing unkind said. It still hurt. She didn't call. By the next Sunday it had faded, and that call was ordinary. Guilt that returns doesn't prove you did something wrong.` },
      ],
    },
    {
      ch: 6,
      chapterTitle: 'A Bad Moment or a Pattern?',
      section: 'What about narcissists?',
      blocks: [
        { kind: 'p', text: `You may have picked up this book because of that word. It seems to name something real: a person who never seems to be wrong, who needs to be admired, who turns every complaint back on you.` },
        { kind: 'p', text: `Here is the plain answer. Narcissistic personality disorder is a diagnosis. It is made by trained professionals after a careful assessment, not from a list online. Most of us also use the word loosely, to mean selfish, vain, or impossible to argue with. You can't diagnose your husband, your mother or your boss from a checklist, and neither can I.` },
        { kind: 'p', text: `The pattern can also be quiet. Some people never shout. They seem wounded instead. "I guess I can't do anything right." "Don't worry about me." They go pale and silent when you disagree, so that you end up comforting them for your own no. People sometimes call this covert narcissism. You don't need the term, and feeling hurt, by itself, doesn't mean someone is controlling you. Ask the same three questions: does it repeat, is there ever repair, and what happens when you say no?` },
      ],
    },
  ],
  forYou: [
    `You call your mother every week and hang up feeling small, then replay the call for an hour.`,
    `You've explained your hair, your weight, your job or your parenting to her more times than you can count.`,
    `You end calls with "sorry if I was short" when you didn't do anything wrong.`,
    `You want to keep some contact with her, on terms you can live with.`,
    `You've read a lot about narcissistic mothers and still don't know what to say on Sunday.`,
  ],
  notForYou: [
    `You want a diagnosis. The book judges what she does, not what she is.`,
    `You want a way to make her change or admit what she did. No book can do that.`,
    `You want therapy for what happened when you were a child. This isn't therapy.`,
    `You want comebacks that win the argument or hurt her back.`,
    `You're afraid of her, or she controls your money or where you go. Start with Chapter 11 and a trained advocate, not a script.`,
  ],
  offerTitle: 'Get the book that has an answer for every call with her.',
  faq: [
    { q: `What if she cries, or goes quiet on the phone?`, a: `The book covers this in Chapter 7, under visible suffering. Name it once, kindly: "You seem upset. If you want to talk about it, I'm here." If she says "nothing," believe her and carry on. Don't keep asking, guess at the reason, or start offering things to make it better. Her tears may be real. You can care about them and still keep your answer.` },
    { q: `Do I have to go no contact?`, a: `No. Chapter 26 lays out the choices: stay close and handle each call as it comes, reduce contact (shorter calls, fewer visits, some topics off the table), or step away. Each has real costs. You don't have to announce your choice, and you can change it later. Chapter 28 goes deeper into low contact and no contact.` },
    { q: `Do I need to know if she's really a narcissist?`, a: `No. Narcissistic personality disorder is a diagnosis that only a trained professional can make. The book shows you how to judge the pattern instead: repeated denial, blame that always lands on you, control, no repair, and punishment when you say no. You can act on any of those without a label.` },
    { q: `Is this only for daughters?`, a: `No. The parent chapter has Gabriela and her mother, but also Hank, whose 81-year-old father calls saying "You need to come over today," and Scott, whose father calls his job "pushing paper." The replies work for sons and daughters, and for mothers and fathers.` },
    { q: `What if she calls my sister or brother to complain about me?`, a: `That's common. The book says many limits meet pushback: a sulk, a guilt trip, a call to a sibling. You don't need a new argument for each one. Repeat your request in the same few words, and give it months, not one call. Chapter 8 covers what to do when the story spreads to other relatives.` },
    { q: `What if the replies don't change anything?`, a: `They may not change her. The book never promises that. They change what you say, how long the call lasts, and whether you spend the evening apologizing. If nothing changes after months, Chapter 28 helps you choose among accepting it, stepping back and leaving, and what each one costs.` },
    { q: `Won't this make me cold?`, a: `The replies start with her care: "I know you care." "I'm grateful." "I love you." Then they decline the topic or the request. That's the point. You can stay warm and still not explain your hair again.` },
  ],
  closeLine: `She may never change. Your answer on Sunday can.`,
  ps: `Gabriela changed how she answered, and the next call was ten minutes shorter. Three weeks later the guilt came back at a red light, and she knew what to do with it. Both are in {ref}.`,
  psRef: { ch: 26, section: 'The parent who still makes you feel small' },
};

export default problem;
