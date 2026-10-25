/**
 * The four first-test ad angles (research/angles/angle-map-v2.md), one landing page each at /a/[slug].
 *
 * Meta rules for every page: describe a scene or the other person's behavior, never tell the
 * reader what they are or what happened to them, and never promise custody wins, stopping
 * someone's behavior, a promotion, saving a marriage or healing trauma.
 *
 * Excerpts are copied word for word from book-v3/book-full-draft.md (draft 2, 25 October 2026).
 * If the book text changes, update them here. `ch` + `section` name the chapter and the exact
 * `##` heading; `sub` is the `###` heading inside it, when there is one.
 */

export type ExcerptBlock =
  | { kind: 'p'; text: string }
  /** A "Try saying" box: one or more lines the reader can use. */
  | { kind: 'say'; lines: string[] }
  /** Dialogue: who is speaking (or '' for an unlabeled line) and what they say. */
  | { kind: 'talk'; lines: { who: string; text: string }[] };

export type Excerpt = { ch: number; chapterTitle: string; section: string; sub?: string; blocks: ExcerptBlock[] };

export type RouteStep = { ch: number; section: string; title: string; why: string };

export type Angle = {
  slug: string;
  /** Page <title>. */
  metaTitle: string;
  /** Small line above the headline: the topic, never a label for the reader. */
  pre: string;
  title: [string, string];
  /** The page opening from the angle map: a scene. */
  lead: string;
  openingKicker: string;
  openingHead: string;
  opening: string[];
  routeIntro: string;
  route: RouteStep[];
  routeNote?: string;
  excerpts: Excerpt[];
  limits: string[];
  buyLine: string;
  /** P.S. text; `{ref}` is replaced with the page reference for psRef. */
  ps: string;
  psRef: { ch: number; section: string };
};

const DANGER_LIMIT =
  'If you are afraid of someone, start with Chapter 11, When Pressure Becomes Danger. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233, or text START to 88788.';

export const ANGLES: Angle[] = [
  /* ───────────── 1. The parent whose rules still run adult life ───────────── */
  {
    slug: 'parent',
    metaTitle: 'The Children Grew Up. The Family Rules Stayed the Same. | Shadow Persuasion: The Hidden Rules of Power',
    pre: 'Calls, visits and holidays with a difficult parent',
    title: ['The children grew up.', 'The family rules stayed the same.'],
    lead: 'The call starts with a question about Sunday lunch. Five minutes later, an ordinary scheduling decision has become a test of love.',
    openingKicker: 'A scene from Chapter 26',
    openingHead: 'It is never a big fight. It is a comment about a haircut.',
    opening: [
      'Gabriela is forty-four. She manages a team of twelve at the county permit office. People bring her their hardest problems, and she solves them.',
      'Every Sunday at four, she calls her mother. "You sound tired. Are you sleeping? You know, I saw a picture of you on Facebook. I\'m only saying this because I care. Have you thought about doing something with your hair? Your sister looks so nice since she cut hers."',
      'Within five minutes, the manager of twelve is gone. In her place is a girl of about twelve, explaining herself, trying to get the conversation back to something safe.',
      'Told to a friend, it sounds like nothing. But it happens every Sunday, and it has for thirty years. Families give each person a role early, and one phone call or one holiday dinner can put everyone back in their old seats.',
      'Shadow Persuasion doesn\'t promise to heal anyone\'s childhood. Its promise is smaller and more practical: help with today\'s calls, visits and holidays, and clear thinking about how much contact you want. And it never asks you to diagnose a parent. Chapter 6 shows how to judge a pattern without a label.',
    ],
    routeIntro: 'If this sounds like your Sunday call, you don\'t have to read the book in order. Start with these chapters.',
    route: [
      { ch: 26, section: 'The parent who still makes you feel small', title: 'The parent who still makes you feel small', why: 'Criticism dressed as concern, comparisons and favoritism, the phone call and the visit, a father-and-son example, and pushback after a limit.' },
      { ch: 3, section: 'Roles you inherited', title: 'Roles you inherited', why: 'The reliable one, the peacemaker, the fixer. Why nobody remembers agreeing to the role, least of all you.' },
      { ch: 6, section: 'What about narcissists?', title: 'What about narcissists?', why: 'Why you can judge what keeps happening, and decide what to do, without diagnosing anyone.' },
      { ch: 7, section: 'When past help is treated as a debt', title: 'When past help is treated as a debt', why: '"After everything I\'ve done for you," and how to honor the past and still say no.' },
      { ch: 9, section: 'Space, or pressure', title: 'Space, or pressure', why: 'When someone goes quiet or cold after you disagree, and how to respond without chasing.' },
      { ch: 28, section: 'Four paths, and what each one costs', title: 'Four paths, and what each one costs', why: 'If nothing changes: accept, escalate, step back or leave, and what each one costs. Includes less contact and no contact.' },
    ],
    routeNote: 'Before you try anything new on the Sunday call, do the three-day Quick Start in Chapter 31 with people who matter less. "Low stakes first" is rule one of the 21-day Reset.',
    excerpts: [
      {
        ch: 26,
        chapterTitle: 'Family, Friends, and the Roles That Stick',
        section: 'The parent who still makes you feel small',
        sub: 'Criticism dressed as concern',
        blocks: [
          { kind: 'p', text: '"I\'m only saying this because I care." The concern may even be real. But the effect is the same each time: you hang up feeling worse.' },
          { kind: 'p', text: 'You don\'t have to argue about whether it was criticism. You can acknowledge the care and decline the topic.' },
          { kind: 'say', lines: ['"I know you care. I\'m happy with my hair."', '"I\'m not going to talk about my weight. Tell me about your week."', '"I\'ve heard you. I\'ve made my decision."'] },
          { kind: 'p', text: 'Then change the subject, and keep it changed. If the comment comes back, say the same sentence again. A long defense tells the other person this topic gets a reaction.' },
          { kind: 'p', text: 'The next Sunday, Gabriela tried it.' },
          {
            kind: 'talk',
            lines: [
              { who: '', text: '"Have you thought any more about your hair?"' },
              { who: '', text: '"I know you care, Mom. I\'m happy with my hair. How was the church sale?"' },
              { who: '', text: '"I\'m only trying to help."' },
              { who: '', text: '"I know. How was the sale?"' },
            ],
          },
          { kind: 'p', text: 'There was a pause. Then her mother told her about the sale. The call was ten minutes shorter than usual, and Gabriela didn\'t stand at the counter afterward.' },
        ],
      },
      {
        ch: 26,
        chapterTitle: 'Family, Friends, and the Roles That Stick',
        section: 'The parent who still makes you feel small',
        sub: 'The phone call and the visit',
        blocks: [
          { kind: 'p', text: 'You\'re allowed to decide how long a call lasts, and to end it kindly.' },
          { kind: 'say', lines: ['"I\'ve got about twenty minutes before I need to start dinner."', '"I need to go now. Love you. Talk Sunday."'] },
          { kind: 'p', text: 'Holidays work the same way, but plan before you arrive. Decide how long you\'ll stay, where you\'ll sleep, and how you\'ll leave. Driving your own car is an underrated holiday tool. Tell people your plan early, in a matter-of-fact way: "We\'ll come for dinner on Christmas Day and head home around eight."' },
        ],
      },
      {
        ch: 26,
        chapterTitle: 'Family, Friends, and the Roles That Stick',
        section: 'The parent who still makes you feel small',
        sub: 'How much contact you want',
        blocks: [
          { kind: 'p', text: 'Some people stay close and handle each conversation as it comes. Some reduce contact: shorter calls, fewer visits, certain topics off the table. Some decide to step away entirely. Each of these is a real choice, with real costs, and only you can weigh them.' },
          { kind: 'p', text: 'It can help to ask: what does each kind of contact cost me, and what does it give me? Is it safe? What could I live with in five years? You don\'t have to announce your choice, and you can change it later. Chapter 28, When They Still Say No, goes deeper into low contact and no contact.' },
        ],
      },
    ],
    limits: [
      'It won\'t diagnose your parent, or you.',
      'It doesn\'t promise to heal childhood pain. That is work for time, and sometimes for a good therapist.',
      'It can\'t make anyone change. It helps you handle the call, the visit and the holiday, and decide how much contact you want.',
      DANGER_LIMIT,
    ],
    buyLine: 'Ready for a different Sunday call?',
    ps: 'Gabriela\'s mother didn\'t change. Gabriela\'s answer did, and the next call was ten minutes shorter. The words she used are in {ref}.',
    psRef: { ch: 26, section: 'The parent who still makes you feel small' },
  },

  /* ───────────── 2. The overlooked contributor at work ───────────── */
  {
    slug: 'work',
    metaTitle: 'One Person Does the Work. Another Becomes the Name Everyone Remembers. | Shadow Persuasion: The Hidden Rules of Power',
    pre: 'Credit, visibility and pay at work',
    title: ['One person does the work.', 'Another becomes the name everyone remembers.'],
    lead: 'The project is finished. In the meeting, someone else presents the result. The room starts directing its questions to them.',
    openingKicker: 'A scene from Chapter 23',
    openingHead: 'The numbers already exist. They have her name at the top.',
    opening: [
      'Keisha spent two weeks on the numbers. She found that her company was paying for three software tools that did the same job, and emailed a one-page summary to her manager, Glen.',
      'On Thursday, at the team meeting, a colleague clears his throat. "I\'ve been thinking we might have some overlap in our software." Glen nods. "Good thinking. Tyler, can you pull some numbers together?"',
      'The numbers already exist. They are sitting in Glen\'s inbox with Keisha\'s name at the top. She says nothing, and the meeting moves on to the parking situation.',
      'Good work matters. It is also only part of the picture. Credit, projects, titles and pay are decided by busy people, based on what reaches them. Keisha\'s work was excellent. It just never reached the place where the decision was made.',
      'Shadow Persuasion shows how to fix that without becoming loud or political: protect credit before, during and after a meeting, find out what a promotion really requires, build allies, and ask for a raise with a clear case. No book can promise you the promotion. This one helps you make sure the people who decide have accurate information.',
    ],
    routeIntro: 'If this sounds like your last meeting, you don\'t have to read the book in order. Start with these chapters.',
    route: [
      { ch: 23, section: 'When someone repeats your idea in a meeting', title: 'When someone repeats your idea in a meeting', why: 'Before the meeting, in the meeting, the note to send the same day, and what to do when the manager does nothing or changes the story.' },
      { ch: 2, section: 'A title tells you only part of the story', title: 'The Power Map', why: 'Who really decides, what they need, and what reaches them. The map behind every other step.' },
      { ch: 19, section: 'Good work and visible work are different', title: 'Good work and visible work are different', why: 'Short, regular updates and a simple record of your work, without bragging or faking confidence.' },
      { ch: 20, section: 'How to build allies', title: 'How to build allies', why: 'Talk to people before the meeting, not during it, and help with no bill attached.' },
      { ch: 23, section: 'When you were passed over: learn the real rules', title: 'When you were passed over', why: 'Turn "you need more presence" into facts you can work on.' },
      { ch: 23, section: 'Asking for a raise', title: 'Asking for a raise', why: 'Prepare a clear case, hold the conversation, and handle the answers you are most likely to hear.' },
      { ch: 28, section: 'Name the kind of no you are facing', title: 'When they still say no', why: 'A plain refusal, a broken promise, exclusion, retaliation, and what to do about each.' },
    ],
    excerpts: [
      {
        ch: 23,
        chapterTitle: 'Work, Pay, and Recognition',
        section: 'When someone repeats your idea in a meeting',
        sub: 'Before the meeting: put your name on it',
        blocks: [
          { kind: 'p', text: 'Send your work to the person who decides, with your name on it, before it comes up. Then ask to present it yourself.' },
          { kind: 'say', lines: ['"I\'ve attached the software cost summary I put together. I\'d like to walk the team through it on Thursday. Could I have ten minutes?"'] },
          { kind: 'p', text: 'Keisha didn\'t ask for time. Most people don\'t, because it feels pushy. It isn\'t. You are telling your manager what you have ready, which saves them work.' },
        ],
      },
      {
        ch: 23,
        chapterTitle: 'Work, Pay, and Recognition',
        section: 'When someone repeats your idea in a meeting',
        sub: 'Afterward: send a short note the same day',
        blocks: [
          { kind: 'p', text: 'Write to the person who decides. Keep it factual and friendly. Attach the original work.' },
          { kind: 'say', lines: ['"Hi Glen, following up on today\'s meeting. The software overlap Tyler mentioned is the one in my summary from Monday, attached again. It shows three tools doing the same job, at about $40,000 a year. I\'d be glad to lead the next step, and Tyler\'s welcome to join. Can we confirm who\'s taking it?"'] },
          { kind: 'p', text: 'The note doesn\'t accuse Tyler. It puts the facts and the dates in one place, and it asks for a decision.' },
        ],
      },
      {
        ch: 19,
        chapterTitle: 'Be Credible, Visible, and Clear',
        section: 'Good work and visible work are different',
        blocks: [
          { kind: 'p', text: 'Here\'s the key difference. Being reliable is something you do. Being credible is what other people believe about you, based on what they\'ve seen. The two can drift far apart. A person can be excellent and invisible, or average and well known.' },
          { kind: 'p', text: 'Many kind, capable people assume that the first leads to the second automatically. It usually doesn\'t. Busy people can\'t see what you do. They see what reaches them: a message, a meeting, a result with your name on it, a promise kept or broken.' },
          { kind: 'p', text: 'You don\'t need to sell yourself. You need the people who make decisions to have accurate information.' },
        ],
      },
    ],
    limits: [
      'It can\'t promise a promotion or a raise. It helps you make your case clearly and know what to do if the answer is no.',
      'It won\'t ask you to prove anyone\'s motive. The goal is accurate credit, not a confession.',
      'It won\'t teach you to fake confidence or copy a body-language checklist (Chapter 19 explains why).',
      'If you believe credit is being withheld because of your race, sex, age or another protected trait, or as payback for raising a concern, the book says to talk to HR or an employment lawyer.',
    ],
    buyLine: 'Ready for your work to carry your name?',
    ps: 'Keisha didn\'t get the lead role. She did get her name in front of her manager\'s boss, and a written record. The book calls that a fair result for one conversation. The full exchange is in {ref}.',
    psRef: { ch: 23, section: 'When someone repeats your idea in a meeting' },
  },

  /* ───────────── 3. The family favor that turns into a debt ───────────── */
  {
    slug: 'favor',
    metaTitle: '"After Everything I\'ve Done." Five Words, and a Favor Becomes a Debt. | Shadow Persuasion: The Hidden Rules of Power',
    pre: 'When family favors come with a bill',
    title: ['“After everything I’ve done.”', 'Five words, and a favor becomes a debt.'],
    lead: 'A request arrives with the answer already assumed. Saying no means explaining, defending, and hearing the family history again.',
    openingKicker: 'A scene from Chapter 26',
    openingHead: 'The help was real. So was the bill, months later.',
    opening: [
      'Darnell\'s sister, Yvonne, helped him move last summer. Now her car is in the shop, and she assumes he\'ll drive her to work every weekday.',
      '"After everything I did with your move, you can\'t do this?"',
      'Nobody here is a villain. The help was real. What changed is that a gift, given freely months ago, has come back as a debt, with a price nobody agreed to.',
      'Chapter 7 starts with one question: what kind of thing is being asked of you? A duty is something you owe because of a role or a promise. A favor is a gift you can decline, even after years of giving it. An agreement is something two people both said yes to, with clear terms. Guilt pressure blurs the three.',
      'Shadow Persuasion shows how to honor what someone did for you and still say no to today\'s request, how to take back a yes you gave too fast, and what to do when the answer is still no. It can\'t stop a relative from asking. It helps you decide what you actually owe.',
    ],
    routeIntro: 'If this sounds like your family, you don\'t have to read the book in order. Start with these chapters.',
    route: [
      { ch: 7, section: 'Duties, favors, and agreements', title: 'Duties, favors, and agreements', why: 'Tell a real duty from a favor, and both from an agreement, with examples from money, holidays and caregiving.' },
      { ch: 7, section: 'When past help is treated as a debt', title: 'When past help is treated as a debt', why: 'The ledger and the favor with a hidden price: what each sounds like, why it works, what to say.' },
      { ch: 7, section: 'Taking back a yes you gave too fast', title: 'Taking back a yes you gave too fast', why: 'Five steps for going back on a quick yes, with as little damage as possible.' },
      { ch: 26, section: 'Caring for an aging parent without doing it all alone', title: 'When the same person does all the helping', why: 'Make the work visible, ask relatives for named commitments, and decide what to do when they won\'t help.' },
      { ch: 24, section: 'When family or friends ask to borrow money', title: 'When family or friends ask to borrow money', why: 'The question to ask yourself before you answer, and the rule you\'re allowed to make about old loans.' },
      { ch: 3, section: 'The five clauses', title: 'The Good Person Contract', why: 'The unspoken rules that make a fair no feel like a betrayal.' },
      { ch: 28, section: 'Four paths, and what each one costs', title: 'When they still say no', why: 'If the pressure keeps coming: accept, escalate, step back or leave, and what each one costs.' },
    ],
    excerpts: [
      {
        ch: 7,
        chapterTitle: 'Guilt, Favors, and Hidden Debts',
        section: 'Duties, favors, and agreements',
        blocks: [
          { kind: 'p', text: 'A duty is something you owe because of a role you took on, a promise you made, or a clear responsibility. You owe your young children care. You owe your employer the work you\'re paid for.' },
          { kind: 'p', text: 'A favor is a gift of your time, money or help. It\'s freely given, and you can decline it. Doing it for years doesn\'t turn it into a duty.' },
          { kind: 'p', text: 'An agreement is something two people both said yes to, with clear terms. You lent your brother five hundred dollars, and he agreed to pay it back by June. That\'s an agreement.' },
          { kind: 'p', text: 'Guilt pressure blurs these lines. Favors get treated as duties. Past favors get treated as debts. Agreements nobody made get treated as if they were signed.' },
        ],
      },
      {
        ch: 7,
        chapterTitle: 'Guilt, Favors, and Hidden Debts',
        section: 'When past help is treated as a debt',
        sub: 'The ledger',
        blocks: [
          { kind: 'p', text: 'Why it works. It turns a relationship into an account. The past kindness becomes a debt, and the request in front of you becomes the payment. Saying no makes you feel ungrateful as well as unhelpful.' },
          { kind: 'p', text: 'What to say. Honor the past, then separate it from today.' },
          { kind: 'say', lines: ['"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."', '"I remember, and it meant a lot. This one doesn\'t work for me."'] },
          { kind: 'p', text: 'What not to do. Don\'t start listing what you\'ve done for them. That agrees you\'re both keeping score, and invites a long argument about who owes whom.' },
        ],
      },
      {
        ch: 26,
        chapterTitle: 'Family, Friends, and the Roles That Stick',
        section: 'Caring for an aging parent without doing it all alone',
        sub: 'When past help becomes a claim on your time',
        blocks: [
          {
            kind: 'talk',
            lines: [
              { who: 'Yvonne', text: '"After everything I did with your move, you can\'t do this?"' },
              { who: 'Darnell', text: '"I appreciated that help, a lot. I can drive you Tuesday. I can\'t do the whole week."' },
              { who: 'Yvonne', text: '"So you only take favors. You don\'t return them."' },
              { who: 'Darnell', text: '"I want to help. Tuesday is what I can offer."' },
              { who: 'Yvonne', text: '"Forget it."' },
              { who: 'Darnell', text: '"Okay. Let me know by Monday if you want Tuesday."' },
            ],
          },
          { kind: 'p', text: 'Yvonne is still annoyed. Darnell hasn\'t erased her kindness, and he hasn\'t signed up for a week of driving.' },
        ],
      },
    ],
    limits: [
      'It can\'t make a relative stop asking, or stop being annoyed. It helps you decide what you actually owe and answer calmly.',
      'If you already made a promise, the book says to deal with it directly, not pretend it was never made.',
      'For wills, estates, or money with legal terms attached, it points you to an estate or elder law attorney.',
      DANGER_LIMIT,
    ],
    buyLine: 'Ready to tell a favor from a debt?',
    ps: 'Darnell didn\'t erase his sister\'s kindness, and he didn\'t sign up for a week of driving. He offered Tuesday. The whole exchange is six lines long, in {ref}.',
    psRef: { ch: 26, section: 'Caring for an aging parent without doing it all alone' },
  },

  /* ───────────── 4. The ex who keeps reopening agreements ───────────── */
  {
    slug: 'ex',
    metaTitle: 'The Relationship Ended. The Arguments Moved Into the Messages. | Shadow Persuasion: The Hidden Rules of Power',
    pre: 'Messages, pickups and agreements after a separation',
    title: ['The relationship ended.', 'The arguments moved into the messages.'],
    lead: 'A pickup time was agreed last week. Tonight\'s message treats it as if it never happened.',
    openingKicker: 'A scene from Chapter 25',
    openingHead: 'One line is about the schedule. The rest is about her.',
    opening: [
      'Angela\'s phone buzzes at 9:40 p.m. The kids are asleep. She\'s folding laundry on the couch. It\'s Craig, her ex-husband. They\'ve been divorced for two years.',
      '"Since you obviously can\'t handle Thursdays, I\'ll pick the kids up from school at 3 from now on." Thursday pickup is hers. It has been for two years. She has never been late.',
      'Her thumbs are already moving: a paragraph about never missing a Thursday, another about the recital he forgot, a third about his new girlfriend. She stops, deletes it all, and puts the phone face down on the cushion.',
      'Look at what the message actually contains. One piece is about the schedule. Everything else is about Angela as a person. The schedule part needs an answer. The rest does not.',
      'Shadow Persuasion shows how to write the brief, factual reply, keep records safely, and decide what to do when agreements still fail. It gives no custody tactics and promises no outcomes. For anything about a parenting plan or a court order, it sends you to a family lawyer.',
    ],
    routeIntro: 'If this sounds like your messages, you don\'t have to read the book in order. Start with these chapters.',
    route: [
      { ch: 25, section: 'After a separation: when your ex still controls everything', title: 'After a separation', why: 'Brief messages about one practical thing, changed arrangements, repeated messages, and records, privacy and passwords.' },
      { ch: 8, section: 'Protecting your memory', title: 'Protecting your memory', why: 'Write it down soon, confirm agreements in writing, say your version once, then answer the decision, not the history.' },
      { ch: 9, section: 'When you can\'t avoid contact', title: 'When you can\'t avoid contact', why: 'Staying polite and practical with someone who goes cold, without chasing.' },
      { ch: 22, section: 'When someone wants to change the deal', title: 'When someone wants to change the deal', why: 'What to do when an agreement is reopened, and when it keeps slipping.' },
      { ch: 11, section: 'A hard conversation, or a dangerous one', title: 'When pressure becomes danger', why: 'How to tell a hard conversation from a dangerous one, and why a better line is not the answer there.' },
      { ch: 28, section: 'Name the kind of no you are facing', title: 'When they still say no', why: 'Broken promises, exclusion, retaliation and silence as punishment, and your plan for each.' },
    ],
    excerpts: [
      {
        ch: 25,
        chapterTitle: 'Dating, Intimacy, and Difficult Relationships',
        section: 'After a separation: when your ex still controls everything',
        sub: 'Keep messages brief and about the kids',
        blocks: [
          { kind: 'p', text: 'A useful message to an ex is short, polite and about one practical thing. Leave out feelings, history, defenses and digs. Include the facts needed to handle the practical issue. Leave out insults and anything that doesn\'t help solve it.' },
          { kind: 'p', text: 'Angela wrote her reply the next morning, after coffee.' },
          {
            kind: 'talk',
            lines: [
              { who: 'Angela', text: '"Our schedule has me picking the kids up from aftercare at 5 on Thursdays. I\'ll be there at 5 this week as usual. If you\'d like to change the schedule going forward, please send me the proposal in writing and I\'ll think about it."' },
              { who: 'Craig', text: '"We never agreed on 5. We said \'after work.\' Typical of you to twist things."' },
              { who: 'Angela', text: '"My copy of the schedule says 5. I\'ll be at aftercare at 5 on Thursday."' },
            ],
          },
        ],
      },
      {
        ch: 25,
        chapterTitle: 'Dating, Intimacy, and Difficult Relationships',
        section: 'After a separation: when your ex still controls everything',
        sub: 'When the messages keep coming',
        blocks: [
          { kind: 'p', text: 'Some exes send ten messages in an hour, or bait you with comments about your new partner, your family or your past. You can leave personal digs unanswered and still deal with the practical matter. If you share children or have a court order, ask a family lawyer what communication is required and how to handle repeated unwanted contact.' },
          { kind: 'say', lines: ['"I\'m happy to talk about the pickup schedule. I\'m not going to discuss the past."', '"I\'ll answer messages about the kids. I won\'t respond to the rest."'] },
          { kind: 'p', text: 'Say it once. After that, simply answer the logistics and leave the rest unanswered.' },
        ],
      },
      {
        ch: 8,
        chapterTitle: 'When the Story Keeps Changing',
        section: 'Protecting your memory',
        sub: '2. Confirm agreements in writing',
        blocks: [
          { kind: 'p', text: 'After a phone call or a meeting, send one short message that says what you understood and asks them to reply.' },
          { kind: 'say', lines: ['"Just confirming what we said on the phone: I\'ll have the kids from Saturday the 12th to Wednesday the 16th. Can you reply to confirm, or tell me if you have something different?"'] },
          { kind: 'p', text: 'Keep it neutral. Don\'t add "since you always forget." And remember that a message nobody answers records what you said. It doesn\'t prove the other person agreed.' },
        ],
      },
    ],
    limits: [
      'No custody tactics, and no promised outcomes. For a parenting plan, a court order or a disputed pickup, the book sends you to a family lawyer.',
      'It can\'t make the other person communicate fairly. It helps you choose which conversation to have.',
      'Scripts are not a safety plan. If there is fear, control or monitoring, talk to a domestic violence advocate before you change anything.',
      DANGER_LIMIT,
    ],
    buyLine: 'Ready to answer the schedule and leave the rest?',
    ps: 'Craig replied twice more. Angela answered the logistics, asked him not to put the kids in the middle, and left his last line unanswered. The full exchange is in {ref}.',
    psRef: { ch: 25, section: 'After a separation: when your ex still controls everything' },
  },
];

export function getAngle(slug: string): Angle | undefined {
  return ANGLES.find((a) => a.slug === slug);
}
