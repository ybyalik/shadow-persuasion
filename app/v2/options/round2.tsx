'use client';

/* eslint-disable @next/next/no-img-element */
/**
 * Round 2 design options: hero picture + torn edge, the 3 a.m. replay, the checklist, and the loop.
 * The chosen versions get moved into /v2 afterwards.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { TornEdge } from '../_components/editorial';

const IC = '/v2/icons';
const INK = '/v2/ink';
const LINO = '/v2/lino';

function Icon({ name, className = 'w-16 h-16' }: { name: string; className?: string }) {
  return <img src={`${IC}/${name}.png`} alt="" aria-hidden className={`object-contain ${className}`} />;
}

function Picker<T extends string>({ label, value, set, items }: { label: string; value: T; set: (v: T) => void; items: { id: T; name: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sp2-ui text-[16px] font-semibold mr-2 min-w-[70px]">{label}</span>
      {items.map((x) => (
        <button
          key={x.id}
          onClick={() => set(x.id)}
          className={`sp2-ui text-[16px] px-4 py-2 rounded-full border-2 ${value === x.id ? 'bg-[color:var(--sp2-ink)] text-white border-[color:var(--sp2-ink)]' : 'border-[color:var(--sp2-line)] bg-white hover:border-[color:var(--sp2-ink)]'}`}
        >
          <b>{x.id}</b> {x.name}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════ H + T. Hero picture and torn edge ═══════════════ */

type HeroId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6';
type EdgeId = 'T1' | 'T2' | 'T3' | 'T4';

const HERO_PICS: { id: HeroId; name: string; src: string; wide: string }[] = [
  { id: 'H1', name: 'Now: book + open journal', src: '/v2/img/hero-cutout.webp', wide: 'w-full' },
  { id: 'H2', name: 'Held in two hands', src: '/v2/img/hero-opt-hands.webp', wide: 'w-[92%]' },
  { id: 'H3', name: 'Cut puppet strings', src: '/v2/img/hero-opt-strings.webp', wide: 'w-[70%] mx-auto' },
  { id: 'H4', name: '3:07 on the phone', src: '/v2/img/hero-opt-night.webp', wide: 'w-full' },
  { id: 'H5', name: 'Just arrived in the mail', src: '/v2/img/hero-opt-parcel.webp', wide: 'w-full' },
  { id: 'H6', name: 'Linocut: cutting the strings', src: '/v2/img/hero-opt-lino.webp', wide: 'w-[80%] mx-auto' },
];

const EDGES: { id: EdgeId; name: string }[] = [
  { id: 'T1', name: 'Now: sharp zigzag' },
  { id: 'T2', name: 'Drawn soft tear' },
  { id: 'T3', name: 'Real torn paper, gentle' },
  { id: 'T4', name: 'Real torn paper, rough' },
];

/** A softer drawn tear: many small curved bites, with a pale torn rim showing just above the paper. */
function SoftTear() {
  // Fixed pseudo-random offsets so the edge is the same on every load.
  const ys = [18, 24, 15, 27, 20, 31, 17, 23, 29, 16, 25, 21, 33, 19, 26, 14, 28, 22, 30, 18, 24, 27, 15, 23, 32, 20, 26, 17, 29, 21, 25, 16, 31, 19, 27, 23, 18, 28, 22, 26, 17];
  const step = 1000 / (ys.length - 1);
  const path = (lift: number) => {
    let d = `M0,60 L0,${ys[0] - lift} `;
    for (let i = 1; i < ys.length; i++) {
      const x = i * step;
      const cx = x - step / 2;
      d += `Q${cx.toFixed(1)},${(ys[i - 1] + ys[i]) / 2 - lift + (i % 2 ? 4 : -3)} ${x.toFixed(1)},${ys[i] - lift} `;
    }
    return d + 'L1000,60 Z';
  };
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="block w-full h-[34px] sm:h-[52px]" aria-hidden>
      <path d={path(5)} fill="#fffdf7" />
      <path d={path(0)} fill="var(--sp2-paper)" />
    </svg>
  );
}

function HeroEdge({ id }: { id: EdgeId }) {
  if (id === 'T1') return <TornEdge />;
  if (id === 'T2') return <SoftTear />;
  return <img src={`/v2/img/torn-${id === 'T3' ? 'soft' : 'rough'}.webp`} alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />;
}

function HeroPreview() {
  const [pic, setPic] = useState<HeroId>('H1');
  const [edge, setEdge] = useState<EdgeId>('T1');
  const p = HERO_PICS.find((x) => x.id === pic)!;
  return (
    <div>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 space-y-4 pb-8">
        <Picker label="Picture" value={pic} set={setPic} items={HERO_PICS} />
        <Picker label="Edge" value={edge} set={setEdge} items={EDGES} />
      </div>
      <section className="relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-grain">
        <div className="relative max-w-[1320px] mx-auto px-5 sm:px-10 pt-14 pb-28 sm:pb-36 grid lg:grid-cols-12 gap-x-8 items-center">
          <div className="lg:col-span-6 relative z-10">
            <h2 className="sp2-display font-medium leading-[0.98] tracking-[-0.015em]">
              <span className="block text-[44px] sm:text-[68px] lg:text-[80px] text-[#faf6ee]">You were raised to be nice.</span>
              <span className="block italic text-[58px] sm:text-[100px] lg:text-[124px] text-[color:var(--sp2-gold)] mt-2">Some people noticed.</span>
            </h2>
            <img src={p.src} alt="" className={`lg:hidden mt-8 ${p.wide}`} />
            <p className="sp2-lead text-[#e6ddcf] mt-8 max-w-[30ch]">
              The tactics people use to get their way with you, the calm words that stop each one, and a 21-day reset that changes how you answer for good.
            </p>
            <span className="sp2-btn sp2-btn-gold mt-9">Get the paperback, $67</span>
          </div>
          <div className="hidden lg:block lg:col-span-6 relative z-10 lg:-mr-[5vw] lg:translate-y-[70px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={p.src}
                src={p.src}
                alt=""
                className={`${p.wide} block drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </AnimatePresence>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 translate-y-[1px]">
          <HeroEdge id={edge} />
        </div>
      </section>
      <div className="bg-[color:var(--sp2-paper)] h-40" />
    </div>
  );
}

/* ═══════════════ R. The 3 a.m. replay ═══════════════ */

const NIGHT = [
  { t: '3:07', h: 3, m: 7, line: 'A sentence surfaces. Something someone said yesterday, or last week, or eleven years ago at a wedding.' },
  { t: '3:12', h: 3, m: 12, line: 'You are back in the room. Same words. Same small pause before you answered.' },
  { t: '3:20', h: 3, m: 20, line: 'And the answer you gave, which was polite and reasonable and wrong.' },
  { t: '3:41', h: 3, m: 41, line: 'You rewrite it. In this version you stay calm and say the precise thing.' },
  { t: '4:02', h: 4, m: 2, line: 'You have a speech that would end the argument for good.' },
  { t: '4:03', h: 4, m: 3, line: 'And nobody to give it to.' },
];

/** An ink clock face whose hands sweep to the given time. */
function InkClock({ h, m, className = '' }: { h: number; m: number; className?: string }) {
  const minuteDeg = m * 6;
  const hourDeg = (h % 12) * 30 + m * 0.5;
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <circle cx="100" cy="100" r="92" fill="#fdfbf6" stroke="#1c1b18" strokeWidth="6" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1c1b18" strokeWidth="1" opacity="0.25" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="100" y1="16" x2="100" y2={i % 3 === 0 ? 34 : 26} stroke="#1c1b18" strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30} 100 100)`} />
      ))}
      {/* Hands turn around the clock's centre; CSS eases them to each new time */}
      <g style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: '100px 100px', transformBox: 'view-box', transition: 'transform 0.9s cubic-bezier(.3,1.4,.5,1)' }}>
        <line x1="100" y1="100" x2="100" y2="54" stroke="#1c1b18" strokeWidth="8" strokeLinecap="round" />
      </g>
      <g style={{ transform: `rotate(${minuteDeg}deg)`, transformOrigin: '100px 100px', transformBox: 'view-box', transition: 'transform 0.9s cubic-bezier(.3,1.4,.5,1)' }}>
        <line x1="100" y1="100" x2="100" y2="30" stroke="#1c1b18" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="100" r="7" fill="#c9a46b" stroke="#1c1b18" strokeWidth="2" />
    </svg>
  );
}

/** R1: a big clock stays put while you scroll; its hands move to each line's time. */
function ReplayR1() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24 text-center">
          <InkClock h={NIGHT[active].h} m={NIGHT[active].m} className="w-[220px] sm:w-[320px] mx-auto" />
          <p className="sp2-type text-[28px] text-[color:var(--sp2-accent)] mt-4">{NIGHT[active].t} a.m.</p>
        </div>
      </div>
      <ol className="lg:col-span-7">
        {NIGHT.map((n, i) => (
          <ReplayLine key={n.t} i={i} onActive={setActive} active={active === i} last={i === NIGHT.length - 1} n={n} />
        ))}
        <li className="sp2-note mt-8">Chapter 1, page 10. It ends with a ten-minute exercise for exactly this.</li>
      </ol>
    </div>
  );
}

function ReplayLine({ n, i, onActive, active, last }: { n: (typeof NIGHT)[number]; i: number; onActive: (i: number) => void; active: boolean; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  return (
    <li ref={ref} className={`py-10 lg:py-16 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <span className="sp2-type text-[20px] text-[color:var(--sp2-accent)]">{n.t}</span>
      <p className={last ? 'sp2-display italic text-[40px] sm:text-[56px] leading-[1.05] mt-2' : 'sp2-display text-[30px] sm:text-[40px] leading-[1.2] mt-2'}>{n.line}</p>
    </li>
  );
}

/** R2: a bedside clock in the dark; the night plays out one line at a time. */
function ReplayR2() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-30%' });
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || i >= NIGHT.length - 1) return;
    const id = setTimeout(() => setI((x) => x + 1), 3600);
    return () => clearTimeout(id);
  }, [inView, i]);
  const n = NIGHT[i];
  return (
    <div ref={ref} className="grid lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-5">
        <div className="relative mx-auto max-w-[420px]">
          <img src={`${LINO}/part1.jpg`} alt="A bedside table at night" className="w-full sp2-soft-more opacity-90" />
        </div>
      </div>
      <div className="lg:col-span-7 min-h-[360px]">
        <div className="inline-flex items-center gap-4 bg-black rounded-[10px] px-6 py-3 shadow-[inset_0_0_0_2px_#2c2722]">
          <AnimatePresence mode="wait">
            <motion.span key={n.t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sp2-type text-[64px] sm:text-[84px] leading-none text-[#e9a23b] tracking-[0.04em]" style={{ textShadow: '0 0 18px rgba(233,162,59,0.45)' }}>
              {n.t}
            </motion.span>
          </AnimatePresence>
          <span className="sp2-type text-[18px] text-[#e9a23b]/70">AM</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={n.t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className={i === NIGHT.length - 1 ? 'sp2-display italic text-[42px] sm:text-[60px] leading-[1.05] mt-10 text-[#faf6ee]' : 'sp2-display text-[32px] sm:text-[44px] leading-[1.2] mt-10 text-[#efe7da]'}
          >
            {n.line}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-3 mt-10">
          {NIGHT.map((x, k) => (
            <button key={x.t} onClick={() => setI(k)} aria-label={x.t} className={`h-2 rounded-full transition-all ${k === i ? 'w-10 bg-[color:var(--sp2-gold)]' : 'w-2 bg-[#5a5147]'}`} />
          ))}
          {i === NIGHT.length - 1 && (
            <button onClick={() => setI(0)} className="sp2-small ml-4 underline underline-offset-4 decoration-[color:var(--sp2-gold)] text-[#d8cfc1]">
              Play the night again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** R3: the night as thoughts arriving on a lock screen, one after another. */
function ReplayR3() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25%' });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || shown >= NIGHT.length) return;
    const id = setTimeout(() => setShown((x) => x + 1), shown === 0 ? 400 : 2200);
    return () => clearTimeout(id);
  }, [inView, shown]);
  const now = NIGHT[Math.max(0, shown - 1)];
  return (
    <div ref={ref} className="grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-5 order-2 lg:order-1">
        <p className="sp2-lead">The yes you didn&apos;t mean. The raise you didn&apos;t ask for. The joke at your expense you laughed along with.</p>
        <p className="sp2-note mt-4">Chapter 1, page 10. It ends with a ten-minute exercise for exactly this.</p>
      </div>
      <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
        <div className="mx-auto w-full max-w-[380px] rounded-[48px] bg-[#0f0d0b] p-3 shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)]">
          <div className="rounded-[38px] bg-gradient-to-b from-[#1d2230] to-[#0d0f15] px-5 pt-10 pb-8 min-h-[620px] sp2-ui text-white">
            <p className="text-center text-[16px] opacity-70">Tuesday</p>
            <p className="text-center text-[76px] font-light leading-none tracking-tight mt-1">{now.t}</p>
            <div className="mt-8 space-y-2.5">
              <AnimatePresence>
                {NIGHT.slice(0, shown).map((n, k) => (
                  <motion.div
                    key={n.t}
                    initial={{ opacity: 0, y: -14, scale: 0.97 }}
                    animate={{ opacity: k < shown - 3 ? 0.45 : 1, y: 0, scale: 1 }}
                    className="rounded-[18px] bg-white/15 backdrop-blur px-4 py-3"
                  >
                    <div className="flex justify-between text-[16px] opacity-70">
                      <span>Your thoughts</span>
                      <span>{n.t}</span>
                    </div>
                    <p className={`text-[17px] leading-snug mt-1 ${k === NIGHT.length - 1 ? 'font-semibold' : ''}`}>{n.line}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ N. The checklist ═══════════════ */

const MOMENTS = [
  { m: 'A “quick favor” took your whole Saturday.', t: 'You told yourself it was no big deal.', cost: 'One Saturday' },
  { m: 'You hosted the holiday again.', t: 'You told yourself someone has to.', cost: 'One holiday, cooked and cleaned up' },
  { m: 'You apologized for something they did.', t: 'You told yourself it kept the peace.', cost: 'One apology you didn’t owe' },
  { m: 'Your idea came out of someone else’s mouth in a meeting.', t: 'You told yourself it didn’t matter who said it.', cost: 'One good idea, credited to them' },
  { m: 'Someone went quiet for two days, and you fixed it.', t: 'You told yourself that’s love.', cost: 'Two days on eggshells' },
  { m: 'You lent money you didn’t want to lend.', t: 'You told yourself they’d pay it back this time.', cost: 'Money you may not see again' },
  { m: 'You lay awake replaying what you should have said.', t: 'You told yourself: next time.', cost: 'A night’s sleep' },
];

function useToggleSet() {
  const [on, setOn] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  return [on, toggle] as const;
}

/** The notebook page (same as now, minus the line that drew across the top). */
function NotebookPage({ on, toggle, footer }: { on: Set<number>; toggle: (i: number) => void; footer?: React.ReactNode }) {
  return (
    <div className="relative rotate-[-0.6deg]">
      <div className="relative z-[1] -mb-[2px]">
        <TornEdge fill="#fdfbf6" />
      </div>
      <div
        className="relative bg-[#fdfbf6] shadow-[0_30px_50px_-30px_rgba(28,27,24,0.55)] pl-[64px] sm:pl-[84px] pr-5 sm:pr-10 pt-[26px] pb-[52px]"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 51px, rgba(70,90,120,0.22) 51px, rgba(70,90,120,0.22) 52px)', backgroundPosition: '0 26px' }}
      >
        {MOMENTS.map((x, i) => {
          const checked = on.has(i);
          return (
            <button key={x.m} onClick={() => toggle(i)} aria-pressed={checked} className="relative block w-full text-left group text-[20px] sm:text-[22px] leading-[52px] focus:outline-none">
              <span className="absolute -left-[56px] sm:-left-[70px] top-[8px] w-9 h-9 flex items-center justify-center">
                {checked ? (
                  <motion.img src={`${INK}/check.png`} alt="" className="w-9 h-9" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
                ) : (
                  <span className="block w-6 h-6 border-2 border-[#9b9182] rounded-[3px] group-hover:border-[color:var(--sp2-ink)]" />
                )}
              </span>
              <span className={`block ${checked ? 'text-[color:var(--sp2-muted)]' : ''}`}>{x.m}</span>
            </button>
          );
        })}
        {footer}
      </div>
    </div>
  );
}

function verdict(n: number) {
  if (n === 0) return 'Tap the ones that happened. Your total shows here.';
  if (n <= 2) return 'Nobody forced you. It just felt easier than making it awkward.';
  if (n <= 4) return 'They got the easy evening. You paid for it.';
  return 'This isn’t bad luck. It’s a pattern, and patterns can be changed.';
}

/** N1: the tally lives in the right column, beside the list, and stays in view. */
function ChecklistN1() {
  const [on, toggle] = useToggleSet();
  return (
    <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-start">
      <div className="lg:col-span-7">
        <NotebookPage on={on} toggle={toggle} />
      </div>
      <div className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-24 text-center lg:text-left">
        <Icon name="pen" className="w-20 h-20 mx-auto lg:mx-0" />
        <p className="sp2-kicker mt-6 !mb-1">Your count</p>
        <div className="flex items-baseline gap-3 justify-center lg:justify-start">
          <AnimatePresence mode="popLayout">
            <motion.span key={on.size} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="sp2-display text-[120px] leading-none">
              {on.size}
            </motion.span>
          </AnimatePresence>
          <span className="sp2-display text-[40px] text-[color:var(--sp2-muted)]">of 7</span>
        </div>
        {/* Ink tally marks, one per tap */}
        <div className="flex gap-2 h-12 mt-3 justify-center lg:justify-start">
          {Array.from({ length: on.size }, (_, k) => (
            <motion.span key={k} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className={`block w-[5px] h-12 bg-[color:var(--sp2-ink)] rounded-full origin-bottom ${k === 4 ? 'rotate-[62deg] -ml-[40px] w-[6px] h-14 bg-[color:var(--sp2-oxblood)]' : ''}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={verdict(on.size)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sp2-lead mt-6">
            {verdict(on.size)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** N2: the answer is written on the notebook page itself, with a red circled count on the corner. */
function ChecklistN2() {
  const [on, toggle] = useToggleSet();
  return (
    <div className="max-w-[860px] mx-auto relative">
      <div className="absolute -top-10 -right-2 sm:-right-10 z-10 w-[120px] h-[120px] flex items-center justify-center rotate-[8deg]">
        <img src={`${INK}/circle-red.png`} alt="" aria-hidden className="absolute inset-0 w-full h-full" />
        <span className="sp2-display text-[44px] text-[color:var(--sp2-oxblood)] leading-none">
          {on.size}
          <span className="text-[24px]">/7</span>
        </span>
      </div>
      <NotebookPage
        on={on}
        toggle={toggle}
        footer={
          <div className="min-h-[104px]">
            <AnimatePresence mode="wait">
              <motion.p key={on.size === 0 ? 'none' : 'some'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sp2-note !text-[20px] !leading-[52px] mt-[52px]">
                {on.size === 0 ? 'Your total goes in the corner. ↗' : `${verdict(on.size)} Each one was a choice to keep the peace, paid for by you.`}
              </motion.p>
            </AnimatePresence>
          </div>
        }
      />
    </div>
  );
}

/** N3: a receipt prints beside the list, one line per thing it cost you. */
function ChecklistN3() {
  const [on, toggle] = useToggleSet();
  const lines = MOMENTS.map((x, i) => ({ ...x, i })).filter((x) => on.has(x.i));
  return (
    <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-start">
      <div className="lg:col-span-7">
        <NotebookPage on={on} toggle={toggle} />
      </div>
      <div className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-24">
        <div className="relative bg-white shadow-[0_24px_40px_-26px_rgba(28,27,24,0.6)] px-6 pt-6 pb-10 sp2-type rotate-[1.2deg]" style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))' }}>
          <div className="flex items-center gap-3 border-b-2 border-dashed border-[#bdb3a3] pb-4">
            <Icon name="receipt" className="w-10 h-10" />
            <div>
              <p className="text-[18px] font-bold tracking-[0.1em]">WHAT IT COST YOU</p>
              <p className="text-[16px] text-[color:var(--sp2-muted)]">This year</p>
            </div>
          </div>
          <div className="min-h-[150px] py-3">
            {lines.length === 0 && <p className="text-[16px] text-[color:var(--sp2-muted)] pt-3">Tap a line on the left. It prints here.</p>}
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
  );
}

/* ═══════════════ L. The loop ═══════════════ */

const LOOP = [
  { icon: 'push', t: 'They push', s: 'A sigh, a guilt trip, a deadline from nowhere.' },
  { icon: 'smooth', t: 'You give in', s: 'You say yes, explain, or apologize.' },
  { icon: 'learn', t: 'It works', s: 'So they learn exactly what to do.' },
  { icon: 'weight', t: 'They push harder', s: 'A little more each time.' },
];

/** L1: the same circle, but each step is a custom icon and two or three words. */
function LoopL1() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const spots = [{ left: '50%', top: '12%' }, { left: '88%', top: '50%' }, { left: '50%', top: '88%' }, { left: '12%', top: '50%' }];
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[460px] aspect-square">
      <svg viewBox="0 0 400 400" className="absolute inset-[12%] w-[76%] h-[76%]" aria-hidden>
        <motion.circle cx="200" cy="200" r="190" fill="none" stroke="#8a5a2b" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.6 }} />
      </svg>
      <img src={`${INK}/arrow2.png`} alt="" aria-hidden className="absolute right-[14%] top-[14%] w-14 rotate-[20deg] opacity-80" />
      <img src={`${INK}/arrow2.png`} alt="" aria-hidden className="absolute left-[14%] bottom-[14%] w-14 rotate-[200deg] opacity-80" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="sp2-display italic text-[30px] sm:text-[36px] leading-[1.05] text-center">
          The nice-person
          <br />
          loop
        </p>
      </div>
      {LOOP.map((n, i) => (
        <motion.div
          key={n.t}
          className="absolute flex flex-col items-center w-[120px]"
          style={{ left: spots[i].left, top: spots[i].top, x: '-50%', y: '-50%' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 + i * 0.25 }}
        >
          <div className="w-[84px] h-[84px] rounded-full bg-[#fdfbf6] border-2 border-[color:var(--sp2-ink)] flex items-center justify-center">
            <Icon name={n.icon} className="w-14 h-14" />
          </div>
          <p className="sp2-display text-[22px] leading-tight text-center mt-1 px-1.5 bg-[color:var(--sp2-paper)]">{n.t}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** L2: four steps that climb and grow, then an arrow loops back to the start. */
function LoopL2() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const sizes = ['w-14 h-14', 'w-16 h-16', 'w-20 h-20', 'w-24 h-24'];
  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-4 items-end gap-2">
        {LOOP.map((n, i) => (
          <motion.div key={n.t} className="text-center" style={{ paddingBottom: i * 28 }} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.3 }}>
            <Icon name={n.icon} className={`${sizes[i]} mx-auto`} />
            <p className="sp2-display text-[20px] sm:text-[24px] leading-tight mt-2">{n.t}</p>
          </motion.div>
        ))}
      </div>
      {/* The rising line under the steps */}
      <svg viewBox="0 0 400 120" className="w-full h-auto -mt-2" aria-hidden>
        <motion.path d="M20,100 L380,16" stroke="#1c1b18" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.2 }} />
        <motion.path d="M380,24 C390,110 120,124 30,112" stroke="#7a2e22" strokeWidth="2.5" fill="none" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ delay: 1.3, duration: 1.2 }} />
        <motion.path d="M38,104 L28,112 L40,118" stroke="#7a2e22" strokeWidth="2.5" fill="none" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }} />
      </svg>
      <p className="sp2-note text-center -mt-2">and round again, a little bigger each time</p>
    </div>
  );
}

/** L3: one step at a time; the light moves round the circle and the middle says what is happening. */
function LoopL3() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % LOOP.length), 2600);
    return () => clearInterval(id);
  }, []);
  const spots = [
    { left: '50%', top: '0%' },
    { left: '100%', top: '50%' },
    { left: '50%', top: '100%' },
    { left: '0%', top: '50%' },
  ];
  return (
    <div className="relative mx-auto w-[calc(100%-100px)] max-w-[420px] aspect-square">
      <div className="absolute inset-[9%] rounded-full border-2 border-dashed border-[#c9b89c]" />
      {LOOP.map((n, k) => (
        <button
          key={n.t}
          onClick={() => setI(k)}
          className={`absolute w-[92px] h-[92px] rounded-full flex items-center justify-center transition-all duration-500 ${k === i ? 'bg-[#fdfbf6] border-2 border-[color:var(--sp2-ink)] scale-110 shadow-[0_14px_24px_-14px_rgba(0,0,0,0.5)]' : 'bg-[color:var(--sp2-paper)] border-2 border-transparent opacity-40'}`}
          style={{ left: spots[k].left, top: spots[k].top, transform: `translate(-50%,-50%) scale(${k === i ? 1.1 : 1})` }}
          aria-label={n.t}
        >
          <Icon name={n.icon} className="w-14 h-14" />
        </button>
      ))}
      <div className="absolute inset-[24%] flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="sp2-type text-[16px] text-[color:var(--sp2-accent)]">STEP {i + 1}</p>
            <p className="sp2-display text-[32px] leading-tight">{LOOP[i].t}</p>
            <p className="text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-1">{LOOP[i].s}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Shows a loop option in its real place: beside the "Every time it works" text. */
export function LoopInContext({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center">
      <div className="lg:col-span-5 order-2 lg:order-1">{children}</div>
      <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
        <p className="sp2-kicker">Why it keeps happening</p>
        <h2 className="sp2-display sp2-h2">Every time it works, they learn.</h2>
        <div className="sp2-body mt-8 max-w-[32em]">
          <p>Nobody sits down and plans to use you. It is simpler than that. Pressure that works gets used again, a little more each time.</p>
        </div>
      </div>
    </div>
  );
}

export { HeroPreview, ReplayR1, ReplayR2, ReplayR3, ChecklistN1, ChecklistN2, ChecklistN3, LoopL1, LoopL2, LoopL3 };
