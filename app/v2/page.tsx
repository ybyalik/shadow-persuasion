/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { SubscribeForm } from './_components/SubscribeForm';
import { BuyButton, BuyNote } from './_components/ui';
import { Hero, Mark, MarginNote, Notebook, PartOpener, Replay, Scenes, TornEdge } from './_components/editorial';
import { FAQ_ITEMS, STACK, TypeCover } from './_components/blocks';
import { HAS_PAGE_NUMBERS, pageRefShort } from './_components/pageRef';

// Image folders (kept here: this page renders on the server).
const INK = '/v2/ink';
const LINO = '/v2/lino';
import {
  Faq,
  GoodPersonContract,
  InterceptedMessage,
  LookInside,
  NiceLoop,
  SevenParts,
  ForYou,
  ResetPath,
  ScenarioTabs,
  SituationPicker,
  StickyBuyBar,
  TacticRolodex,
  WayOut,
} from './_components/interactive';

// Replies from Part II of the book: Chapter 7 (guilt), 8 (changing stories), 9 (silence), 10 (urgency).
const BREAKDOWN = [
  {
    they: '"After everything I\'ve done for you..."',
    really: 'Past kindness is being turned into a debt, so that saying no feels ungrateful as well as unhelpful.',
    reply: '"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."',
    tag: 'Guilt',
  },
  {
    they: '"That never happened. You\'re too sensitive."',
    really: 'The argument has moved from what they did to whether you can trust your own memory.',
    reply: '"I remember it differently. Here\'s what I need now."',
    tag: 'Changing the story',
  },
  {
    they: 'Two days of silence after you disagreed.',
    really: 'If the silence lifts when you give in and comes back when you don\'t, it is working as pressure.',
    reply: '"I can tell you\'re upset. When you want to talk, I\'m here."',
    tag: 'Withdrawal',
  },
  {
    they: '"I need an answer right now."',
    really: 'Urgency shuts down careful thinking. Real urgency can usually survive a short pause to check.',
    reply: '"If it has to be decided now, my answer is no."',
    tag: 'Fake urgency',
  },
];

// Each bullet names a chapter and its exact section heading (page numbers aren't final; see pageRef.ts).
const PAGE_BULLETS = [
  { ch: 3, section: 'What other people learn from you', text: 'The six small signals that teach people how much pressure it takes to change your mind, and why they are habits, not your personality.' },
  { ch: 31, section: 'Day 3: One clean no, and one held silence', text: 'How to say one clean no without an excuse, and why every reason past the first gives the other person something to argue with.' },
  { ch: 7, section: 'When past help is treated as a debt', text: '“After everything I’ve done for you…” How to honor the past and still say no, without starting a long argument about who owes whom.' },
  { ch: 8, section: 'The common ways a story changes', text: '“That never happened.” What to say when someone rewrites the past and the argument turns to your memory instead.' },
  { ch: 9, section: 'Why silence is so hard to sit through', text: 'Why the silent treatment works so well on kind people, and how to stop working to fill the silence.' },
  { ch: 10, section: 'The slow squeeze', text: 'The boss who keeps moving the goalposts on your raise, and the one sentence that names the original agreement.' },
  { ch: 17, section: 'How to prepare an ask', text: 'Five steps to prepare an ask, from the top of what you can justify to the limit you set before you walk in.' },
  { ch: 26, section: 'Caring for an aging parent without doing it all alone', text: 'An aging parent, two siblings full of ideas, and one person doing the work. How one family call changed who does what.' },
];

const ALTERNATIVES = [
  ['Venting to friends', 'It feels better for an evening. Nothing changes on Monday.'],
  ['Books that explain why', 'Understanding why you say yes rarely changes what you do in the moment.'],
  ['Getting harder and colder', "It isn't who you are, and it costs you the people you love."],
  ['Cutting everyone off', "Sometimes right. Often impossible: it's your mother, your boss, your partner."],
  ['Waiting for them to change', 'They have no reason to. The current deal works for them.'],
];

const INCLUDED = [
  'See the hidden rules and the pressure while it is happening',
  'Calm words for each pattern, usually in a warm, a direct and a final version',
  'Worked conversations where the other person argues back',
  'Ask for what you want in the open: credit, pay, help, fair terms',
  'A 21-day reset of small daily practices',
  'An app to decode real messages and rehearse hard conversations',
];

/** A section on the continuous paper sheet. */
function Sheet({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative bg-[color:var(--sp2-paper)] sp2-grain ${className}`}>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">{children}</div>
    </section>
  );
}

/** A dark section with torn paper edges top and bottom. */
function Night({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-on-dark sp2-grain ${className}`}>
      <div className="absolute top-0 inset-x-0">
        <TornEdge flip />
      </div>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-24 sm:py-32">{children}</div>
      <div className="absolute bottom-0 inset-x-0">
        <TornEdge />
      </div>
    </section>
  );
}

/** Section heading in the book's display face. */
function Heading({ kicker, children, className = '', dark = false }: { kicker?: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={className}>
      {kicker && <p className={`sp2-kicker ${dark ? 'on-dark' : ''}`}>{kicker}</p>}
      <h2 className={`sp2-display text-[40px] sm:text-[60px] lg:text-[72px] leading-[1.02] tracking-[-0.01em] max-w-[16ch] ${dark ? 'text-[#faf6ee]' : ''}`}>{children}</h2>
    </div>
  );
}

export default function V2SalesPage() {
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      <Hero />

      {/* ═══════ PART I: THE MOMENT ═══════ */}
      <div className="bg-[color:var(--sp2-paper)] pt-32 lg:pt-44">
        <PartOpener n="I" title="The moment it happens" />
      </div>
      <Replay />
      <Notebook />
      <Scenes />

      {/* ═══════ PART II: WHY ═══════ */}
      <div className="bg-[color:var(--sp2-paper)] pt-10">
        <PartOpener n="II" title="Why it keeps happening" />
      </div>
      <Sheet className="pt-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-start">
          <div className="lg:col-span-6">
            <Heading kicker="It isn&apos;t because you&apos;re weak">It&apos;s because you learned the rules too well.</Heading>
            <div className="sp2-body mt-8 max-w-[34em]">
              <p>You picked up a set of rules nobody ever showed you, from many small moments over many years. Other people&apos;s feelings are your job. Your needs are a burden. They still run most of your conversations.</p>
              <p>
                And the people around you have learned, mostly without thinking about it, exactly which buttons to press:{' '}
                <span className="relative">
                  a sigh, a compliment before a request, a deadline that appears from nowhere, a silence that lasts until you apologize.
                </span>
              </p>
              <p>
                You don&apos;t need to become cold, and you don&apos;t need to become one of them. You need to see the hidden rule while it&apos;s working, and have a calm
                answer you can actually say out loud.
              </p>
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
              <p>Nobody sits down and plans to use you. It is simpler than that. Pressure that works gets used again, a little more each time.</p>
              <p>The guilt trip that got a yes in March becomes the guilt trip in April. The silence that ended with your apology becomes the way every disagreement ends.</p>
            </div>
          </div>
        </div>
        <div className="mt-24 lg:mt-32 text-center">
          <p className="sp2-display text-[34px] sm:text-[52px] leading-[1.1] max-w-[22ch] mx-auto">
            The loop only stops when the pressure stops{' '}
            <span className="relative inline-block italic">
              working.
              <Mark name="underline" className="left-0 -bottom-3 w-full h-3" />
            </span>
          </p>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)]">That part is up to you, and it is learnable. The 21-day reset trains it, one small practice a day.</p>
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
            <Heading kicker="Part Two of the book">Eight pressure patterns you have already met.</Heading>
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
          <ScenarioTabs />
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
                <span className="sp2-note block !text-[16px] !font-normal mb-1">You say</span>
                {b.reply}
              </p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* A quiet buy moment: the books on the paper, a note, a button */}
      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-5 lg:col-start-2">
            <img src="/v2/img/bundle-cutout.webp" alt="The Shadow Persuasion book with the journal and three bonuses" className="w-full drop-shadow-[0_30px_30px_rgba(28,27,24,0.35)]" loading="lazy" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="sp2-display text-[40px] sm:text-[52px] leading-[1.05]">Ready to stop replaying it at 3 a.m.?</p>
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
              Read it in order, go straight to your situation with the Situation Finder, or start the 21-day reset in Part VII any time, even before you read the rest.
            </p>
          </div>
        </div>
        <div className="mt-14">
          <SevenParts />
          <p className="sp2-rule mt-14 pt-10 max-w-[44em] text-[color:var(--sp2-muted)]">
            Part V puts it to work: credit and pay at work, clients and money, an ex who still controls the schedule, a parent who still makes you feel small,
            an aging parent&apos;s care, in-laws, and the friend who always needs something.
          </p>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-4">
            <Heading kicker="Open it to the page you need">Every page is a moment you used to lose.</Heading>
            <MarginNote className="mt-6">{HAS_PAGE_NUMBERS ? 'Page numbers from the printed copy.' : 'Chapter numbers from the book.'}</MarginNote>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {PAGE_BULLETS.map((b) => (
              <div key={`${b.ch}:${b.section}`} className="sp2-rule flex gap-6 py-6">
                <span className="sp2-type text-[20px] text-[color:var(--sp2-oxblood)] whitespace-nowrap pt-1 min-w-[70px]">{pageRefShort(b.ch, b.section)}</span>
                <p className="text-[21px] leading-[1.45]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <Heading kicker="The Situation Finder">What keeps happening to you?</Heading>
        <p className="sp2-lead mt-5 mb-12 text-[color:var(--sp2-muted)] max-w-[30em]">Pick the one that sounds like you, and see where the book deals with it.</p>
        <SituationPicker />
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
            <Heading kicker="Part VII of the book">Your 21-day reset.</Heading>
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
            Three weeks from now, the same people will push. You just won&apos;t move the way you used to.
          </p>
        </div>
      </Sheet>

      {/* ═══════ PART V: IS IT FOR YOU ═══════ */}
      <div className="bg-[color:var(--sp2-paper)]">
        <PartOpener n="V" title="Is it for you?" />
      </div>
      <Sheet className="pt-16 pb-24">
        <ForYou />
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
              A message arrives and you feel guilty, or rushed, and can&apos;t say why. Paste it in, or upload a screenshot. The app names the tactic and suggests a calm
              reply. Then rehearse the hard conversation and follow the 21-day reset, one day at a time.
            </p>
            <MarginNote className="mt-4">60 days included. After that $9.99 a month, only if you choose to keep it. Nothing is charged automatically.</MarginNote>
          </div>
        </div>
        {/* Three phones fanned out, one per feature (real app screens) */}
        <div className="relative h-[360px] sm:h-[640px] mt-14 max-w-[900px] mx-auto">
          <img src="/v2/img/app-phone-rehearse.webp" alt="Rehearse: practising a hard conversation with an AI that plays your sister" className="absolute left-[2%] sm:left-[10%] top-[50px] w-[42%] sm:w-[30%] -rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" loading="lazy" />
          <img src="/v2/img/app-phone-reset.webp" alt="The 21-day reset: today's drill and progress" className="absolute right-[2%] sm:right-[10%] top-[50px] w-[42%] sm:w-[30%] rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" loading="lazy" />
          <img src="/v2/img/app-phone.webp" alt="The Decoder: a guilt-trip message, what is happening, and a calm reply" className="absolute left-1/2 -translate-x-1/2 top-0 w-[48%] sm:w-[34%] z-10 drop-shadow-[0_40px_40px_rgba(0,0,0,0.4)]" loading="lazy" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center max-w-[900px] mx-auto mt-6">
          {[
            ['Rehearse', 'Practice with an AI that plays the other person.'],
            ['Decode', 'See the tactic and get a calm reply.'],
            ['Reset', 'Your 21 days, one drill at a time.'],
          ].map(([a, b]) => (
            <div key={a}>
              <p className="sp2-display text-[24px] sm:text-[28px]">{a}</p>
              <p className="text-[16px] sm:text-[17px] leading-snug text-[color:var(--sp2-muted)]">{b}</p>
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
            <Heading kicker="Not sure yet?">Read the opening free.</Heading>
            <p className="sp2-lead mt-6 mb-8 text-[color:var(--sp2-muted)]">
              It starts with the conversation you keep replaying at 3 a.m., and what that replay is telling you.
            </p>
            <SubscribeForm />
          </div>
        </div>
      </Sheet>

      {/* ═══════ THE OFFER ═══════ */}
      <Sheet className="pb-24">
        <div className="max-w-4xl mx-auto">
          <Heading kicker="Everything in the box">Here is everything you get.</Heading>
          <div className="mt-10">
            {STACK.map((s) => (
              <div key={s.title} className="sp2-rule flex items-center gap-6 sm:gap-10 py-7">
                <div className="w-[96px] sm:w-[150px] h-[140px] sm:h-[215px] flex items-center justify-center flex-shrink-0">
                  {s.img === null ? (
                    <TypeCover title={s.title.replace(/^Bonus: /, '')} />
                  ) : s.img.endsWith('.webp') ? (
                    <img src={s.img} alt="" className="h-full w-auto drop-shadow-[0_14px_18px_rgba(0,0,0,0.25)]" loading="lazy" />
                  ) : (
                    <img src={s.img} alt="" className="w-full rounded-[2px] shadow-[0_14px_22px_-12px_rgba(0,0,0,0.6)]" loading="lazy" />
                  )}
                </div>
                <div>
                  <p className="sp2-display text-[26px] sm:text-[30px] leading-tight">{s.title}</p>
                  <p className="text-[color:var(--sp2-muted)] mt-1">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="sp2-kicker">About the author</p>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">You won&apos;t find my life story here.</h2>
          <div className="sp2-body mt-8">
            <p>I&apos;m Nate Harlan. I could tell you how I learned all this, and you might enjoy it. It wouldn&apos;t help you on Monday, when your sister calls about the holidays.</p>
            <p>So here is your first lesson instead:</p>
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
            <p>Think of the last time you said no. Did you give one reason, or five? Every extra reason was a door left open, and the other person walked straight through it.</p>
            <p>A long list of my credentials would be the same mistake. This book is about your life, not mine.</p>
          </div>
        </div>
      </Sheet>

      <Night>
        <div className="grid md:grid-cols-[240px_1fr] gap-12 items-center">
          {/* A carved rosette badge; the number sits in its empty centre */}
          <div className="relative mx-auto w-[200px] sm:w-[230px]">
            <img src="/v2/img/guarantee-rosette.png" alt="30-day money-back guarantee" className="w-full" />
            <div className="absolute left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center leading-none">
              <span className="sp2-display text-[56px] sm:text-[64px] text-[#faf6ee]">30</span>
              <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)] mt-1">DAYS</span>
            </div>
          </div>
          <div>
            <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02] text-[#faf6ee]">Read it. Try the reset. Then decide.</h2>
            <p className="sp2-lead mt-6 text-[#e6ddcf] max-w-[34em]">
              If the book isn&apos;t for you, email us within 30 days and you&apos;ll get a full refund. No forms, no hoops, and no guilt trip. That would be a strange way to sell this book.
            </p>
          </div>
        </div>
      </Night>

      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="sp2-display text-[44px] sm:text-[64px] leading-[1.02]">Choose your copy.</h2>
          <p className="sp2-lead mt-5 text-[color:var(--sp2-muted)]">
            Both include the digital edition tonight, The 21-Day Power Reset Journal, three bonuses and 60 days of the companion app.
          </p>
          <MarginNote className="mt-3">Free US shipping on both.</MarginNote>
        </div>
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {[
            { key: 'paperback', title: 'Paperback', tag: 'The one you carry', price: 67, img: '/v2/img/paperback.jpg', points: ['The complete book, all 34 chapters', 'Fits in your bag, made to be underlined', 'Printed to order and shipped to you'], tilt: '-rotate-[0.8deg]' },
            { key: 'hardcover', title: 'Hardcover', tag: 'The one you keep', price: 97, img: '/v2/img/hardcover.jpg', points: ['The same complete book, built to last', 'The copy that stays on your shelf for years', 'Only $30 more than the paperback'], tilt: 'rotate-[0.8deg]' },
          ].map((f) => (
            <div key={f.key} className={`${f.tilt} bg-[#fdfbf6] shadow-[0_30px_50px_-30px_rgba(28,27,24,0.5)]`}>
              <img src={f.img} alt={`Shadow Persuasion: The Hidden Rules of Power, ${f.title.toLowerCase()}`} className="w-full aspect-[3/2] object-cover" loading="lazy" />
              <div className="p-7 sm:p-8">
                <p className="sp2-kicker !mb-1">{f.tag}</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="sp2-display text-[40px]">{f.title}</h3>
                  <span className="sp2-display text-[52px] leading-none">${f.price}</span>
                </div>
                <div className="mt-3">
                  {f.points.map((t) => (
                    <div key={t} className="flex gap-3 py-1.5 items-start">
                      <img src={`${INK}/check.png`} alt="" aria-hidden className="w-6 h-6 flex-shrink-0 mt-1" /> {t}
                    </div>
                  ))}
                </div>
                <BuyButton full className="mt-7" href={f.key === 'hardcover' ? '/v2/checkout?format=hardcover' : '/v2/checkout'} label={`Get the ${f.title.toLowerCase()}, $${f.price}`} />
              </div>
            </div>
          ))}
        </div>
        <p className="sp2-small mt-12 flex items-center justify-center gap-2 text-[color:var(--sp2-muted)]">
          <Lock className="w-4 h-4" /> Secure checkout · Free US shipping · 30-day money-back guarantee
        </p>
      </Sheet>

      <Sheet className="pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="sp2-display text-[40px] sm:text-[56px] leading-[1.05] mb-8">Questions people ask</h2>
          <Faq items={FAQ_ITEMS} />
        </div>
      </Sheet>

      <Sheet className="pb-10">
        <div className="text-center">
          <img src="/v2/img/strings-cut.png" alt="Two hands cutting the strings of a puppet bar" className="w-[240px] sm:w-[300px] mx-auto" loading="lazy" />
          <h2 className="sp2-display text-[44px] sm:text-[72px] lg:text-[88px] leading-[1] mt-4 max-w-[16ch] mx-auto">
            The strings only work while you{' '}
            <span className="relative inline-block italic">
              don&apos;t see them.
              <Mark name="underline" red className="left-0 -bottom-4 w-full h-3" />
            </span>
          </h2>
          <p className="sp2-lead mt-8 text-[color:var(--sp2-muted)]">See them. Answer calmly. Keep being kind, on your own terms.</p>
          <div className="mt-9">
            <BuyButton className="w-full sm:w-auto" />
            <BuyNote />
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-24 sp2-body">
          <p>
            <span className="sp2-display italic text-[28px]">P.S.</span> Nobody has ever looked back on their life and wished they had said yes to more things they
            didn&apos;t want to do. The next time someone pushes, you can answer the way you always have and replay it at 3 a.m. Or you can notice the pattern while it
            is happening, pause, and say one calm sentence. If the book isn&apos;t for you, the 30-day guarantee means it costs you nothing to find out.{' '}
            <Link href="/v2/checkout" className="text-[color:var(--sp2-accent)] underline underline-offset-4">
              Get your copy here.
            </Link>
          </p>
        </div>
      </Sheet>

      <footer className="sp2-small max-w-[1320px] mx-auto px-5 sm:px-10 py-10 text-[color:var(--sp2-muted)] flex flex-wrap gap-4 justify-between sp2-rule">
        <span>&copy; {new Date().getFullYear()} ShadowPersuasion.com</span>
        <span className="flex gap-5">
          <Link href="/privacy" className="underline">Privacy</Link>
          <Link href="/terms" className="underline">Terms</Link>
        </span>
      </footer>

      <StickyBuyBar />
    </main>
  );
}
