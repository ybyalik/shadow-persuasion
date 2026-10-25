'use client';

/* eslint-disable @next/next/no-img-element */
/**
 * Editorial building blocks for the sales page (from the approved design sample).
 * The page reads like an annotated book, not stacked web blocks: one continuous
 * sheet of paper, prints that break the grid, margin notes, hand-made ink marks
 * (public/v2/ink), and torn edges where the paper meets a dark section.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { pageRef } from './pageRef';

const INK = '/v2/ink';
const LINO = '/v2/lino';

/* A torn paper edge, drawn once as an SVG path with an irregular top. */
export function TornEdge({ fill = 'var(--sp2-paper)', flip = false, className = '' }: { fill?: string; flip?: boolean; className?: string }) {
  // Pre-computed jagged points so the edge looks the same on every load.
  const pts = [0, 22, 9, 31, 17, 24, 26, 36, 35, 27, 44, 33, 52, 22, 61, 30, 70, 21, 79, 34, 88, 25, 97, 31, 106, 19, 115, 28, 124, 23, 133, 35, 142, 26, 151, 32, 160, 20, 169, 29, 178, 24, 187, 34, 196, 25, 200, 28];
  let d = 'M0,40 ';
  for (let i = 0; i < pts.length; i += 2) d += `L${pts[i] * 5},${pts[i + 1]} `;
  d += 'L1000,40 Z';
  return (
    <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className={`block w-full h-[22px] sm:h-[34px] ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden>
      <path d={d} fill={fill} />
    </svg>
  );
}

/* A brush mark from public/v2/ink, placed absolutely over text. */
export function Mark({ name, className = '', red = false }: { name: string; className?: string; red?: boolean }) {
  return <img src={`${INK}/${name}${red ? '-red' : ''}.png`} alt="" aria-hidden className={`pointer-events-none select-none absolute ${className}`} />;
}

/* Margin note in the typewriter face, used beside the main column. */
export function MarginNote({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`sp2-note ${className}`}>{children}</p>;
}

/* ───────────────────────── I. Hero ───────────────────────── */

type HeroProps = {
  /** Small line above the headline (optional). */
  pre?: string;
  /** Replaces the default two-line headline. */
  title?: React.ReactNode;
  lead?: React.ReactNode;
  img?: string;
  imgAlt?: string;
  href?: string;
};

export function Hero({
  pre,
  title,
  lead = 'See the hidden rules that decide who gets their way, answer unfair pressure calmly, and ask for what you want in the open. With a 21-day reset that makes the new answer a habit.',
  img = '/v2/img/hero-opt-night.webp',
  imgAlt = 'The Shadow Persuasion book beside a phone showing 3:07, reading glasses and a cup of tea',
  // NOTE: hero images still show the previous edition's cover (see book-v3/launch-checklist.md).
  href = '/v2/checkout',
}: HeroProps = {}) {
  return (
    <section className="relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-grain">
      <header className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6 flex items-center justify-between">
        <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)]">SHADOW PERSUASION</span>
        <Link href={href} className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-gold)]">
          Get the book
        </Link>
      </header>

      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-24 sm:pb-32 grid lg:grid-cols-12 gap-x-8 items-center">
        <div className="lg:col-span-6 relative z-10">
          {pre && <p className="sp2-type text-[16px] sm:text-[18px] tracking-[0.06em] text-[color:var(--sp2-gold)] mb-5">{pre}</p>}
          <h1 className="sp2-display font-medium leading-[0.98] tracking-[-0.015em]">
            {title ?? (
              <>
                <span className="block text-[44px] sm:text-[68px] lg:text-[80px] text-[#faf6ee]">You were raised to be nice.</span>
                <span className="block italic text-[58px] sm:text-[100px] lg:text-[124px] text-[color:var(--sp2-gold)] mt-2">Some people noticed.</span>
              </>
            )}
          </h1>

          <img src={img} alt="" aria-hidden className="lg:hidden w-full mt-8" />

          <div className="sp2-lead text-[#e6ddcf] mt-8 sm:mt-10 max-w-[32ch]">{lead}</div>
          <div className="mt-9 flex flex-col gap-4">
            <Link href={href} className="sp2-btn sp2-btn-gold self-stretch sm:self-start">
              Get the paperback, $67
            </Link>
            <span className="sp2-small text-[#d8cfc1]">Free US shipping · Digital copy tonight · 30-day guarantee</span>
          </div>
        </div>

        {/* The books, cut out so they sit on the page; they drop past the torn edge onto the paper */}
        <div className="hidden lg:block lg:col-span-6 relative z-10 lg:-mr-[5vw] lg:translate-y-[70px]">
          <img src={img} alt={imgAlt} className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]" fetchPriority="high" />
        </div>
      </div>
      {/* A real torn-paper edge (photo, keyed out and matched to the page colour) */}
      <div className="absolute bottom-0 inset-x-0 translate-y-[1px] pointer-events-none">
        <img src="/v2/img/torn-soft.webp" alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />
      </div>
    </section>
  );
}

/* ─────────────── I. The 3 a.m. replay, told as a sleepless night's log ─────────────── */

const NIGHT_LOG = [
  { t: '3:07', h: 3, m: 7, line: 'A sentence surfaces. Something someone said yesterday, or last week, or eleven years ago at a wedding.' },
  { t: '3:12', h: 3, m: 12, line: 'You are back in the room. Same words. Same small pause before you answered.' },
  { t: '3:20', h: 3, m: 20, line: 'And the answer you gave, which was polite and reasonable and wrong.', mark: true },
  { t: '3:41', h: 3, m: 41, line: 'You rewrite it. In this version you stay calm and say the precise thing.' },
  { t: '4:02', h: 4, m: 2, line: 'You have a speech that would end the argument for good.' },
  { t: '4:03', h: 4, m: 3, line: 'And nobody to give it to.' },
];

/** An ink clock face whose hands ease round to the given time. */
function InkClock({ h, m, className = '' }: { h: number; m: number; className?: string }) {
  const hand = (deg: number) => ({ transform: `rotate(${deg}deg)`, transformOrigin: '100px 100px', transformBox: 'view-box' as const, transition: 'transform 0.9s cubic-bezier(.3,1.4,.5,1)' });
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <circle cx="100" cy="100" r="92" fill="#fdfbf6" stroke="#1c1b18" strokeWidth="6" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1c1b18" strokeWidth="1" opacity="0.25" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="100" y1="16" x2="100" y2={i % 3 === 0 ? 34 : 26} stroke="#1c1b18" strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <g style={hand((h % 12) * 30 + m * 0.5)}>
        <line x1="100" y1="100" x2="100" y2="54" stroke="#1c1b18" strokeWidth="8" strokeLinecap="round" />
      </g>
      <g style={hand(m * 6)}>
        <line x1="100" y1="100" x2="100" y2="30" stroke="#1c1b18" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="100" r="7" fill="#c9a46b" stroke="#1c1b18" strokeWidth="2" />
    </svg>
  );
}

function NightLine({ n, i, active, onActive }: { n: (typeof NIGHT_LOG)[number]; i: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  const last = i === NIGHT_LOG.length - 1;
  return (
    <li ref={ref} className={`py-8 lg:py-14 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <span className="sp2-type text-[20px] text-[color:var(--sp2-accent)]">{n.t}</span>
      <p className={last ? 'sp2-display italic text-[40px] sm:text-[56px] leading-[1.05] mt-2' : 'sp2-display text-[30px] sm:text-[40px] leading-[1.2] mt-2'}>
        {n.mark ? (
          <>
            And the answer you gave, which was{' '}
            <span className="relative inline-block">
              polite and reasonable and wrong.
              <Mark name="underline" red className="left-0 -bottom-2 w-full h-3" />
            </span>
          </>
        ) : (
          n.line
        )}
      </p>
    </li>
  );
}

/* A big ink clock stays in view while you scroll; its hands move to each line's time. */
export function Replay() {
  const [active, setActive] = useState(0);
  const now = NIGHT_LOG[active];
  return (
    <section className="relative bg-[color:var(--sp2-paper)] sp2-grain pt-10 lg:pt-16 pb-24 lg:pb-32">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">
        <p className="sp2-kicker">The 3 a.m. replay</p>
        <h2 className="sp2-display text-[44px] sm:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.01em] mt-4 max-w-[13ch]">
          It usually starts a little after three.
        </h2>

        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-6 mt-10 lg:mt-16">
          {/* Pinned while the night scrolls past (a small bar on phones, a big clock on desktop) */}
          <div className="lg:col-span-5 sticky top-0 lg:top-24 self-start z-10">
            <div className="py-3 lg:py-0 bg-[color:var(--sp2-paper)] lg:bg-transparent flex lg:block items-center gap-5 lg:text-center">
              <InkClock h={now.h} m={now.m} className="w-[110px] sm:w-[160px] lg:w-[320px] lg:mx-auto flex-shrink-0" />
              <p className="sp2-type text-[22px] lg:text-[28px] text-[color:var(--sp2-accent)] lg:mt-4">{now.t} a.m.</p>
            </div>
          </div>
          <ol className="lg:col-span-7">
            {NIGHT_LOG.map((n, i) => (
              <NightLine key={n.t} n={n} i={i} active={active === i} onActive={setActive} />
            ))}
            <li className="sp2-rule pt-10 mt-4">
              <p className="sp2-lead">The yes you didn&apos;t mean. The raise you didn&apos;t ask for. The joke at your expense you laughed along with.</p>
              <p className="sp2-note mt-4">The Voice That Keeps You Stuck, {pageRef(4, 'The replay is a signal')}. Day 4 of the Reset turns the replay into half a page you can actually use.</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── III. The checklist, as a torn notebook page ─────────────── */

const MOMENTS = [
  { m: 'A \u201cquick favor\u201d took your whole Saturday.', cost: 'One Saturday' },
  { m: 'You hosted the holiday again.', cost: 'One holiday, cooked and cleaned up' },
  { m: 'You apologized for something they did.', cost: 'One apology you didn\u2019t owe' },
  { m: 'Your idea came out of someone else\u2019s mouth in a meeting.', cost: 'One good idea, credited to them' },
  { m: 'Someone went quiet for two days, and you fixed it.', cost: 'Two days on eggshells' },
  { m: 'You lent money you didn\u2019t want to lend.', cost: 'Money you may not see again' },
  { m: 'You lay awake replaying what you should have said.', cost: 'A night\u2019s sleep' },
];

function verdict(n: number) {
  if (n <= 2) return 'Nobody forced you. It just felt easier than making it awkward.';
  if (n <= 4) return 'They got the easy evening. You paid for it.';
  return 'This isn\u2019t bad luck. It\u2019s a pattern, and patterns can be changed.';
}

// The receipt's zigzag bottom edge.
const RECEIPT_CLIP =
  'polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))';

/* The checklist on a torn notebook page; a receipt beside it prints what each one cost. */
export function Notebook() {
  const [on, setOn] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const lines = MOMENTS.map((x, i) => ({ ...x, i })).filter((x) => on.has(x.i));
  return (
    <section className="relative bg-[color:var(--sp2-paper)] sp2-grain pb-24 sm:pb-32">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">
        <p className="sp2-kicker">Be honest</p>
        <h2 className="sp2-display text-[44px] sm:text-[64px] lg:text-[76px] leading-[1] tracking-[-0.01em] max-w-[14ch] mt-4">
          Tap every one that happened to you{' '}
          <span className="relative inline-block whitespace-nowrap">
            this year.
            <Mark name="underline" red className="left-0 -bottom-3 w-full" />
          </span>
        </h2>

        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 items-start mt-14">
          {/* The notebook page: every line of text sits on a ruled line (52px grid) */}
          <div className="lg:col-span-8 relative rotate-[-0.6deg]">
            <div className="relative z-[1] -mb-[2px]">
              <TornEdge fill="#fdfbf6" />
            </div>
            <div
              className="relative bg-[#fdfbf6] shadow-[0_30px_50px_-30px_rgba(28,27,24,0.55)] pl-[64px] sm:pl-[84px] pr-5 sm:pr-10 pt-[26px] pb-[52px]"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 51px, rgba(70,90,120,0.22) 51px, rgba(70,90,120,0.22) 52px)',
                backgroundPosition: '0 26px',
              }}
            >
              {MOMENTS.map((x, i) => {
                const checked = on.has(i);
                return (
                  <button key={x.m} onClick={() => toggle(i)} aria-pressed={checked} className="relative block w-full text-left group text-[20px] sm:text-[22px] leading-[52px] focus:outline-none focus-visible:underline decoration-[color:var(--sp2-accent)]">
                    <span className="absolute -left-[56px] sm:-left-[70px] top-[8px] w-9 h-9 flex items-center justify-center">
                      {checked ? (
                        <motion.img src={`${INK}/check.png`} alt="" className="w-9 h-9" initial={{ scale: 0.4, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }} />
                      ) : (
                        <span className="block w-6 h-6 border-2 border-[#9b9182] rounded-[3px] group-hover:border-[color:var(--sp2-ink)]" />
                      )}
                    </span>
                    <span className={`block ${checked ? 'text-[color:var(--sp2-muted)]' : ''}`}>{x.m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The receipt: stays in view beside the list, one line per tap */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="relative bg-white shadow-[0_24px_40px_-26px_rgba(28,27,24,0.6)] px-6 pt-6 pb-10 sp2-type rotate-[1.2deg]" style={{ clipPath: RECEIPT_CLIP }}>
              <div className="flex items-center gap-3 border-b-2 border-dashed border-[#bdb3a3] pb-4">
                <img src="/v2/icons/receipt.png" alt="" aria-hidden className="w-10 h-10 object-contain" />
                <div>
                  <p className="text-[18px] font-bold tracking-[0.1em]">WHAT IT COST YOU</p>
                  <p className="text-[16px] text-[color:var(--sp2-muted)]">This year</p>
                </div>
              </div>
              <div className="min-h-[150px] py-3" aria-live="polite">
                {lines.length === 0 && <p className="text-[16px] text-[color:var(--sp2-muted)] pt-3">Tap a line on the notebook. It prints here.</p>}
                <AnimatePresence initial={false}>
                  {lines.map((x) => (
                    <motion.p key={x.i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[17px] leading-snug py-1.5 overflow-hidden">
                      {x.cost}
                    </motion.p>
                  ))}
                </AnimatePresence>
              </div>
              <div className="border-t-2 border-dashed border-[#bdb3a3] pt-4 flex justify-between text-[18px] font-bold">
                <span>PAID BY</span>
                <span>YOU</span>
              </div>
              {lines.length > 0 && <p className="text-[16px] mt-4 text-[color:var(--sp2-oxblood)]">{verdict(lines.length)}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── IV. The scenes, as a collage ─────────────── */

const SCENES = [
  { img: `${LINO}/table.jpg`, alt: 'A family holiday dinner, one man sitting back with a strained smile', label: 'The holiday table', said: '\u201cWell, some of us actually make an effort to visit.\u201d', aside: '', you: 'You laugh it off, then spend the drive home rehearsing what you should have said.' },
  { img: `${LINO}/office.jpg`, alt: 'A man presenting in a meeting while a woman watches her idea taken', label: 'The Tuesday meeting', said: '\u201cSo I had this idea\u2026\u201d', aside: '(It was your idea.)', you: 'You say nothing, because making a fuss feels worse than losing the credit.' },
  { img: `${LINO}/phone.jpg`, alt: 'Two hands holding a phone over a kitchen table at night', label: 'The text you keep rereading', said: '\u201cFine. I guess I\u2019ll figure it out myself, like always.\u201d', aside: '', you: 'You type an apology for something you didn\u2019t do, and send it.' },
];

export function Scenes() {
  return (
    <section className="relative bg-[color:var(--sp2-paper)] sp2-grain pt-8 pb-28 overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">
        <div className="grid lg:grid-cols-12 gap-x-10">
          <div className="lg:col-span-10">
            <p className="sp2-kicker">Three rooms</p>
            <h2 className="sp2-display text-[40px] sm:text-[64px] leading-[1.02] max-w-[16ch]">Different rooms. The same moment.</h2>
          </div>
        </div>

        {/* Three prints, all the same size, gently staggered; each fades into the paper */}
        <div className="grid md:grid-cols-3 gap-x-10 gap-y-16 mt-14 lg:mt-20">
          {SCENES.map((sc, i) => (
            <figure key={sc.label} className={i === 1 ? 'md:mt-24' : i === 2 ? 'md:mt-10' : ''}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={sc.img} alt={sc.alt} className="w-full h-full object-cover sp2-soft" loading="lazy" />
              </div>
              <figcaption className="mt-4">
                <p className="sp2-kicker !mb-2">{sc.label}</p>
                <p className="sp2-display italic text-[28px] sm:text-[32px] leading-[1.15]">{sc.said}</p>
                {sc.aside && (
                  <span className="relative inline-block mt-1 sp2-display italic text-[28px] sm:text-[32px] leading-[1.15]">
                    {sc.aside}
                    <Mark name="underline2" red className="left-0 -bottom-3 w-full h-4" />
                  </span>
                )}
                <p className="mt-4 text-[color:var(--sp2-muted)]">{sc.you}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* The close of the section: type alone */}
        <div className="text-center mt-28 lg:mt-36">
          <p className="sp2-display text-[40px] sm:text-[64px] lg:text-[80px] leading-[1.02]">
            If that sounds familiar,
            <br />
            this book was written{' '}
            <span className="relative inline-block italic">
              for you.
              <Mark name="underline" className="left-0 -bottom-4 w-full" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}


/** Opens one of the page's parts, like a part page in the book. */
const PART_ICONS: Record<string, string> = { I: 'moon', II: 'head', III: 'lantern', IV: 'book', V: 'compass' };

/** A part page, like the start of a part in a printed book: icon, rules, a huge numeral, an italic title. */
export function PartOpener({ n, title, dark = false }: { n: string; title: string; dark?: boolean }) {
  const rule = dark ? 'bg-[#efe7da]/60' : 'bg-[color:var(--sp2-ink)]';
  return (
    <div className={`max-w-[1320px] mx-auto px-5 sm:px-10 text-center ${dark ? 'text-[#faf6ee]' : ''}`}>
      <img
        src={`/v2/icons/${PART_ICONS[n] ?? 'book'}.png`}
        alt=""
        aria-hidden
        className="w-20 h-20 mx-auto object-contain"
        style={dark ? { filter: 'invert(0.92) sepia(0.35)' } : undefined}
      />
      <div className="flex items-center justify-center gap-5 mt-6">
        <span className={`h-px w-16 sm:w-28 ${rule}`} />
        <span className={`sp2-type text-[16px] tracking-[0.2em] ${dark ? 'text-[color:var(--sp2-gold)]' : 'text-[color:var(--sp2-accent)]'}`}>PART</span>
        <span className={`h-px w-16 sm:w-28 ${rule}`} />
      </div>
      <p className="sp2-display text-[110px] sm:text-[170px] leading-[0.85] mt-2">{n}</p>
      <p className="sp2-display italic text-[34px] sm:text-[50px] leading-tight mt-2">{title}</p>
    </div>
  );
}

