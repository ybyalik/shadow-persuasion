/**
 * Angle landing pages for the first Meta ad test: /a/parent, /a/work, /a/favor, /a/ex.
 * Copy and excerpts live in app/a/angles.ts. Each page has its own hero, opening scene,
 * "start here" reading route and sample pages, then the same lower page as /v2
 * (product, bonuses, guarantee, price, FAQ, order cards). Hidden from search engines.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero, MarginNote } from '../../v2/_components/editorial';
import { StickyBuyBar } from '../../v2/_components/interactive';
import {
  Close,
  FaqSection,
  Footer,
  GuaranteeNight,
  Heading,
  InlineBuy,
  Letter,
  LetterHead,
  OrderCards,
  PsLink,
  Sheet,
  StackList,
  WhyThePrice,
} from '../../v2/_components/blocks';
import { pageRef } from '../../v2/_components/pageRef';
import { ANGLES, getAngle, type Excerpt } from '../angles';

export const dynamicParams = false;

export function generateStaticParams() {
  return ANGLES.map((a) => ({ angle: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ angle: string }> }): Promise<Metadata> {
  const { angle } = await params;
  const a = getAngle(angle);
  return {
    title: a?.metaTitle ?? 'Shadow Persuasion: The Hidden Rules of Power',
    robots: { index: false, follow: false },
  };
}

/** One sample page from the book, set like a printed page. */
function SamplePage({ ex, i }: { ex: Excerpt; i: number }) {
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

export default async function AnglePage({ params }: { params: Promise<{ angle: string }> }) {
  const { angle } = await params;
  const a = getAngle(angle);
  if (!a) notFound();
  const [psBefore, psAfter] = a.ps.split('{ref}');

  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
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

      {/* ═══ The opening scene ═══ */}
      <Sheet className="pt-24 sm:pt-32 pb-16">
        <LetterHead kicker={a.openingKicker}>{a.openingHead}</LetterHead>
        <Letter>
          {a.opening.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </Letter>
      </Sheet>

      {/* ═══ Start here: the reading route ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="If this is your situation">Start here.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">{a.routeIntro}</p>
          <ol className="mt-10">
            {a.route.map((r, i) => (
              <li key={`${r.ch}:${r.section}`} className="sp2-rule flex gap-5 sm:gap-7 py-6">
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

      {/* ═══ Sample pages ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="Sample pages">Read it before you buy it.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">Three short passages from the book, word for word.</p>
          <div className="mt-12 space-y-12">
            {a.excerpts.map((ex, i) => (
              <SamplePage key={`${ex.ch}:${ex.sub ?? ex.section}`} ex={ex} i={i} />
            ))}
          </div>
        </div>
      </Sheet>

      {/* ═══ What it won't promise ═══ */}
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
      <Sheet className="pb-24">
        <InlineBuy line={a.buyLine} />
      </Sheet>

      {/* ═══ The same lower page as /v2 ═══ */}
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <Sheet className="pb-24">
        <WhyThePrice />
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
