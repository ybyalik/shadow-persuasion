/* eslint-disable @next/next/no-img-element */
/**
 * The one page for one specific problem (ads go straight here). Copy: app/p/data/[slug].ts, type in app/p/problems.ts.
 * Every section is about this problem. Only the offer, guarantee, order cards and footer are shared with /v2.
 */
import { Fragment } from 'react';
import { Footer, GuaranteeNight, Heading, Letter, Night, OrderCards, PsLink, PullLine, Sheet, StackList } from '../v2/_components/blocks';
import { MarginNote } from '../v2/_components/editorial';
import { StickyBuyBar } from '../v2/_components/interactive';
import { BuyButton, BuyNote } from '../v2/_components/ui';
import { pageRef, pageRefShort } from '../v2/_components/pageRef';
import { SamplePage } from '../a/AngleView';
import type { Block, Problem } from '../p/problems';

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
              <div key={i} className="mt-6 border-l-4 border-[color:var(--sp2-accent)] pl-5 sm:pl-6 space-y-3">
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


export function ProblemView({ p }: { p: Problem }) {
  const [psBefore, psAfter] = p.ps.split('{ref}');
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      {/* ═══ FIRST SCREEN: pain, promise, bullets, jump to the free tool ═══ */}
      <section className="relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-grain">
        <div className="bg-[color:var(--sp2-oxblood)] text-white text-center sp2-type text-[13px] sm:text-[15px] tracking-[0.08em] uppercase px-4 py-2.5">{p.topBar}</div>
        <header className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6 flex items-center justify-between">
          <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)]">SHADOW PERSUASION</span>
          <a href="#tool" className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-gold)]">Skip to the free part</a>
        </header>
        <div className="relative max-w-[1320px] mx-auto px-5 sm:px-10 pt-8 sm:pt-14 pb-28 sm:pb-36 grid lg:grid-cols-12 gap-x-10 items-center">
          <div className="lg:col-span-7 relative z-10">
            <h1 className="sp2-display font-medium leading-[1.0] tracking-[-0.015em]">
              {p.h1.map((l) => <span key={l} className="block text-[40px] sm:text-[60px] lg:text-[68px] text-[#faf6ee]">{l}</span>)}
              <span className="block italic text-[30px] sm:text-[44px] lg:text-[50px] text-[color:var(--sp2-gold)] mt-5 leading-[1.08]">{p.h1Gold}</span>
            </h1>
            <p className="sp2-lead text-[#e6ddcf] mt-7 max-w-[36ch]">{p.lead}</p>
            <div className="mt-7 flex flex-col gap-3">
              <a href="#tool" className="sp2-btn sp2-btn-gold self-stretch sm:self-start">{p.cta} ↓</a>
              <span className="sp2-small text-[#d8cfc1]">{p.ctaNote}</span>
            </div>
            <ul className="mt-9 space-y-3 max-w-[40ch]">
              {p.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-[18px] sm:text-[20px] leading-[1.4] text-[#efe7da]"><span className="text-[color:var(--sp2-gold)] mt-0.5">✓</span><span><Rich text={b} /></span></li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block lg:col-span-5 relative z-10">
            <div className="bg-[#fdfbf6] text-[#1c1b18] rounded-[6px] shadow-[0_40px_60px_rgba(0,0,0,0.5)] p-7 rotate-[2deg] text-[17px] leading-[1.55]">
              <p className="sp2-type text-[13px] tracking-[0.12em] text-[color:var(--sp2-muted)] mb-3 uppercase">{p.teaser.label}</p>
              {p.teaser.lines.map((l, i) => <p key={i} className={i ? 'mt-3' : ''}><Rich text={l} /></p>)}
              {p.teaser.note && <p className="mt-4 text-[#d0211c] text-[24px] italic -rotate-[2deg] sp2-display">{p.teaser.note}</p>}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 translate-y-[1px] pointer-events-none">
          <img src="/v2/img/torn-soft.webp" alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />
        </div>
      </section>

      {/* ═══ THE FREE TOOL ═══ */}
      <Sheet id="tool" className="pt-20 sm:pt-28 pb-20 scroll-mt-4">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker={p.tool.kicker}>{p.tool.title}</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[36em]">{p.tool.intro}</p>
          <Blocks blocks={p.tool.blocks} />
        </div>
      </Sheet>

      {/* ═══ WHY IT KEEPS HAPPENING ═══ */}
      <Night>
        <div className="max-w-[860px] mx-auto">
          <Heading kicker={p.why.kicker} dark>{p.why.title}</Heading>
          <p className="sp2-lead mt-6 text-[#e6ddcf] max-w-[36em]">{p.why.intro}</p>
          <div className="mt-10">
            {p.why.items.map((it) => (
              <div key={it.title} className="border-t border-white/15 py-5"><p className="sp2-display text-[26px] text-[#faf6ee]">{it.title}</p><p className="text-[19px] text-[#d8cfc1] mt-1"><Rich text={it.text} /></p></div>
            ))}
          </div>
        </div>
      </Night>


      {/* ═══ WHAT THE FREE PART CAN'T DO → WHAT THE BOOK ADDS FOR THIS PROBLEM ═══ */}
      <Sheet className="pt-24 pb-16">
        <Letter>
          <h2 className="sp2-display text-[34px] sm:text-[46px] leading-[1.08] mb-6">{p.bridge.title}</h2>
          <Blocks blocks={p.bridge.blocks} />
        </Letter>
        <PullLine>{p.pull}</PullLine>
      </Sheet>

      <Sheet className="pb-24">
        <div className="max-w-[900px] mx-auto">
          <Heading kicker={p.inside.kicker}>{p.inside.title}</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[36em]">{p.inside.intro}</p>
          <div className="mt-10">
            {p.inside.items.map((b, i) => (
              <div key={i} className="sp2-rule flex gap-6 py-6">
                <span className="sp2-type text-[18px] sm:text-[20px] text-[color:var(--sp2-oxblood)] whitespace-nowrap pt-1 min-w-[64px]">{pageRefShort(b.ch, b.section)}</span>
                <p className="text-[20px] sm:text-[21px] leading-[1.5]"><Rich text={b.text} /></p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <BuyButton className="w-full sm:w-auto" />
            <BuyNote />
          </div>
        </div>
      </Sheet>

      {/* ═══ REAL PAGES FROM THE BOOK, ABOUT THIS PROBLEM ═══ */}
      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="Real pages from the book">Read it before you buy it.</Heading>
          <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)] max-w-[34em]">Word for word, from the chapters on this exact situation.</p>
          <div className="mt-12 space-y-12">
            {p.excerpts.map((ex, i) => <SamplePage key={i} ex={ex} i={i} />)}
          </div>
        </div>
      </Sheet>

      {/* ═══ WHO IT'S FOR ═══ */}
      <Night>
        <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <p className="sp2-kicker on-dark">This is for you if</p>
            <ul className="mt-6 space-y-4">{p.forYou.map((t, i) => <li key={i} className="flex gap-3 text-[19px] sm:text-[20px] text-[#efe7da]"><span className="text-[color:var(--sp2-gold)]">✓</span><span><Rich text={t} /></span></li>)}</ul>
          </div>
          <div>
            <p className="sp2-kicker on-dark">It&apos;s not for you if</p>
            <ul className="mt-6 space-y-4">{p.notForYou.map((t, i) => <li key={i} className="flex gap-3 text-[19px] sm:text-[20px] text-[#d8cfc1]"><span className="text-[#ff5a4f]">✕</span><span><Rich text={t} /></span></li>)}</ul>
          </div>
        </div>
      </Night>

      {/* ═══ THE OFFER (shared) ═══ */}
      <Sheet className="pt-24 pb-10">
        <div className="max-w-3xl mx-auto text-center"><h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">{p.offerTitle}</h2></div>
      </Sheet>
      <Sheet className="pb-24">
        <StackList />
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
          <p><span className="sp2-display italic text-[28px]">P.P.S.</span> If the book isn&apos;t for you, email us within 30 days for a full refund. It costs you nothing to find out. <PsLink /></p>
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
