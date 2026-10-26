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
  startHere: `Start with Chapter 26 for your mother's calls.`,
  metaTitle: '4 Calm Replies to a Critical Mother, and a Plan for the Guilt After the Call | Shadow Persuasion',
  metaDescription:
    'Short replies for criticism "dressed as concern", comparisons, "after everything I\'ve done for you" and ending a call kindly, plus a 4-step plan for the hour after. Free, from Chapter 26 of Shadow Persuasion: The Hidden Rules of Power.',
  topBar: 'FREE: 4 calm replies for your mother\'s next call',
  h1: ['Narcissistic mother?', 'Criticism on every call?'],
  h1Gold: '4 calm replies for her next call, plus what to do when the guilt hits after.',
  lead: `The comment about your hair. "Your sister looks so nice." "After everything I've done for you." Here are 4 short replies you can say word for word on the next call, and what to do in the hour after you hang up.`,
  topLink: '4 free replies',
  cta: 'Read the 4 free replies',
  ctaNote: 'Free. No sign-up. Use them on the next call.',
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
      { kind: 'p', text: `Then change the subject, and keep it changed. If the comment comes back, **say the same sentence again**, not a longer one. You've already answered, so you don't need to add another explanation.` },

      { kind: 'h', text: '2. When she compares you' },
      { kind: 'p', text: `"Your sister looks so nice." "Your brother calls me every day." A comparison invites you to compete. You don't have to enter the race.` },
      { kind: 'say', lines: [{ text: `I'm glad she's doing well.` }] },
      { kind: 'p', text: `Then nothing more. If favoritism is shaping real decisions, like money or caregiving, you can name it once, calmly. Otherwise, let it pass.` },

      { kind: 'h', text: `3. When she says "After everything I've done for you"` },
      { kind: 'p', text: `This line treats past help as a reason you must agree today. Acknowledge the help without agreeing to the request.` },
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
          { title: 'Wait before texting again.', text: `Before you send "Sorry if I was short, love you!", check what you're apologizing for. You can regret your tone and still keep your answer. If the text is only to ease your guilt, write it in your notes and look again tomorrow.` },
          { title: 'Settle your body.', text: `Walk around the block, drink some water, breathe out slowly, do something with your hands.` },
          { title: 'Check why you want to follow up.', text: `Confirming a visit, making a real apology or answering a real question are good reasons. Easing your own guilt is not.` },
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
          `**After:** If the text is only to ease your guilt, save it in your notes and read it tomorrow.`,
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
      { title: 'Defending keeps the topic going.', text: `A long answer turns the comment into a debate. And the same comment can come back next Sunday.` },
      { title: 'Past help becomes a bill.', text: `"After everything I've done" turns your yes into a payment. A no starts to feel ungrateful, not just unhelpful.` },
      { title: 'The make-up text can undo it.', text: `The guilt after the call pushes you to apologize. If the apology takes back your answer, and not just your tone, the cycle starts again.` },
    ],
  },
  bridge: {
    title: 'You have the 4 replies for the next call. Here is what the book adds.',
    blocks: [
      { kind: 'p', text: `You now have replies for criticism, comparisons and guilt trips, plus a line to end the call. They don't cover what she does next. She may keep pushing after you set a limit, and the book is plain about it: you don't need a new argument each time. Repeat your request in the same few words, and give it months, not one call.` },
      { kind: 'p', text: `Here is what usually comes next, and what the free part doesn't cover:` },
      {
        kind: 'list',
        items: [
          { text: `**When she pushes back without asking for anything.** A sigh, a heavy pause, "Don't worry, I'll do it myself, like always." There's no request to say no to, so the four replies don't fit.` },
          { text: `**When she says "You need to come over today."** How to tell a real emergency from a need that can wait, without ignoring either one.` },
          { text: `**When you're deciding how much contact you want.** Shorter calls, fewer visits, or stepping away, and what each one costs you.` },
        ],
      },
      { kind: 'p', text: `Start with Chapter 26. The digital edition comes tonight, so you can read it before her next call.` },
      { kind: 'p', text: `What the book can't do: make your mother change, or heal what happened years ago. It helps with today's call, this year's holiday, and how much contact you want.` },
    ],
  },
  pull: 'One call can put everyone back in their old seats. You can still answer as the adult in the chair.',
  limits: [
    `The book judges behavior instead of diagnosing anyone. Whether or not your parent would meet a doctor's definition of narcissism, these replies deal with what she says and what you say back.`,
    `Not therapy. It doesn't promise to heal childhood pain. That is work for time, and sometimes for a good therapist.`,
    `It can't make anyone change. It helps you handle the call, the visit and the holiday, and decide how much contact you want.`,
    DANGER_LIMIT,
  ],
  inside: {
    kicker: 'What the book adds for this problem',
    title: 'What she says next, and the page it’s on.',
    intro: 'Worked conversations and replies from the book for the calls after the first one.',
    items: [
      { ch: 26, section: 'The parent who still makes you feel small', text: `Gabriela's worked example: what she said on the next Sunday call, what she did three weeks later when her mother said "You never have time for me anymore," and what she did when the guilt hit two days later at a red light.` },
      { ch: 26, section: 'The parent who still makes you feel small', text: `Hank's worked example: his father calls during a meeting. How Hank checked for an emergency, answered the comparison with his mother, and arranged evening calls that reduced requests to come immediately.` },
      { ch: 26, section: 'The parent who still makes you feel small', text: `Scott's worked example: he asks his father to drop the "pushing paper" joke. How his father answered, and what happened at Thanksgiving.` },
      { ch: 7, section: 'When someone’s distress is treated as your job', text: `The martyr and visible suffering: the one thing to say in the moment, what to say later when nothing is happening, and why you shouldn't rush in to fix it.` },
      { ch: 7, section: 'When affection or character is made conditional', text: `"If you loved me" and "I thought you were someone I could count on": what to say when a request turns into a test of your love or your character, and what not to do.` },
      { ch: 6, section: 'What about narcissists?', text: `Is she a narcissist? The 5 behaviors to watch for, how pressure can look like hurt feelings, and 3 questions more useful than a label.` },
      { ch: 3, section: 'Roles you inherited', text: `Why a grown adult turns twelve on a Sunday call: the family roles nobody remembers agreeing to, like the reliable one and the peacemaker.` },
      { ch: 28, section: 'Four paths, and what each one costs', text: `Low contact or no contact? What each path costs, why neither makes you a better or worse person, and the safety check to do first.` },
    ],
  },
  excerpts: [
    {
      ch: 26,
      chapterTitle: 'Family, Friends, and the Roles That Stick',
      section: 'Family, Friends, and the Roles That Stick',
      blocks: [
        { kind: 'p', text: `Gabriela is forty-four. She manages a team of twelve at the county permit office. People bring her their hardest problems, and she solves them.` },
        { kind: 'p', text: `Every Sunday at four, she calls her mother.` },
        { kind: 'p', text: `"How are you, mija?"` },
        { kind: 'p', text: `"Good, Mom. Busy week."` },
        { kind: 'p', text: `"You sound tired. Are you sleeping? You know, I saw a picture of you on Facebook. I'm only saying this because I care. Have you thought about doing something with your hair? Your sister looks so nice since she cut hers."` },
        { kind: 'p', text: `"My hair is fine, Mom."` },
        { kind: 'p', text: `"I'm just saying. You always get so defensive."` },
        { kind: 'p', text: `Within five minutes, the manager of twelve is gone. In her place is a girl of about twelve, explaining herself, trying to get the conversation back to something safe. After the call, she stands at the kitchen counter for a long time without moving.` },
        { kind: 'p', text: `Nothing terrible was said. That's part of what makes it hard. If she complained to a friend, it would sound like nothing: a comment about her hair.` },
        { kind: 'p', text: `But it's every Sunday. And it's been every Sunday for thirty years.` },
      ],
    },
    {
      ch: 26,
      chapterTitle: 'Family, Friends, and the Roles That Stick',
      section: 'The parent who still makes you feel small',
      sub: 'When a parent says you have to come today',
      blocks: [
        { kind: 'p', text: `Hank's father, Calvin, is eighty-one and lives forty minutes away. On a weekday morning, Hank's phone rings in the middle of a meeting.` },
        { kind: 'talk', lines: [{ who: 'Calvin', text: `"You need to come over today. I don't feel right."` }] },
        { kind: 'p', text: `"Come today" can mean two things. One is an immediate need: a fall, chest pain, trouble breathing, sudden confusion. That needs help now, and the fastest help is usually 911, not you in traffic for forty minutes. The other is a need for you to be there in person, for something real that can wait or be handled another way. Find out which it is first. If you can't tell, or your parent can't answer clearly, treat it as an emergency.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Hank', text: `"I'm listening, Dad. Are you hurt? Any chest pain or trouble breathing? Did you fall?"` },
            { who: 'Calvin', text: `"No, nothing like that. The pharmacy says my refill isn't ready, and the TV's doing that thing again. I just don't like being alone all day."` },
          ],
        },
      ],
    },
    {
      ch: 26,
      chapterTitle: 'Family, Friends, and the Roles That Stick',
      section: 'The parent who still makes you feel small',
      sub: 'When your father makes your work the joke',
      blocks: [
        { kind: 'p', text: `Scott works in insurance. His father, Warren, was a contractor. Every visit, Warren asks whether Scott is "still pushing paper," then praises Scott's brother, Danny, who runs a construction crew. "Now that's real work."` },
        { kind: 'p', text: `On the next call, Scott tried something different.` },
        {
          kind: 'talk',
          lines: [
            { who: 'Warren', text: `"So, still sitting at a desk all day?"` },
            { who: 'Scott', text: `"Still at the desk, Dad. Can I ask you something? When you call my job 'pushing paper,' it bothers me. Can you drop that one?"` },
          ],
        },
      ],
    },
    {
      ch: 6,
      chapterTitle: 'A Bad Moment or a Pattern?',
      section: 'What about narcissists?',
      blocks: [
        { kind: 'p', text: `You may have picked up this book because of that word. It seems to name something real: a person who never seems to be wrong, who needs to be admired, who turns every complaint back on you.` },
        { kind: 'p', text: `Here is the plain answer. Narcissistic personality disorder is a diagnosis. It is made by trained professionals after a careful assessment, not from a list online. Most of us also use the word loosely, to mean selfish, vain, or impossible to argue with. You can't diagnose your husband, your mother or your boss from a checklist, and neither can I.` },
      ],
    },
  ],
  offerTitle: 'Get the book for what she says next.',
  faq: [
    { q: `What if she cries, or goes quiet on the phone?`, a: `The book covers this in Chapter 7, under visible suffering. Name it once, kindly: "You seem upset. If you want to talk about it, I'm here." If she says "nothing," believe her and carry on. Don't keep asking, guess at the reason, or start offering things to make it better. Her tears may be real. You can care about them and still keep your answer.` },
    { q: `Do I have to go no contact?`, a: `No. Chapter 26 lays out the choices: stay close and handle each call as it comes, reduce contact (shorter calls, fewer visits, some topics off the table), or step away. Each has real costs. You don't have to announce your choice, and you can change it later. Chapter 28 goes deeper into low contact and no contact.` },
    { q: `Do I need to know if she's really a narcissist?`, a: `No. Narcissistic personality disorder is a diagnosis that only a trained professional can make. The book shows you how to judge the pattern instead: repeated denial, blame that always lands on you, control, no repair, and punishment when you say no. You can act on any of those without a label.` },
    { q: `Is this only for daughters?`, a: `No. The parent chapter's worked examples include Gabriela and her mother, but also Hank, whose 81-year-old father calls saying "You need to come over today," and Scott, whose father calls his job "pushing paper." The replies work for sons and daughters, and for mothers and fathers.` },
    { q: `What if she calls my sister or brother to complain about me?`, a: `That's common. The book says many limits meet pushback: a sulk, a guilt trip, a call to a sibling. You don't need a new argument for each one. Repeat your request in the same few words, and give it months, not one call. Chapter 8 covers what to do when the story spreads to other relatives.` },
    { q: `What if the replies don't change anything?`, a: `They may not change her. The book never promises that. They change what you say, how long the call lasts, and whether you spend the evening apologizing. If nothing changes after months, Chapter 28 walks through four paths (accept it, escalate, step back or leave) and what each one costs.` },
    { q: `Won't this make me cold?`, a: `The replies start with her care: "I know you care." "I'm grateful." "I love you." Then they decline the topic or the request. That's the point. You can stay warm and still not explain your hair again.` },
  ],
  closeLine: `She may never change. Your answer on Sunday can.`,
  ps: `In the book's worked example, Gabriela changes how she answers her mother on the Sunday call. Three weeks later, the guilt comes back at a red light. What she says on the call, and what she does with the guilt, are in {ref}.`,
  psRef: { ch: 26, section: 'The parent who still makes you feel small' },
};

export default problem;
