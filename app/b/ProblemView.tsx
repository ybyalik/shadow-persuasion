/* eslint-disable @next/next/no-img-element */
/**
 * The one page for one specific problem (ads go straight here). Copy: app/p/data/[slug].ts, type in app/p/problems.ts.
 * Order (agreed with ChatGPT after the 26 Oct page review): hero, the free tool, straight away what the book adds
 * (bridge + page-numbered list), one short book passage, a compact offer and the first buy button. Then, for readers
 * who need more: the moment it happens (timeline), why it keeps happening (loop), new tactic cards, more book pages,
 * who it's for, the full offer, about the book, FAQ, close, and the free-chapter signup last.
 * Extra section copy lives in app/p/sections/[slug].ts. Excerpts must stop before the scene the bridge or P.S. sells.
 */
import { Fragment } from 'react';
import { AboutBook, Footer, OfferBox, GuaranteeNight, Heading, Letter, Night, OrderCards, PsLink, Sheet, StackList } from '../_sales/blocks';
import { Mark, MarginNote } from '../_sales/editorial';
import { ForYou, NiceLoop, StickyBuyBar, TacticRolodex } from '../_sales/interactive';
import { SubscribeForm } from '../_sales/SubscribeForm';
import { BuyButton, BuyNote, Logo } from '../_sales/ui';
import { pageRef, pageRefShort } from '../_sales/pageRef';
import { SamplePage } from './SamplePage';
import type { Block, Problem } from '../p/problems';
import type { ProblemSections } from '../p/sections';

/** `**bold**` and `==highlight==` inside copy. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g);
  return (
    <>
      {parts.map((s, i) =>
        s.startsWith('**') ? <strong key={i}>{s.slice(2, -2)}</strong>
        : s.startsWith('==') ? <span key={i} className="bg-[#ffe066] px-1">{s.slice(2, -2)}</span>
        : <Fragment key={i}>{s}</Fragment>,
      )}
    </>
  );
}

/** `[[words]]` with a highlight, or a red brush underline when `under` is set. */
function Hl({ text, under = false }: { text: string; under?: boolean }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((s, i) =>
        !s.startsWith('[[') ? <Fragment key={i}>{s}</Fragment>
        : under ? (
          <span key={i} className="relative inline-block italic">
            {s.slice(2, -2)}
            <Mark name="underline" red className="left-0 -bottom-3 w-full h-3" />
          </span>
        ) : <mark key={i} className="sp2-hl">{s.slice(2, -2)}</mark>,
      )}
    </>
  );
}

/** A note with `{ref}` swapped for the page reference. */
function RefNote({ text, ch, section }: { text: string; ch: number; section: string }) {
  const [a, b] = text.split('{ref}');
  return <>{a}{b !== undefined && <>{pageRef(ch, section)}{b}</>}</>;
}

function Blocks({ blocks, dark = false }: { blocks: Block[]; dark?: boolean }) {
  const muted = dark ? 'text-[#d8cfc1]' : 'text-[color:var(--sp2-muted)]';
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'p':
            return <p key={i} className="text-[20px] sm:text-[21px] leading-[1.6] mt-5"><Rich text={b.text} /></p>;
          case 'h':
            return <h3 key={i} className="sp2-display text-[30px] sm:text-[38px] leading-[1.1] mt-16"><Rich text={b.text} /></h3>;
          case 'card':
            return (
              <div key={i} className="mt-8 bg-[#fdfbf6] text-[#1c1b18] border border-[#d8cbb5] rounded-[8px] p-6 sm:p-9 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] text-[19px] sm:text-[21px] leading-[1.6]">
                {b.title && <p className="sp2-type text-[13px] tracking-[0.12em] text-[color:var(--sp2-muted)] mb-4 uppercase">{b.title}</p>}
                {b.lines.map((l, j) => <p key={j} className={j ? 'mt-4' : ''}><Rich text={l} /></p>)}
              </div>
            );
          case 'say':
            return (
              <div key={i} className="mt-6 bg-[#f1e7d3] rounded-[12px] px-5 sm:px-7 py-5 space-y-3">
                {b.lines.map((l, j) => (
                  <p key={j} className="text-[20px] sm:text-[22px] leading-[1.45]">
                    {l.label && <span className="sp2-type text-[13px] tracking-[0.12em] uppercase text-[color:var(--sp2-oxblood)] mr-3">{l.label}</span>}
                    <span className="sp2-display italic">&ldquo;{l.text}&rdquo;</span>
                  </p>
                ))}
              </div>
            );
          case 'steps':
            return (
              <ol key={i} className="mt-6">
                {b.items.map((s, j) => (
                  <li key={j} className={`${dark ? 'border-t border-white/15' : 'sp2-rule'} flex gap-5 py-5`}>
                    <span className="sp2-display text-[40px] leading-none text-[color:var(--sp2-accent)] min-w-[30px]">{j + 1}</span>
                    <span><span className="sp2-display block text-[24px] sm:text-[26px] leading-tight"><Rich text={s.title} /></span><span className={`block text-[19px] sm:text-[20px] mt-1 ${muted}`}><Rich text={s.text} /></span></span>
                  </li>
                ))}
              </ol>
            );
          case 'grid':
            return (
              <div key={i} className="mt-6 grid sm:grid-cols-2 gap-x-10">
                {b.items.map((s, j) => (
                  <div key={j} className={`${dark ? 'border-t border-white/15' : 'sp2-rule'} py-5`}><p className="sp2-display text-[24px] leading-tight"><Rich text={s.title} /></p><p className={`text-[19px] mt-1 ${muted}`}><Rich text={s.text} /></p></div>
                ))}
              </div>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc pl-6 mt-5 text-[20px] sm:text-[21px] leading-[1.55] [&>li]:mb-3">
                {b.items.map((s, j) => (
                  <li key={j}><Rich text={s.text} />{s.ref && <span className="text-[color:var(--sp2-oxblood)]"> {pageRef(s.ref.ch, s.ref.section)}</span>}</li>
                ))}
              </ul>
            );
          case 'note':
            return <MarginNote key={i} className="mt-10"><Rich text={b.text} /></MarginNote>;
        }
      })}
    </>
  );
}


export function ProblemView({ p, s }: { p: Problem; s: ProblemSections }) {
  const [psBefore, psAfter] = p.ps.split('{ref}');
  const [proof, ...morePages] = p.excerpts;
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24">
      {/* ═══ FIRST SCREEN: pain, promise, button to the free tool, the book photo ═══ */}
      <section className="relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-grain">
        <div className="bg-[color:var(--sp2-oxblood)] text-white text-center sp2-type text-[11px] sm:text-[15px] tracking-[0.06em] sm:tracking-[0.08em] uppercase px-3 py-2 sm:py-2.5">{p.topBar}</div>
        <header className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6 flex items-center justify-between gap-6">
          <Logo className="text-[color:var(--sp2-gold)]" />
          <a href="#tool" className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-gold)] text-right">{p.topLink} ↓</a>
        </header>
        <div className="relative max-w-[1320px] mx-auto px-5 sm:px-10 pt-5 sm:pt-14 pb-36 sm:pb-44 grid lg:grid-cols-12 gap-x-10 items-center">
          <div className="lg:col-span-8 relative z-10">
            <h1 className="sp2-display font-medium leading-[1.0] tracking-[-0.015em]">
              {p.h1.map((l) => <span key={l} className="block text-[40px] sm:text-[60px] lg:text-[68px] text-[#faf6ee]">{l}</span>)}
              <span className="block italic text-[30px] sm:text-[44px] lg:text-[50px] text-[color:var(--sp2-gold)] mt-5 leading-[1.08]">{p.h1Gold}</span>
            </h1>
            {/* On phones the button comes before the photo, so the free tool is one tap away on the first screen. */}
            <div className="mt-7 flex flex-col gap-3 lg:hidden">
              <a href="#tool" className="sp2-btn sp2-btn-gold self-stretch">{p.cta} ↓</a>
              <span className="sp2-small text-[#d8cfc1]">{p.ctaNote}</span>
            </div>
            <img src="/v2/img/hero-opt-night.webp" alt="" aria-hidden className="lg:hidden w-[80%] mx-auto mt-8" />
            <p className="sp2-lead text-[#e6ddcf] mt-7 max-w-[46ch]">{p.lead}</p>
            <div className="mt-7 hidden lg:flex flex-col gap-3">
              <a href="#tool" className="sp2-btn sp2-btn-gold self-start">{p.cta} ↓</a>
              <span className="sp2-small text-[#d8cfc1]">{p.ctaNote}</span>
            </div>
          </div>
          {/* The book with a phone, glasses and tea, cut out; it drops past the torn edge onto the paper (same as the homepage) */}
          <div className="hidden lg:block lg:col-span-4 relative z-10 lg:-mr-[5vw] lg:translate-y-[70px]">
            <img src="/v2/img/hero-opt-night.webp" alt="The Shadow Persuasion book beside a phone, reading glasses and a cup of tea" className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]" fetchPriority="high" />
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 translate-y-[1px] pointer-events-none">
          <img src="/v2/img/torn-soft.webp" alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />
        </div>
      </section>

      {/* ═══ THE FREE TOOL, complete ═══ */}
      <Sheet id="tool" className="pt-20 sm:pt-28 pb-16 scroll-mt-4">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker={p.tool.kicker}>{p.tool.title}</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[36em]">{p.tool.intro}</p>
          <Blocks blocks={p.tool.blocks} />
        </div>
      </Sheet>

      {/* ═══ STRAIGHT AWAY: WHAT THE BOOK ADDS, ONE PASSAGE, THE FIRST OFFER ═══ */}
      <Sheet className="pt-16 pb-16 !bg-[#efe6d6]">
        <Letter>
          <h2 className="sp2-display text-[34px] sm:text-[46px] leading-[1.08] mb-6">{p.bridge.title}</h2>
          <Blocks blocks={p.bridge.blocks} />
        </Letter>
      </Sheet>
      {/* Page list as cards with a page-number tab (chosen 26 Oct), on a cream band */}
      <Sheet className="pt-16 pb-20">
        <Heading kicker={p.inside.kicker}>{p.inside.title}</Heading>
        <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[36em]">{p.inside.intro}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9 mt-12">
          {p.inside.items.map((b, i) => (
            <div key={i} className="relative bg-white border border-[color:var(--sp2-line)] rounded-[14px] px-6 pt-8 pb-6">
              <span className="absolute -top-3 left-5 bg-[color:var(--sp2-oxblood)] text-white sp2-type text-[13px] tracking-[0.08em] px-2.5 py-1 rounded-[4px]">{pageRefShort(b.ch, b.section)}</span>
              <p className="text-[17px] sm:text-[18px] leading-[1.5]"><Rich text={b.text} /></p>
            </div>
          ))}
        </div>
      </Sheet>
      {proof && (
        <Night edges={false}>
          <div className="grid lg:grid-cols-[minmax(0,330px)_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="sp2-kicker on-dark">A page from the book</p>
              <h2 className="sp2-display text-[40px] sm:text-[48px] leading-[1.05] text-[#faf6ee] mt-2">Read it before you buy it.</h2>
              <p className="sp2-ui text-[16px] leading-relaxed text-[#d8cfc1] mt-4">Word for word from the book. The rest of this part is in the book.</p>
            </div>
            <SamplePage ex={proof} />
          </div>
        </Night>
      )}
      <Sheet className="pt-20 pb-24">
        <div className="text-center max-w-[860px] mx-auto mb-16">
          <img src="/v2/icons/book.png" alt="" aria-hidden className="w-10 mx-auto opacity-70" />
          <p className="sp2-display italic text-[32px] sm:text-[42px] leading-[1.2] mt-5">&ldquo;{p.pull}&rdquo;</p>
        </div>
        <OfferBox note={`${p.startHere} This is one topic of many. The same book covers work, pay, clients, partners, exes and family, in 34 chapters.`} />
      </Sheet>

      {/* ═══ FOR READERS WHO WANT MORE: WHY IT REPEATS ═══ */}
      <Sheet className="pt-20 pb-24 !bg-[#efe6d6]">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <NiceLoop steps={s.loop.steps} center={s.loop.center} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
            <Heading kicker={s.loop.kicker}>{s.loop.title}</Heading>
            <div className="sp2-body mt-8 max-w-[32em]">
              {s.loop.body.map((t, i) => <p key={i}><Rich text={t} /></p>)}
            </div>
          </div>
        </div>
      </Sheet>

      {/* ═══ MORE FROM THE BOOK: NEW MOVES, MORE PAGES ═══ */}
      <Sheet className="pt-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-7">
            <Heading kicker={s.tactics.kicker}>{s.tactics.title}</Heading>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-16">
            <p className="sp2-lead text-[color:var(--sp2-muted)]">{s.tactics.lead}</p>
            <MarginNote className="mt-3">Tap any card for the calm reply.</MarginNote>
          </div>
        </div>
        <div className="mt-14">
          <TacticRolodex tactics={s.tactics.items} art={s.tactics.items.map((t) => t.art)} more={{ title: '43 pressure moves in all.', text: 'The Tactic Spotter bonus lists every one: what it sounds like, when it is a pattern, and one calm reply.' }} />
        </div>
      </Sheet>
      {morePages.length > 0 && (
        <Sheet className="pb-24">
          <div className="max-w-[860px] mx-auto">
            <Heading kicker="Real pages from the book">Read more before you buy it.</Heading>
            <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">Word for word, from the chapters on this exact situation.</p>
            <div className="mt-12 space-y-12">
              {morePages.map((ex, i) => <SamplePage key={i} ex={ex} i={i + 1} />)}
            </div>
          </div>
        </Sheet>
      )}
      <Sheet className="pb-28">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-center">
          <div className="lg:col-span-6 lg:-ml-[max(40px,calc((100vw-1320px)/2+40px))]">
            <img src="/v2/lino/calm.jpg" alt="A woman by a window in the morning, calm" className="w-full sp2-soft" loading="lazy" />
          </div>
          <p className="lg:col-span-5 lg:col-start-8 sp2-display italic text-[34px] sm:text-[46px] leading-[1.15]">{s.reset.closeLine}</p>
        </div>
      </Sheet>

      {/* ═══ IS IT FOR YOU ═══ */}
      <Sheet className="pt-20 pb-24 !bg-[#efe6d6]">
        <ForYou strike={false} lines={s.forYou.lines.map(([icon, t]) => [icon, <Hl key={t} text={t} />])} notFor={[]} />
      </Sheet>
      <Sheet className="pb-28">
        <Heading kicker={s.alternatives.kicker}>{s.alternatives.title}</Heading>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 mt-12">
          <div>
            {s.alternatives.items.map(([t, d]) => (
              <div key={t} className="sp2-rule py-5">
                <p className="font-semibold text-[color:var(--sp2-muted)]"><span className="text-[color:var(--sp2-oxblood)] mr-2" aria-hidden>&#10005;</span>{t}</p>
                <p className="text-[color:var(--sp2-muted)] mt-1">{d}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[14px] border border-[color:var(--sp2-line)] p-6 sm:p-8">
            <p className="sp2-display text-[34px] leading-[1.1] mb-2">Shadow Persuasion:<br />The Hidden Rules of Power</p>
            {s.alternatives.included.map((t) => (
              <div key={t} className="sp2-rule flex gap-4 py-4 items-start">
                <img src="/v2/ink/check.png" alt="" aria-hidden className="w-7 h-7 flex-shrink-0 mt-0.5" />
                <span>{t}</span>
              </div>
            ))}
            <div className="mt-8">
              <BuyButton full />
            </div>
          </div>
        </div>
      </Sheet>

      {/* ═══ THE FULL OFFER ═══ */}
      <Sheet className="pt-20 pb-10">
        <div className="max-w-3xl mx-auto text-center"><h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">{p.offerTitle}</h2></div>
      </Sheet>
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <Sheet className="pb-24">
        <AboutBook />
      </Sheet>
      <GuaranteeNight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>

      {/* ═══ THIS PROBLEM'S QUESTIONS ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="Questions">Before you order.</Heading>
          <div className="mt-10">
            {p.faq.map((f, i) => (
              <details key={i} className="sp2-rule py-6 group" open={i < 2}>
                <summary className="sp2-display text-[24px] sm:text-[28px] leading-tight cursor-pointer list-none flex justify-between gap-6"><span><Rich text={f.q} /></span><span className="text-[color:var(--sp2-accent)] group-open:rotate-45 transition">+</span></summary>
                <p className="text-[19px] sm:text-[20px] leading-[1.6] text-[color:var(--sp2-muted)] mt-4"><Rich text={f.a} /></p>
              </details>
            ))}
          </div>
        </div>
      </Sheet>

      {/* ═══ CLOSE ═══ */}
      <Sheet className="pb-16">
        <div className="text-center">
          <h2 className="sp2-display text-[40px] sm:text-[64px] leading-[1.02] max-w-[18ch] mx-auto">{p.closeLine}</h2>
          <div className="mt-9"><BuyButton className="w-full sm:w-auto" /><BuyNote /></div>
        </div>
        <div className="max-w-3xl mx-auto mt-20 sp2-body">
          <p><span className="sp2-display italic text-[28px]">P.S.</span> {psBefore}{pageRef(p.psRef.ch, p.psRef.section)}{psAfter}</p>
          <p><span className="sp2-display italic text-[28px]">P.P.S.</span> If the book isn&apos;t for you, email us within 30 days of delivery and send the book back for a full refund. <PsLink /></p>
        </div>
      </Sheet>

      {/* ═══ LAST: THE FREE CHAPTER, FOR READERS NOT READY TO BUY ═══ */}
      <Sheet id="free-chapter" className="pb-16 scroll-mt-6">
        <div className="max-w-3xl mx-auto sp2-rule pt-12">
          <p className="sp2-kicker">Not ready yet?</p>
          <p className="sp2-display text-[30px] sm:text-[38px] leading-[1.1]">{s.freeChapter.title}</p>
          <p className="text-[color:var(--sp2-muted)] mt-3 mb-6">{s.freeChapter.lead}</p>
          <SubscribeForm />
        </div>
        <div className="max-w-3xl mx-auto mt-14 space-y-3">
          {p.limits.map((l, i) => <p key={i} className="sp2-small text-[color:var(--sp2-muted)]"><Rich text={l} /></p>)}
        </div>
      </Sheet>
      <Footer />
      <StickyBuyBar />
    </main>
  );
}
