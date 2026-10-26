/* eslint-disable @next/next/no-img-element */
/**
 * The angle sales page, in the /v2 design. Used by /a/[angle] (broad first-test angles) and
 * /b/[slug] (one specific problem per page). Same sections as /v2; copy comes from an Angle object.
 * Originally: angle landing pages for the first Meta ad test: /a/parent, /a/work, /a/favor, /a/ex.
 * Copy and excerpts live in app/a/angles.ts.
 *
 * Each page = the angle's own hero, opening scene, "start here" reading route and sample pages,
 * then the full /v2 sales page in the same order (app/v2/page.tsx). If /v2 changes its sections,
 * mirror the change here.
 *
 * Meta's rule for ad landing pages: copy must not tell the reader facts about their own life.
 * Where a /v2 section says "you did X" or "this happened to you", this page passes softer wording
 * through optional props (or rewrites its own headings) to describe scenes and other people instead.
 * Hidden from search engines.
 */
import { Fragment } from 'react';
import { SubscribeForm } from '../v2/_components/SubscribeForm';
import { BuyButton, BuyNote } from '../v2/_components/ui';
import { Hero, Mark, MarginNote, Notebook, PartOpener, Replay, Scenes, type Moment, type NightEntry, type Scene } from '../v2/_components/editorial';
import {
  ForYou,
  GoodPersonContract,
  InterceptedMessage,
  LookInside,
  NiceLoop,
  ResetPath,
  ScenarioTabs,
  SevenParts,
  SituationPicker,
  StickyBuyBar,
  TacticRolodex,
  WayOut,
  type Scenario,
} from '../v2/_components/interactive';
import { Close, FaqSection, Footer, GuaranteeNight, Heading, InlineBuy, Letter, LetterHead, Night, OrderCards, PsLink, Sheet, StackList } from '../v2/_components/blocks';
import { HAS_PAGE_NUMBERS, pageRef, pageRefShort } from '../v2/_components/pageRef';
import type { Angle, Excerpt } from './angles';

const INK = '/v2/ink';
const LINO = '/v2/lino';


/* ───────────── Meta-safe wording for the reused /v2 sections ───────────── */

// The 3 a.m. replay, told about one person instead of "you".
const NIGHT_LOG: NightEntry[] = [
  { t: '3:07', h: 3, m: 7, line: 'A sentence surfaces. Something someone said yesterday, or last week, or eleven years ago at a wedding.' },
  { t: '3:12', h: 3, m: 12, line: 'She is back in the room. Same words. Same small pause before she answered.' },
  { t: '3:20', h: 3, m: 20, line: 'And the answer she gave, which was polite and reasonable and wrong.', mark: 'polite and reasonable and wrong.' },
  { t: '3:41', h: 3, m: 41, line: 'She rewrites it. In this version she stays calm and says the precise thing.' },
  { t: '4:02', h: 4, m: 2, line: 'She has a speech that would end the argument for good.' },
  { t: '4:03', h: 4, m: 3, line: 'And nobody to give it to.' },
];
const REPLAY_OUTRO = 'The yes she didn’t mean. The raise she didn’t ask for. The joke at her expense she laughed along with.';

// The notebook: small moments described as scenes, not as things that happened to the reader.
const MOMENTS: Moment[] = [
  { m: 'A “quick favor” takes a whole Saturday.', cost: 'One Saturday' },
  { m: 'The same person hosts the holiday again.', cost: 'One holiday, cooked and cleaned up' },
  { m: 'An apology for something the other person did.', cost: 'One apology nobody owed' },
  { m: 'An idea comes out of someone else’s mouth in a meeting.', cost: 'One good idea, credited to them' },
  { m: 'Someone goes quiet for two days, until the other person fixes it.', cost: 'Two days on eggshells' },
  { m: 'Money lent that nobody wanted to lend.', cost: 'Money that may not come back' },
  { m: 'A night spent replaying what should have been said.', cost: 'A night’s sleep' },
];
const VERDICTS: [string, string, string] = [
  'Nobody forced anyone. It just felt easier than making it awkward.',
  'Someone got the easy evening. Someone else paid for it.',
  'This isn’t bad luck. It’s a pattern, and patterns can be changed.',
];

// The three prints: what the people in them do, not what "you" do.
const SCENES: Scene[] = [
  { img: `${LINO}/table.jpg`, alt: 'A family holiday dinner, one man sitting back with a strained smile', label: 'The holiday table', said: '“Well, some of us actually make an effort to visit.”', aside: '', you: 'He laughs it off, then spends the drive home rehearsing what he should have said.' },
  { img: `${LINO}/office.jpg`, alt: 'A man presenting in a meeting while a woman watches her idea taken', label: 'The Tuesday meeting', said: '“So I had this idea…”', aside: '(It was her idea.)', you: 'She says nothing, because making a fuss feels worse than losing the credit.' },
  { img: `${LINO}/phone.jpg`, alt: 'Two hands holding a phone over a kitchen table at night', label: 'The text that gets reread', said: '“Fine. I guess I’ll figure it out myself, like always.”', aside: '', you: 'The reply is an apology for something nobody did. It gets sent anyway.' },
];

// "Same moment. Different answer." with "a manager" instead of "your manager".
const SCENARIOS: Scenario[] = [
  { tab: 'At work', icon: 'briefcase', who: 'A manager, Friday at 4:40', them: 'Need you on this over the weekend. It’s due Monday.', old: 'Oh, sure, no problem. I’ll make it work.', calm: 'Let me look at what’s already on my plate and tell you in ten minutes.', note: 'The pause, Chapter 5' },
  { tab: 'Family', icon: 'house', who: 'The family group chat', them: 'So we’re all at yours for Christmas again?', old: 'I guess so… if nobody else can.', calm: 'I haven’t agreed to host this year. I can bring two dishes. Who else has room?', note: 'The Power Map, Chapter 2' },
  { tab: 'Partner', icon: 'rings', who: 'A partner, after something hard was raised', them: '(Two days of silence.)', old: 'I’m sorry, I shouldn’t have brought it up. Can we just forget it?', calm: 'I can tell you’re upset. When you want to talk, I’m here.', note: 'Chapter 9, Silence, Distance, and Conditional Warmth' },
  { tab: 'Friends', icon: 'speech', who: 'A friend, with last spring’s loan still open', them: 'Could you spot me again? Just till next month, promise.', old: 'How much do you need? I can move some things around.', calm: 'I’m not able to lend more until the first loan is sorted out. When do you think you can start paying that back?', note: 'The slow squeeze, Chapter 10' },
];

// Replies from Part II of the book: Chapter 7 (guilt), 8 (changing stories), 9 (silence), 10 (urgency).
const BREAKDOWN = [
  { they: '"After everything I\'ve done for you..."', really: 'Past kindness is being turned into a debt, so that saying no feels ungrateful as well as unhelpful.', reply: '"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."' },
  { they: '"That never happened. You\'re too sensitive."', really: 'The argument has moved from what they did to whether a memory can be trusted.', reply: '"I remember it differently. Here\'s what I need now."' },
  { they: 'Two days of silence after a disagreement.', really: 'If the silence lifts after giving in and comes back after a no, it is working as pressure.', reply: '"I can tell you\'re upset. When you want to talk, I\'m here."' },
  { they: '"I need an answer right now."', really: 'Urgency shuts down careful thinking. Real urgency can usually survive a short pause to check.', reply: '"If it has to be decided now, my answer is no."' },
];

// Each bullet names a chapter and its exact section heading (page numbers aren't final; see pageRef.ts).
const PAGE_BULLETS = [
  { ch: 3, section: 'What other people learn from you', text: 'The six small signals that teach people how much pressure it takes to change a mind, and why they are habits, not personality.' },
  { ch: 31, section: 'Day 3: One clean no, and one held silence', text: 'How to say one clean no without an excuse, and why every reason past the first gives the other person something to argue with.' },
  { ch: 7, section: 'When past help is treated as a debt', text: '“After everything I’ve done for you…” How to honor the past and still say no, without starting a long argument about who owes whom.' },
  { ch: 8, section: 'The common ways a story changes', text: '“That never happened.” What to say when someone rewrites the past and the argument turns to memory instead.' },
  { ch: 9, section: 'Why silence is so hard to sit through', text: 'Why the silent treatment works so well on kind people, and how to stop working to fill the silence.' },
  { ch: 10, section: 'The slow squeeze', text: 'The boss who keeps moving the goalposts on a raise, and the one sentence that names the original agreement.' },
  { ch: 17, section: 'How to prepare an ask', text: 'Five steps to prepare an ask, from the top of what can be justified to the limit set before walking in.' },
  { ch: 26, section: 'Caring for an aging parent without doing it all alone', text: 'An aging parent, two siblings full of ideas, and one person doing the work. How one family call changed who does what.' },
];

const ALTERNATIVES = [
  ['Venting to friends', 'It feels better for an evening. Nothing changes on Monday.'],
  ['Books that explain why', 'Understanding why people say yes rarely changes what they do in the moment.'],
  ['Getting harder and colder', 'It costs the kindness, and often the people too.'],
  ['Cutting everyone off', 'Sometimes right. Often impossible: it’s a mother, a boss, a partner.'],
  ['Waiting for them to change', 'They have no reason to. The current deal works for them.'],
];

const INCLUDED = [
  'See the hidden rules and the pressure while it is happening',
  'Calm replies for pressure patterns, with worked conversations and follow-through',
  'Worked conversations where the other person argues back',
  'Ask for what you want in the open: credit, pay, help, fair terms',
  'A 21-day reset of small daily practices',
  'An app to decode real messages and rehearse hard conversations',
];

// "Is it for you?": who the book was written for, instead of "you say yes, then resent it".
const FOR_LINES: [string, React.ReactNode][] = [
  ['hand', <Fragment key="hand">People who <mark className="sp2-hl">say yes, then resent it.</mark></Fragment>],
  ['speech', <Fragment key="speech">People who <mark className="sp2-hl">apologize</mark> for things they didn&apos;t do.</Fragment>],
  ['moon', <Fragment key="moon">People who <mark className="sp2-hl">replay conversations</mark> long after they end.</Fragment>],
  [
    'house',
    <Fragment key="house">
      The one everyone calls{' '}
      <span className="relative inline-block italic">
        &ldquo;the nice one,&rdquo;
        <img src="/v2/ink/underline-red.png" alt="" aria-hidden className="pointer-events-none select-none absolute left-0 -bottom-1 w-full h-3" />
      </span>{' '}
      who is tired of what it costs.
    </Fragment>,
  ],
  ['compass', <Fragment key="compass">Anyone who wants to stay kind, and <mark className="sp2-hl">stop being easy to use.</mark></Fragment>],
];
const NOT_FOR: [string, string][] = [
  ['push', 'Anyone who wants tricks to control or deceive people'],
  ['head', 'Anyone looking for a replacement for therapy'],
  ['book', 'Anyone who wants to read about it without practicing it'],
  ['shield', 'Anyone in danger right now (please use the hotline in the questions below)'],
];

/* ───────────── Angle-only pieces ───────────── */

/** One sample page from the book, set like a printed page. */
export function SamplePage({ ex, i }: { ex: Excerpt; i: number }) {
  return (
    <article className={`bg-[#fdfbf6] shadow-[0_30px_50px_-30px_rgba(28,27,24,0.55)] px-6 sm:px-12 py-9 sm:py-12 ${i % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'}`}>
      <p className="sp2-type text-[15px] tracking-[0.14em] text-[color:var(--sp2-accent)] uppercase">
        Chapter {ex.ch} · {ex.chapterTitle}
      </p>
      <h3 className="sp2-display text-[30px] sm:text-[36px] leading-[1.1] mt-3">{ex.sub ?? ex.section}</h3>
      <div className="mt-5 text-[19px] sm:text-[20px] leading-[1.6] space-y-4 font-[family-name:var(--font-sp2-serif)]">
        {ex.blocks.map((b, k) => {
          if (b.kind === 'p') return <p key={k}>{b.text}</p>;
          if (b.kind === 'say')
            return (
              <div key={k} className="border-l-[3px] border-[color:var(--sp2-gold)] pl-5 py-1">
                <p className="sp2-ui text-[14px] font-bold uppercase tracking-[0.12em] text-[color:var(--sp2-muted)] mb-1">Try saying</p>
                {b.lines.map((l) => (
                  <p key={l} className="italic">
                    {l}
                  </p>
                ))}
              </div>
            );
          return (
            <div key={k} className="space-y-2">
              {b.lines.map((l, n) => (
                <p key={n}>
                  {l.who && <b className="font-semibold">{l.who}: </b>}
                  {l.text}
                </p>
              ))}
            </div>
          );
        })}
      </div>
      <p className="sp2-note mt-6">From {pageRef(ex.ch, ex.section)}.</p>
    </article>
  );
}

export function AngleView({ a }: { a: Angle }) {
  const [psBefore, psAfter] = a.ps.split('{ref}');

  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      {/* ═══════ THE ANGLE'S OWN OPENING ═══════ */}
      <Hero
        pre={a.pre}
        title={
          <>
            <span className="block text-[40px] sm:text-[60px] lg:text-[68px] text-[#faf6ee] leading-[1.02]">{a.title[0]}</span>
            <span className="block italic text-[44px] sm:text-[70px] lg:text-[80px] text-[color:var(--sp2-gold)] mt-3 leading-[1]">{a.title[1]}</span>
          </>
        }
        lead={a.lead}
      />

      {/* The opening scene */}
      <Sheet className="pt-24 sm:pt-32 pb-16">
        <LetterHead kicker={a.openingKicker}>{a.openingHead}</LetterHead>
        <Letter>
          {a.opening.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Letter>
      </Sheet>

      {/* Start here: the reading route */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="If this is your situation">Start here.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">{a.routeIntro}</p>
          <ol className="mt-10">
            {a.route.map((r, i) => (
              <li key={`${i}:${r.ch}:${r.section}`} className="sp2-rule flex gap-5 sm:gap-7 py-6">
                <span className="sp2-display text-[40px] leading-none text-[color:var(--sp2-accent)] min-w-[36px]">{i + 1}</span>
                <span>
                  <span className="sp2-type block text-[16px] tracking-[0.1em] text-[color:var(--sp2-oxblood)]">{pageRef(r.ch, r.section)}</span>
                  <span className="sp2-display block text-[28px] leading-tight mt-1">{r.title}</span>
                  <span className="block text-[19px] leading-snug text-[color:var(--sp2-muted)] mt-1">{r.why}</span>
                </span>
              </li>
            ))}
          </ol>
          {a.routeNote && <MarginNote className="mt-8">{a.routeNote}</MarginNote>}
        </div>
      </Sheet>

      {/* Sample pages */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="Sample pages">Read it before you buy it.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">Three short passages from the book, word for word.</p>
          <div className="mt-12 space-y-12">
            {a.excerpts.map((ex, i) => (
              <SamplePage key={`${i}:${ex.ch}:${ex.sub ?? ex.section}`} ex={ex} i={i} />
            ))}
          </div>
        </div>
      </Sheet>
      <Sheet className="pb-12">
        <InlineBuy line="Want the rest of the book?" />
      </Sheet>

      {/* ═══════ FROM HERE ON: THE /v2 PAGE, IN THE SAME ORDER ═══════ */}

      {/* ═══════ PART I: THE MOMENT ═══════ */}
      <div className="bg-[color:var(--sp2-paper)] pt-20 lg:pt-28">
        <PartOpener n="I" title="The moment it happens" />
      </div>
      <Replay log={NIGHT_LOG} outro={REPLAY_OUTRO} />
      <Notebook
        kicker="Small yeses add up"
        heading={
          <>
            Tap any you have{' '}
            <span className="relative inline-block whitespace-nowrap">
              seen happen.
              <Mark name="underline" red className="left-0 -bottom-3 w-full" />
            </span>
          </>
        }
        moments={MOMENTS}
        receiptTitle="WHAT IT COST"
        receiptSub="Small yeses, added up"
        paidBy="THE NICE ONE"
        verdicts={VERDICTS}
      />
      <Scenes scenes={SCENES} />

      {/* ═══════ PART II: WHY ═══════ */}
      <div className="bg-[color:var(--sp2-paper)] pt-10">
        <PartOpener n="II" title="Why it keeps happening" />
      </div>
      <Sheet className="pt-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-start">
          <div className="lg:col-span-6">
            <Heading kicker="It isn&apos;t weakness">It&apos;s rules learned too well.</Heading>
            <div className="sp2-body mt-8 max-w-[34em]">
              <p>Many kind people pick up a set of rules nobody ever showed them, from many small moments over many years. Other people&apos;s feelings are their job. Their own needs are a burden. Those rules still run most of their conversations.</p>
              <p>
                And the people around them learn, mostly without thinking about it, exactly which buttons to press: a sigh, a compliment before a request, a deadline that appears from nowhere, a silence that lasts until someone apologizes.
              </p>
              <p>Nobody needs to become cold, or become one of them. What helps is seeing the hidden rule while it&apos;s working, and having a calm answer that can actually be said out loud.</p>
            </div>
          </div>
          <div className="lg:col-span-6 lg:pt-16 lg:-mr-[3vw]">
            <GoodPersonContract />
            <MarginNote className="mt-6 lg:ml-10">The Good Person Contract, Chapter 3.</MarginNote>
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <NiceLoop />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <Heading kicker="Why it keeps happening">Every time it works, they learn.</Heading>
            <div className="sp2-body mt-8 max-w-[32em]">
              <p>Some pressure is deliberate. Some becomes a habit. Pressure that works gets used again, a little more each time.</p>
              <p>The guilt trip that got a yes in March becomes the guilt trip in April. The silence that ended with an apology becomes the way every disagreement ends.</p>
            </div>
          </div>
        </div>
        <div className="mt-24 lg:mt-32 text-center">
          <p className="sp2-display text-[34px] sm:text-[52px] leading-[1.1] max-w-[22ch] mx-auto">
            You can change your response, even if the pressure{' '}
            <span className="relative inline-block italic">
              continues.
              <Mark name="underline" className="left-0 -bottom-3 w-full h-3" />
            </span>
          </p>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)]">That part is learnable. The 21-day reset trains it, one small practice a day.</p>
        </div>
        <div className="mt-20">
          <WayOut />
        </div>
      </Sheet>

      {/* ═══════ PART III: WHAT THE BOOK DOES ═══════ */}
      <Night className="mt-6">
        <PartOpener n="III" title="What the book gives you" dark />
        <div className="mt-16">
          <Heading kicker="One message, taken apart" dark>
            One sentence. Three hooks. A calm way out.
          </Heading>
        </div>
        <div className="mt-14">
          <InterceptedMessage />
        </div>
      </Night>

      <Sheet className="pt-28 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-7">
            <Heading kicker="Part Two of the book">Eight pressure patterns, and a calm answer to each.</Heading>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-16">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">What each one sounds like, why it works, and calm words that answer it.</p>
            <MarginNote className="mt-3">Tap any tactic for the calm reply.</MarginNote>
          </div>
        </div>
        <div className="mt-14">
          <TacticRolodex />
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <Heading kicker="Before and after">Same moment. Different answer.</Heading>
        <div className="mt-12">
          <ScenarioTabs scenarios={SCENARIOS} initial={a.scenarioTab} oldLabel="the old answer" />
        </div>
      </Sheet>

      <Sheet className="pb-28">
        <Heading kicker="Short, calm, and hard to argue with">Say less. Mean it.</Heading>
        <div className="mt-12">
          {BREAKDOWN.map((b) => (
            <div key={b.they} className="sp2-rule grid lg:grid-cols-[1.1fr_1.3fr_1.4fr] gap-3 lg:gap-12 py-9">
              <p className="sp2-display italic text-[28px] leading-[1.2]">{b.they}</p>
              <p className="text-[color:var(--sp2-muted)]">
                <span className="sp2-note block !text-[16px] mb-1">What is really going on</span>
                {b.really}
              </p>
              <p className="text-[22px] leading-[1.45] font-semibold">
                <span className="sp2-note block !text-[16px] !font-normal mb-1">A calm reply</span>
                {b.reply}
              </p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* A quiet buy moment, with the angle's own line */}
      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-5 lg:col-start-2">
            <img src="/v2/img/bundle-cutout.webp" alt="The Shadow Persuasion book with the journal and three bonuses" className="w-full drop-shadow-[0_30px_30px_rgba(28,27,24,0.35)]" loading="lazy" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="sp2-display text-[40px] sm:text-[52px] leading-[1.05]">{a.buyLine}</p>
            <p className="sp2-lead mt-5 text-[color:var(--sp2-muted)]">The book in print, the digital copy tonight, the journal, three bonuses and 60 days of the companion app.</p>
            <div className="mt-8">
              <BuyButton className="w-full sm:w-auto" />
              <BuyNote />
            </div>
          </div>
        </div>
      </Sheet>

      {/* ═══════ PART IV: INSIDE THE BOOK ═══════ */}
      <div className="bg-[color:var(--sp2-paper)] pt-6">
        <PartOpener n="IV" title="Inside the book" />
      </div>
      <Sheet className="pt-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-7">
            <Heading kicker="Seven parts, in this order">See it. Stop it. Then ask for what you want.</Heading>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-20">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">
              Read it in order, go straight to a situation with the Situation Finder, or start the 21-day reset in Part VII any time, even before reading the rest.
            </p>
          </div>
        </div>
        <div className="mt-14">
          <SevenParts />
          <p className="sp2-rule mt-14 pt-10 max-w-[44em] text-[color:var(--sp2-muted)]">
            Part V puts it to work: credit and pay at work, clients and money, an ex who still controls the schedule, a critical parent, an aging parent&apos;s care,
            in-laws, and the friend who always needs something.
          </p>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-4">
            <Heading kicker="Open it to the page you need">Every page is a hard moment, handled.</Heading>
            <MarginNote className="mt-6">{HAS_PAGE_NUMBERS ? 'Page numbers from the printed copy.' : 'Chapter numbers from the book.'}</MarginNote>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {PAGE_BULLETS.map((b, i) => (
              <div key={`${i}:${b.ch}:${b.section}`} className="sp2-rule flex gap-6 py-6">
                <span className="sp2-type text-[20px] text-[color:var(--sp2-oxblood)] whitespace-nowrap pt-1 min-w-[70px]">{pageRefShort(b.ch, b.section)}</span>
                <p className="text-[21px] leading-[1.45]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <Heading kicker="The Situation Finder">Find the situation. Turn to the page.</Heading>
        <p className="sp2-lead mt-5 mb-12 text-[color:var(--sp2-muted)] max-w-[30em]">Pick a situation and see where the book deals with it.</p>
        <SituationPicker initialGroup={a.situation[0]} initialItem={a.situation[1]} />
      </Sheet>

      <Sheet className="pb-24 overflow-hidden">
        <div className="text-center">
          <p className="sp2-kicker">Look inside</p>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">Real pages from the book.</h2>
          <MarginNote className="mt-3">Tap any page to read it.</MarginNote>
        </div>
        <div className="mt-12">
          <LookInside />
        </div>
      </Sheet>

      <Sheet className="pb-16">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-6">
            <Heading kicker="Part VII of the book">The 21-day reset.</Heading>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-16">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">Most practices take a few seconds in the moment and a few minutes of writing in the evening. Low stakes first, so the new answer is already familiar when it really matters.</p>
          </div>
        </div>
        <div className="mt-16">
          <ResetPath />
        </div>
      </Sheet>
      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-6 lg:-ml-[max(40px,calc((100vw-1320px)/2+40px))]">
            <img src={`${LINO}/calm.jpg`} alt="A woman by a window in the morning, calm" className="w-full sp2-soft" loading="lazy" />
          </div>
          <p className="lg:col-span-5 lg:col-start-8 sp2-display italic text-[34px] sm:text-[46px] leading-[1.15]">
            The other people don&apos;t have to change for the answer to change.
          </p>
        </div>
      </Sheet>

      {/* ═══════ PART V: IS IT FOR YOU ═══════ */}
      <div className="bg-[color:var(--sp2-paper)]">
        <PartOpener n="V" title="Is it for you?" />
      </div>
      <Sheet className="pt-16 pb-24">
        <ForYou kicker="Written for" lines={FOR_LINES} notForHead={<>It isn&apos;t written for&hellip;</>} notFor={NOT_FOR} />
      </Sheet>

      {/* The angle's own limits: what the book won't promise (includes the danger line for /a/ex) */}
      <Sheet className="pb-16">
        <div className="max-w-[860px] mx-auto">
          <LetterHead kicker="Plainly">What this book won&apos;t promise.</LetterHead>
          <ul className="space-y-4 text-[20px] leading-[1.5]">
            {a.limits.map((t) => (
              <li key={t} className="sp2-rule pt-4">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Sheet>

      <Sheet className="pb-28">
        <Heading kicker="What people usually try">The usual fixes, and what actually changes it.</Heading>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 mt-12">
          <div>
            {ALTERNATIVES.map(([t, d]) => (
              <div key={t} className="sp2-rule py-5">
                <p className="relative inline-block font-semibold">
                  {t}
                  <Mark name="cross" red className="left-[-4px] top-1/2 -translate-y-1/2 w-[calc(100%+8px)] h-4 opacity-80" />
                </p>
                <p className="text-[color:var(--sp2-muted)] mt-1">{d}</p>
              </div>
            ))}
          </div>
          <div className="md:border-l md:border-[color:var(--sp2-line)] md:pl-16">
            <p className="sp2-display text-[34px] mb-2">Shadow Persuasion: The Hidden Rules of Power</p>
            {INCLUDED.map((t) => (
              <div key={t} className="sp2-rule flex gap-4 py-4 items-start">
                <img src={`${INK}/check.png`} alt="" aria-hidden className="w-7 h-7 flex-shrink-0 mt-0.5" />
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-8">
              <BuyButton full />
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
          <div className="lg:col-span-7">
            <Heading kicker="Included: 60 days of the companion app">Paste their message. See the tactic. Get a calm reply.</Heading>
          </div>
          <div className="lg:col-span-5 lg:pt-14">
            <p className="text-[color:var(--sp2-muted)]">
              Some messages leave a feeling of guilt, or of being rushed, without a clear reason. Paste one in, or upload a screenshot. The app names the tactic and
              suggests a calm reply. Then rehearse the hard conversation and follow the 21-day reset, one day at a time.
            </p>
            <MarginNote className="mt-4">60 days included. After that $9.99 a month, only if you choose to keep it. Nothing is charged automatically.</MarginNote>
          </div>
        </div>
        {/* Three phones fanned out, one per feature (real app screens) */}
        <div className="relative h-[360px] sm:h-[640px] mt-14 max-w-[900px] mx-auto">
          <img src="/v2/img/app-phone-rehearse.webp" alt="Rehearse: practising a hard conversation with an AI that plays a sister" className="absolute left-[2%] sm:left-[10%] top-[50px] w-[42%] sm:w-[30%] -rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" loading="lazy" />
          <img src="/v2/img/app-phone-reset.webp" alt="The 21-day reset: today's drill and progress" className="absolute right-[2%] sm:right-[10%] top-[50px] w-[42%] sm:w-[30%] rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" loading="lazy" />
          <img src="/v2/img/app-phone.webp" alt="The Decoder: a guilt-trip message, what is happening, and a calm reply" className="absolute left-1/2 -translate-x-1/2 top-0 w-[48%] sm:w-[34%] z-10 drop-shadow-[0_40px_40px_rgba(0,0,0,0.4)]" loading="lazy" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center max-w-[900px] mx-auto mt-6">
          {[
            ['Rehearse', 'Practice with an AI that plays the other person.'],
            ['Decode', 'See the tactic and get a calm reply.'],
            ['Reset', 'The 21 days, one drill at a time.'],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="sp2-display text-[24px] sm:text-[28px]">{t}</p>
              <p className="text-[16px] sm:text-[17px] leading-snug text-[color:var(--sp2-muted)]">{d}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet id="free-chapter" className="pb-28 scroll-mt-6">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-center">
          <div className="lg:col-span-6 lg:-ml-[max(40px,calc((100vw-1320px)/2+40px))]">
            <img src={`${LINO}/desk.jpg`} alt="A desk at night with an open notebook under a lamp" className="w-full sp2-soft" loading="lazy" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Heading kicker="Not sure yet?">Read a chapter free.</Heading>
            <p className="sp2-lead mt-6 mb-8 text-[color:var(--sp2-muted)]">It starts with the conversation people replay at 3 a.m., and what that replay is telling them.</p>
            <SubscribeForm />
          </div>
        </div>
      </Sheet>

      {/* ═══════ THE OFFER ═══════ */}
      <Sheet className="pb-24">
        <StackList />
      </Sheet>

      <Sheet className="pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="sp2-kicker">About the author</p>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">You won&apos;t find my life story here.</h2>
          <div className="sp2-body mt-8">
            <p>I&apos;m Nate Harlan. I could tell you how I learned all this, and you might enjoy it. It wouldn&apos;t help on Monday, when a sister calls about the holidays.</p>
            <p>So here is the first lesson instead:</p>
          </div>
          <p className="sp2-display italic text-[34px] sm:text-[48px] leading-[1.15] my-10">
            The person who{' '}
            <span className="relative inline-block">
              explains the most
              <Mark name="underline" red className="left-0 -bottom-2 w-full h-3" />
            </span>{' '}
            has the least power in the conversation.
          </p>
          <div className="sp2-body">
            <p>Most people give five reasons for a no when one would do. Every extra reason is a door left open, and the other person walks straight through it.</p>
            <p>A long list of my credentials would be the same mistake. This book is about the hard conversations, not about me.</p>
          </div>
        </div>
      </Sheet>

      <GuaranteeNight />

      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>

      <Sheet className="pb-24">
        <FaqSection />
      </Sheet>

      <Sheet className="pb-10">
        <Close
          headline={
            <>
              The strings only work while nobody{' '}
              <span className="relative inline-block italic">
                sees them.
                <Mark name="underline" red className="left-0 -bottom-4 w-full h-3" />
              </span>
            </>
          }
          ps={
            <>
              <p>
                <span className="sp2-display italic text-[28px]">P.S.</span> {psBefore}
                {pageRef(a.psRef.ch, a.psRef.section)}
                {psAfter}
              </p>
              <p>
                <span className="sp2-display italic text-[28px]">P.P.S.</span> If the book isn&apos;t for you, email us within 30 days for a full refund. It costs you nothing to
                find out. <PsLink />
              </p>
            </>
          }
        />
      </Sheet>
      <Footer />
      <StickyBuyBar />
    </main>
  );
}
