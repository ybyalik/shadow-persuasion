/* eslint-disable @next/next/no-img-element */
/**
 * Test version v6: v3's copy ("The exact words") in a warm, light design.
 * Tests whether a lighter, warmer look (cream hero, a hopeful "after" illustration, terracotta
 * instead of oxblood, fewer dark bands) works better for women 35-60+ than the dark /v3.
 *
 * Original v3 notes:
 * Angle from the audience research: readers already know they should say no; what every other
 * book leaves out is the exact words for their mother, sister, partner and boss, and what to do
 * when those people push back. Problem-solution lead (Great Leads), one technique given away
 * early (Halbert), named cause of the problem and of the fix (Georgi), page-numbered bullets.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { MarginNote, Notebook, TornEdge } from '../v2/_components/editorial';
import {
  ForYou,
  GoodPersonContract,
  InterceptedMessage,
  NiceLoop,
  ResetPath,
  ScenarioTabs,
  StickyBuyBar,
  TacticRolodex,
  WayOut,
} from '../v2/_components/interactive';
import {
  Close,
  DoesntNeed,
  Fascinations,
  FaqSection,
  Footer,
  Heading,
  InlineBuy,
  Letter,
  LetterHead,
  OrderCards,
  PsLink,
  PullLine,
  Sheet,
  Signature,
  StackList,
  WhyThePrice,
} from '../v2/_components/blocks';
import { NateStoryShort } from '../v2/_components/story';
import { DOESNT_NEED, FASCINATIONS } from '../v2/_components/copy';
import { pageRef } from '../v2/_components/pageRef';

export const metadata: Metadata = {
  title: 'The Exact Words for the People Who Push You Hardest | Shadow Persuasion: The Hidden Rules of Power',
  robots: { index: false, follow: false },
};

export default function V6() {
  return (
    <main className="sp2-warm bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      <LightHero />

      {/* ═══ The moment ═══ */}
      <Sheet className="pt-24 sm:pt-32 pb-10">
        <LetterHead kicker="You know the moment">&ldquo;Sure, no problem.&rdquo;</LetterHead>
        <Letter>
          <p>Someone asks. You feel the no rise in your chest. Then something else takes over, and you hear your own voice say it: &ldquo;Sure, no problem.&rdquo;</p>
          <p>Later the replay starts. In the car. In the shower. At three in the morning, when you finally find the perfect answer, twelve hours too late.</p>
          <p>If that is you, I want to say something you may not have heard before.</p>
          <p>You don&apos;t need more confidence. You don&apos;t need to care less. And you certainly don&apos;t need another book that tells you to &ldquo;just say no.&rdquo;</p>
          <p>You have known you should say no for twenty years. Knowing was never the problem. The problem is that in the moment, with your mother on the phone or your boss standing at your desk, <strong>the words don&apos;t come.</strong></p>
          <p>This book gives you the words. Short ones. Calm ones. Kind ones. For the exact people who push you hardest. And then it trains you, one small practice a day, until they come out on their own.</p>
          <p>But first, be honest with yourself for a minute.</p>
        </Letter>
      </Sheet>
      <Notebook />

      {/* ═══ Why it keeps happening (the cause, named) ═══ */}
      <Sheet className="pt-10 pb-24">
        <LetterHead kicker="Why it keeps happening">It isn&apos;t because you&apos;re weak.</LetterHead>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-start">
          <div className="lg:col-span-6">
            <Letter className="!mx-0">
              <p>Somewhere along the way, you picked up a set of rules nobody ever showed you. You never signed them. They still run the show.</p>
              <p>Other people&apos;s feelings are your job. Your needs are a burden. Conflict means something went wrong. If you&apos;re good enough, you&apos;ll be treated fairly.</p>
              <p>They were put together from many small moments over many years. They kept the peace. They still run most of your conversations.</p>
              <p>
                And the people around you have learned, mostly without thinking about it, exactly which clause to press. A sigh. A compliment right before the request. A deadline from
                nowhere. A silence that lasts until you apologize.
              </p>
              <p>Every time it works, they learn. The guilt trip that got a yes in March becomes the guilt trip in April.</p>
            </Letter>
          </div>
          <div className="lg:col-span-6 lg:pt-6">
            <GoodPersonContract />
            <MarginNote className="mt-6 lg:ml-10">The Good Person Contract, {pageRef(3, 'The five clauses')}.</MarginNote>
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center mt-20">
          <div className="lg:col-span-5">
            <NiceLoop />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Letter className="!mx-0">
              <p>
                <strong>Here is the part nobody tells you.</strong> The loop doesn&apos;t stop when you understand it. You can know exactly why you say yes and still say yes.
              </p>
              <p>It stops when the pressure stops working. And the pressure stops working the moment you have a calm answer ready, and say it before the guilt kicks in.</p>
              <p>That is a skill, not a personality. Which means you can learn it.</p>
            </Letter>
          </div>
        </div>
      </Sheet>

      {/* ═══ One technique, given away ═══ */}
      <section className="relative bg-[#efe2d3] sp2-grain">
        <div className="absolute top-0 inset-x-0">
          <TornEdge fill="var(--sp2-paper)" flip />
        </div>
        <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-24 sm:py-32">
        <Heading kicker="Try this one tonight">
          The three-part answer to &ldquo;after everything I&apos;ve done.&rdquo;
        </Heading>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 mt-12">
          <div className="lg:col-span-5 text-[20px] sm:text-[22px] leading-[1.6] space-y-5">
            <p>
              <span className="text-[color:var(--sp2-accent)] sp2-display text-[28px]">1. Honor the true part.</span>
              <br />
              They probably have done a lot for you. Say so, and mean it.
            </p>
            <p>
              <span className="text-[color:var(--sp2-accent)] sp2-display text-[28px]">2. Separate it from today.</span>
              <br />
              One short sentence: the past was kind, and this request is still a no.
            </p>
            <p>
              <span className="text-[color:var(--sp2-accent)] sp2-display text-[28px]">3. Don&apos;t keep score back.</span>
              <br />
              Don&apos;t list what you&apos;ve done for them. Say it once, then stop talking.
            </p>
            <p className="sp2-small text-[color:var(--sp2-muted)]">That&apos;s The ledger, from Chapter 7, in one breath. Watch it work on a real message:</p>
          </div>
          <div className="lg:col-span-7">
            <InterceptedMessage />
          </div>
        </div>
        </div>
        <div className="absolute bottom-0 inset-x-0">
          <TornEdge fill="var(--sp2-paper)" />
        </div>
      </section>

      {/* ═══ The exact words, for the people who matter ═══ */}
      <Sheet className="pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-7">
            <Heading kicker="Real words for real people">Your mother. Your sister. Your boss. Not a store clerk.</Heading>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-16">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">Most assertiveness books practice on waiters and salesmen. This one is built for the people you love and can&apos;t avoid, with the patterns from Part II of the book.</p>
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

      {/* ═══ The part other books leave out ═══ */}
      <Sheet className="pb-24">
        <LetterHead kicker="The part other books leave out">And when they push back?</LetterHead>
        <Letter>
          <p>Here is what nobody warns you about.</p>
          <p>The first time you hold a calm no, the people who did well out of the old you will test it. They will sigh. They will go quiet. Someone will bring it up at dinner, in front of everyone, so that saying no makes you the bad guy.</p>
          <p>And sooner or later, someone will say it: <em>&ldquo;You&apos;ve changed.&rdquo;</em></p>
          <p>Many people cave right here. Not because the no was wrong, but because nobody prepared them for this part.</p>
          <p>This book does. You get the words for the push-back, too: the second ask, the sulk, the call to a sibling, the &ldquo;I guess I&apos;m just a terrible parent.&rdquo; And for &ldquo;you&apos;ve changed,&rdquo; you get an answer that is four words long. It&apos;s in {pageRef(29, '"You\'ve changed"')}.</p>
        </Letter>
        <PullLine>The people who benefit from the old you will adjust, or they won&apos;t. The people who love you will usually be glad.</PullLine>
        <InlineBuy line="Ready to have the words when it counts?" />
      </Sheet>

      {/* ═══ Who this is from ═══ */}
      <Sheet className="pb-24">
        <LetterHead kicker="Who is writing this">My mother kept a notebook of everything she never said.</LetterHead>
        <NateStoryShort />
        <Signature />
      </Sheet>

      {/* ═══ The method ═══ */}
      <Sheet className="pb-16">
        <Heading kicker="How the words become yours">Notice. Pause. Hold.</Heading>
        <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">
          Reading the right sentence once won&apos;t make it come out under pressure. Practice will. The reset trains one step a week, low-stakes moments first, so the new answer is
          already familiar when your mother calls.
        </p>
        <div className="mt-16">
          <WayOut />
        </div>
        <div className="mt-24">
          <ResetPath />
        </div>
      </Sheet>
      <Sheet className="pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-7 lg:-ml-[max(40px,calc((100vw-1320px)/2+40px))]">
            <img src="/v2/lino/warm-garden.jpg" alt="A woman reading on a garden bench in the sun, a cup of tea beside her" className="w-full sp2-soft" loading="lazy" />
          </div>
          <p className="lg:col-span-5 sp2-display italic text-[34px] sm:text-[44px] leading-[1.15]">
            Three weeks from now, the same people will ask. You just won&apos;t move the way you used to.
          </p>
        </div>
      </Sheet>

      {/* ═══ Bullets ═══ */}
      <Sheet className="pt-10 pb-24">
        <LetterHead kicker="Open it to the page you need">Here is some of what you&apos;ll find inside.</LetterHead>
        <Fascinations items={FASCINATIONS} />
      </Sheet>

      <Sheet className="pb-24">
        <LetterHead kicker="What it doesn't take">You don&apos;t have to become someone else.</LetterHead>
        <DoesntNeed items={DOESNT_NEED} />
      </Sheet>

      <Sheet className="pt-6 pb-24">
        <ForYou />
      </Sheet>

      {/* ═══ The offer ═══ */}
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <Sheet className="pb-24">
        <WhyThePrice />
      </Sheet>
      <GuaranteeLight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>
      <Sheet className="pb-24">
        <FaqSection />
      </Sheet>
      <Sheet className="pb-10">
        <Close
          ps={
            <>
              <p>
                <span className="sp2-display italic text-[28px]">P.S.</span> The next time your sister brings up the &ldquo;loan&rdquo; at the dinner table, you will know exactly
                what to say. It&apos;s in {pageRef(10, 'Two short examples')}, and it&apos;s two sentences long.
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


/* ───────────── Light hero: cream paper, warm "after" picture, the subtitle as the promise ───────────── */

function LightHero() {
  return (
    <section className="relative bg-[#efe2d3] sp2-grain">
      <header className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6 flex items-center justify-between">
        <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-accent)]">SHADOW PERSUASION</span>
        <Link href="/v2/checkout" className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-accent)]">
          Get the book
        </Link>
      </header>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-10 sm:pt-14 pb-28 sm:pb-36 grid lg:grid-cols-12 gap-x-10 gap-y-10 items-center">
        <div className="lg:col-span-6 relative z-10">
          <p className="sp2-type text-[16px] sm:text-[18px] tracking-[0.06em] text-[color:var(--sp2-accent)] mb-5">Stop being pushed around. Stay kind.</p>
          <h1 className="sp2-display font-medium tracking-[-0.015em]">
            <span className="block text-[36px] sm:text-[52px] lg:text-[58px] leading-[1.05]">Your mother calls you selfish.</span>
            <span className="block text-[36px] sm:text-[52px] lg:text-[58px] leading-[1.05] mt-2">Your sister wants another &ldquo;loan.&rdquo;</span>
            <span className="block italic text-[48px] sm:text-[76px] lg:text-[88px] text-[color:var(--sp2-accent)] mt-4 leading-[0.98]">Here&apos;s exactly what to say.</span>
          </h1>
          <p className="sp2-lead mt-8 max-w-[32ch] text-[color:var(--sp2-muted)]">
            Calm, kind words for the people who push you hardest, and a 21-day reset that makes them come out when it counts. <em>Not another book that tells you to &ldquo;just say no.&rdquo;</em>
          </p>
          <div className="mt-9 flex flex-col gap-4">
            <Link href="/v2/checkout" className="sp2-btn sp2-btn-warm self-stretch sm:self-start">
              Get the paperback, $67
            </Link>
            <span className="sp2-small text-[color:var(--sp2-muted)]">Free US shipping · Digital copy tonight · 30-day guarantee</span>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <img src="/v2/lino/warm-tea-hero.jpg" alt="A woman relaxed at her kitchen table with a cup of tea, calmly ignoring her buzzing phone" className="w-full sp2-soft" fetchPriority="high" />
          {/* The book itself, tucked into the corner of the picture */}
          <img
            src="/v2/img/hero-cutout.webp"
            alt="The Shadow Persuasion book with The 21-Day Power Reset Journal"
            className="absolute -bottom-10 sm:-bottom-14 -left-2 sm:-left-8 w-[50%] sm:w-[46%] drop-shadow-[0_24px_24px_rgba(60,30,15,0.35)]"
          />
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 translate-y-[1px] pointer-events-none">
        <img src="/v2/img/torn-soft.webp" alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />
      </div>
    </section>
  );
}

/* ───────────── Light guarantee: the carved rosette in ink on paper ───────────── */

function GuaranteeLight() {
  return (
    <Sheet className="py-24">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[240px_1fr] gap-12 items-center border-y-2 border-[color:var(--sp2-ink)] py-14">
        <div className="relative mx-auto w-[180px] sm:w-[210px]">
          <img src="/v2/icons/rosette.png" alt="30-day money-back guarantee" className="w-full" />
          <div className="absolute left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center leading-none">
            <span className="sp2-display text-[52px] sm:text-[60px]">30</span>
            <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-accent)] mt-1">DAYS</span>
          </div>
        </div>
        <div>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">Read it. Try the reset. Then decide.</h2>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">
            If the book isn&apos;t for you, email us within 30 days and you&apos;ll get a full refund. No forms, no hoops, and no guilt trip. That would be a strange way to sell this book.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
