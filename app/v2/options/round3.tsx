'use client';

/* eslint-disable @next/next/no-img-element */
/**
 * Round 3 design options: the tactic cards (same layout, new card styles), the four parts,
 * "Is it for you?", "The usual fixes", and the companion app phone.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TACTICS, TACTIC_ART, DecoderPhone } from '../_components/interactive';
import { Mark } from '../_components/editorial';

const INK = '/v2/ink';
const LINO = '/v2/lino';

function Icon({ name, className = 'w-16 h-16' }: { name: string; className?: string }) {
  return <img src={`/v2/icons/${name}.png`} alt="" aria-hidden className={`object-contain ${className}`} />;
}

/* ═══════════════ G. The eight tactics: same grid and flip, new card styles ═══════════════ */

type CardStyle = 'tape' | 'index' | 'open';

function TacticFace({ i, style, flipped }: { i: number; style: CardStyle; flipped: boolean }) {
  const t = TACTICS[i];
  const front = (
    <>
      <img src={`${LINO}/${TACTIC_ART[i]}.png`} alt="" className="w-[140px] h-[140px] mx-auto object-contain" />
      <p className="sp2-kicker !mb-1 mt-2">{t.ch}</p>
      <h3 className="sp2-display text-[28px] leading-[1.1]">{t.name}</h3>
      <p className="italic text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-2">{t.says}</p>
      <p className="mt-auto pt-3 text-[17px] font-semibold text-[color:var(--sp2-accent)] underline underline-offset-4">Tap for the calm reply</p>
    </>
  );
  const back = (
    <>
      <p className="sp2-kicker on-dark">The calm reply</p>
      <p className="sp2-display text-[28px] leading-[1.25] text-[#faf6ee]">{t.reply}</p>
    </>
  );
  if (style === 'open') {
    // No card at all: the print sits on the page; the reply replaces the quote in place.
    return (
      <div className="h-full flex flex-col px-5 pt-4 pb-6">
        <img src={`${LINO}/${TACTIC_ART[i]}.png`} alt="" className="w-[150px] h-[150px] mx-auto object-contain" />
        <p className="sp2-kicker !mb-1 mt-2">{t.ch}</p>
        <h3 className="sp2-display text-[28px] leading-[1.1]">{t.name}</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={flipped ? 'r' : 's'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={flipped ? 'sp2-display text-[23px] leading-snug mt-2' : 'italic text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-2'}
          >
            {flipped ? <mark className="sp2-hl">{t.reply}</mark> : t.says}
          </motion.p>
        </AnimatePresence>
        <p className="mt-auto pt-3 text-[17px] font-semibold text-[color:var(--sp2-accent)] underline underline-offset-4">{flipped ? 'Show what they say' : 'Tap for the calm reply'}</p>
      </div>
    );
  }
  const faceClass =
    style === 'tape'
      ? 'bg-[#fbf8f2] border border-[color:var(--sp2-ink)]/15'
      : 'bg-white border border-[#e4dccd] shadow-[0_1px_0_#d6cbb7,0_3px_0_-1px_#fbf8f2,0_4px_0_-1px_#d6cbb7,0_6px_0_-2px_#fbf8f2,0_7px_0_-2px_#d6cbb7]';
  return (
    <motion.div className="relative w-full h-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <div
        className={`absolute inset-0 [backface-visibility:hidden] px-5 pt-5 pb-5 flex flex-col ${faceClass}`}
        style={
          style === 'index'
            ? {
                backgroundImage:
                  'linear-gradient(to bottom, transparent 0, transparent 30px, rgba(122,46,34,0.55) 30px, rgba(122,46,34,0.55) 32px, transparent 32px), repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(70,90,120,0.12) 31px, rgba(70,90,120,0.12) 32px)',
              }
            : undefined
        }
      >
        {style === 'tape' && <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#e8dcc0]/80 rotate-[-3deg] shadow-[0_1px_0_rgba(0,0,0,0.05)]" />}
        {front}
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[color:var(--sp2-night)] p-6 flex flex-col justify-center">{back}</div>
    </motion.div>
  );
}

export function TacticGrid({ style }: { style: CardStyle }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const tilt = style === 'open' ? [0, 0, 0, 0, 0, 0, 0, 0] : [-1.2, 0.8, -0.5, 1.1, 0.6, -0.9, 1.3, -0.7];
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${style === 'open' ? 'gap-0 border-t border-l border-[color:var(--sp2-line)]' : 'gap-8'}`}>
      {TACTICS.map((t, i) => (
        <button
          key={t.name}
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          className={`relative h-[420px] text-left [perspective:1200px] ${style === 'open' ? 'border-r border-b border-[color:var(--sp2-line)]' : ''}`}
          style={{ transform: `rotate(${tilt[i]}deg)` }}
          aria-label={`${t.name}: show the calm reply`}
        >
          <TacticFace i={i} style={style} flipped={!!flipped[i]} />
        </button>
      ))}
    </div>
  );
}

/* ═══════════════ P. The four parts ═══════════════ */

const PARTS = [
  { n: 'I', icon: 'shield', title: 'Why you keep getting run over', short: 'The rules you were raised with, and the signals that show people where to push.', chapters: ['The 3 A.M. Replay', 'The Good Person Contract', 'How They Read You', 'The Voice in Your Head', 'Caring Too Much'] },
  { n: 'II', icon: 'sprout', title: 'The reset', short: 'A 3-day quick start, then 21 days of short daily drills, about fifteen minutes a day.', chapters: ['The 3-Day Quick Start', 'How the 21 Days Work', 'Week 1, Notice', 'Week 2, Pause', 'Week 3, Hold'] },
  { n: 'III', icon: 'eye', title: 'The tactics people use on you', short: 'What each one looks like, what it is for, and the calm words that stop it.', chapters: ['Guilt and Obligation', 'Rewriting the Past', 'Withdrawal', 'Charm and Pressure', 'The Slow Squeeze', 'Intimidation', 'Manipulation at Scale', 'How Groups Pull You In'] },
  { n: 'IV', icon: 'queen', title: 'Quiet power', short: 'Being heard without a fight, asking for what you are owed, and making it stick.', chapters: ['What People Really Want', 'How You Come Across', 'Being Heard Without a Fight', 'Getting What You’re Owed', 'Changing the Frame', 'Office Politics and Alliances', 'Making It Stick', 'The Line You Don’t Cross'] },
];

function PartsHeading() {
  return (
    <div className="grid lg:grid-cols-12 gap-x-12 mb-14">
      <div className="lg:col-span-7">
        <p className="sp2-kicker">Four parts, in this order</p>
        <h2 className="sp2-display sp2-h2">Protect yourself first. Then learn quiet power.</h2>
      </div>
      <p className="lg:col-span-4 lg:col-start-9 lg:pt-14 sp2-note">Influence comes last, on purpose. Without a no, it is just people-pleasing with better technique.</p>
    </div>
  );
}

/** P1: four columns with an icon and one line each; chapters open on tap. */
export function PartsP1() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <PartsHeading />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
        {PARTS.map((p, i) => (
          <div key={p.n} className="border-t-2 border-[color:var(--sp2-ink)] pt-6">
            <div className="flex items-start justify-between">
              <Icon name={p.icon} className="w-16 h-16" />
              <span className="sp2-display text-[56px] leading-none text-[color:var(--sp2-accent)]">{p.n}</span>
            </div>
            <h3 className="sp2-display text-[30px] leading-tight mt-4">{p.title}</h3>
            <p className="mt-2 text-[color:var(--sp2-muted)]">{p.short}</p>
            <button onClick={() => setOpen(open === i ? null : i)} className="mt-4 sp2-small underline underline-offset-4 decoration-[color:var(--sp2-accent)] min-h-[44px]">
              {open === i ? 'Hide the chapters' : `See the ${p.chapters.length} chapters`}
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden sp2-small space-y-1">
                  {p.chapters.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="text-[color:var(--sp2-accent)]">&mdash;</span>
                      {c}
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/** P2: tabs with icons; one part at a time, shown like an open book page. */
export function PartsP2() {
  const [i, setI] = useState(0);
  const p = PARTS[i];
  return (
    <div>
      <PartsHeading />
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
        {PARTS.map((x, k) => (
          <button key={x.n} onClick={() => setI(k)} className={`flex flex-col items-center gap-2 py-4 px-1 border-b-4 ${k === i ? 'border-[color:var(--sp2-oxblood)]' : 'border-transparent opacity-55 hover:opacity-100'}`}>
            <Icon name={x.icon} className="w-12 h-12 sm:w-14 sm:h-14" />
            <span className="sp2-display text-[22px] sm:text-[26px] leading-none">Part {x.n}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 bg-[#fdfbf6] shadow-[0_30px_50px_-34px_rgba(28,27,24,0.55)]">
          <div className="p-8 sm:p-12 md:border-r md:border-[color:var(--sp2-line)]">
            <p className="sp2-display text-[90px] leading-[0.8] text-[color:var(--sp2-accent)]">{p.n}</p>
            <h3 className="sp2-display text-[36px] sm:text-[44px] leading-[1.05] mt-4">{p.title}</h3>
            <p className="sp2-lead mt-4 text-[color:var(--sp2-muted)]">{p.short}</p>
          </div>
          <div className="p-8 sm:p-12">
            <p className="sp2-kicker">Chapters</p>
            <ol className="space-y-2.5">
              {p.chapters.map((c, k) => (
                <li key={c} className="flex gap-4 text-[20px] border-b border-dotted border-[color:var(--sp2-line)] pb-2">
                  <span className="sp2-type text-[color:var(--sp2-accent)] min-w-[24px]">{k + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** P3: a staircase; each part is a step up, from protecting yourself to quiet power. */
export function PartsP3() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <PartsHeading />
      <div className="grid md:grid-cols-4 gap-6 md:gap-0 md:items-end">
        {PARTS.map((p, i) => (
          <div key={p.n} className="relative">
            <div className="flex flex-col">
              <div className="px-4 md:px-6 pb-5">
                <Icon name={p.icon} className="w-14 h-14 md:w-16 md:h-16" />
                <h3 className="sp2-display text-[26px] md:text-[28px] leading-tight mt-3">{p.title}</h3>
                <button onClick={() => setOpen(open === i ? null : i)} className="sp2-small underline underline-offset-4 decoration-[color:var(--sp2-accent)] mt-2 min-h-[44px] text-left">
                  {open === i ? 'Close' : 'What’s in it'}
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-[18px] leading-snug text-[color:var(--sp2-muted)]">
                      {p.short} {p.chapters.length} chapters.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {/* The step itself: taller each time */}
              <div className="border-t-[3px] border-[color:var(--sp2-ink)] md:border-r-[3px] bg-[repeating-linear-gradient(135deg,transparent_0,transparent_9px,rgba(28,27,24,0.07)_9px,rgba(28,27,24,0.07)_10px)] flex items-start px-4 md:px-6 pt-3" style={{ height: `${70 + i * 55}px` }}>
                <span className="sp2-display text-[44px] leading-none text-[color:var(--sp2-accent)]">{p.n}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between sp2-note mt-4">
        <span>Protect yourself</span>
        <span>Quiet power &rarr;</span>
      </div>
    </div>
  );
}


/** P3 again, with each part's description written out under its title (no buttons). */
export function PartsP3Open() {
  return (
    <div>
      <PartsHeading />
      <div className="grid md:grid-cols-4 gap-6 md:gap-0 md:items-end">
        {PARTS.map((p, i) => (
          <div key={p.n} className="flex flex-col">
            <div className="px-4 md:px-6 pb-5">
              <Icon name={p.icon} className="w-14 h-14 md:w-16 md:h-16" />
              <h3 className="sp2-display text-[26px] md:text-[28px] leading-tight mt-3">{p.title}</h3>
              <p className="text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-2">{p.short}</p>
              <p className="sp2-note mt-2">{p.chapters.length} chapters</p>
            </div>
            <div
              className="border-t-[3px] border-[color:var(--sp2-ink)] md:border-r-[3px] bg-[repeating-linear-gradient(135deg,transparent_0,transparent_9px,rgba(28,27,24,0.07)_9px,rgba(28,27,24,0.07)_10px)] flex items-start px-4 md:px-6 pt-3"
              style={{ height: `${70 + i * 55}px` }}
            >
              <span className="sp2-display text-[44px] leading-none text-[color:var(--sp2-accent)]">{p.n}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between sp2-note mt-4">
        <span>Protect yourself</span>
        <span>Quiet power &rarr;</span>
      </div>
    </div>
  );
}

/* ═══════════════ F. Is it for you? ═══════════════ */

const FOR = ['You say yes, then resent it', 'You apologize for things you did not do', 'You replay conversations long after they end', 'People call you “the nice one,” and you are tired of what it costs', 'You want to stay kind, just stop being easy to use'];
const NOT_FOR = ['You want tricks to control or deceive people', 'You are looking for a replacement for therapy', 'You want to read about it without practicing it', 'You are in danger right now (please use the hotline in the questions below)'];

/** F1: two clean columns; big ink check and cross heading each one; shorter, larger lines. */
export function ForF1() {
  return (
    <div className="grid md:grid-cols-2 gap-x-20 gap-y-14">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <img src={`${INK}/check.png`} alt="" aria-hidden className="w-16 h-16" />
          <p className="sp2-display text-[40px] leading-none">For you if&hellip;</p>
        </div>
        {FOR.map((t) => (
          <p key={t} className="sp2-display text-[26px] leading-snug py-4 border-t border-[color:var(--sp2-line)]">
            {t}
          </p>
        ))}
      </div>
      <div className="md:pt-0">
        <div className="flex items-center gap-4 mb-6">
          <svg viewBox="0 0 40 40" className="w-14 h-14" aria-hidden>
            <path d="M8,9 C16,17 24,25 33,32 M31,8 C23,17 16,24 9,33" stroke="#7a2e22" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </svg>
          <p className="sp2-display text-[40px] leading-none text-[color:var(--sp2-muted)]">Not for you if&hellip;</p>
        </div>
        {NOT_FOR.map((t) => (
          <p key={t} className="text-[20px] leading-snug py-4 border-t border-[color:var(--sp2-line)] text-[color:var(--sp2-muted)]">
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}

/** F2: notes pinned to the page; the "not for you" notes are struck through in red. */
export function ForF2() {
  const tilts = [-2, 1.5, -1, 2, -1.5];
  return (
    <div className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8">
        <p className="sp2-display text-[40px] mb-8">This is for you if&hellip;</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {FOR.map((t, i) => (
            <div key={t} className="relative bg-[#f6eabf] p-6 shadow-[0_14px_22px_-16px_rgba(28,27,24,0.55)]" style={{ transform: `rotate(${tilts[i]}deg)` }}>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[color:var(--sp2-oxblood)] shadow-[0_2px_2px_rgba(0,0,0,0.3)]" />
              <p className="sp2-display text-[24px] leading-snug">{t}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4">
        <p className="sp2-display text-[32px] mb-6 text-[color:var(--sp2-muted)]">Not for you if&hellip;</p>
        {NOT_FOR.map((t) => (
          <p key={t} className="text-[19px] leading-snug py-3 border-t border-[color:var(--sp2-line)] text-[color:var(--sp2-muted)] line-through decoration-[color:var(--sp2-oxblood)] decoration-2">
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}

/** F3: written as one paragraph you read about yourself, with the key phrases highlighted. */
export function ForF3() {
  return (
    <div className="max-w-[900px] mx-auto text-center">
      <p className="sp2-kicker">This is for you if</p>
      <p className="sp2-display text-[30px] sm:text-[42px] leading-[1.35]">
        You <mark className="sp2-hl">say yes, then resent it.</mark> You <mark className="sp2-hl">apologize</mark> for things you didn&apos;t do. You{' '}
        <mark className="sp2-hl">replay conversations</mark> long after they end. People call you{' '}
        <span className="relative inline-block italic">
          &ldquo;the nice one,&rdquo;
          <Mark name="underline" red className="left-0 -bottom-1 w-full h-3" />
        </span>{' '}
        and you&apos;re tired of what it costs. You want to stay kind. You just want to <mark className="sp2-hl">stop being easy to use.</mark>
      </p>
      <div className="mt-14 inline-block text-left border-t border-[color:var(--sp2-line)] pt-6">
        <p className="sp2-note mb-3">It isn&apos;t for you if:</p>
        {NOT_FOR.map((t) => (
          <p key={t} className="flex gap-3 items-start text-[18px] leading-snug py-1.5 text-[color:var(--sp2-muted)]">
            <img src={`${INK}/cross-red.png`} alt="" aria-hidden className="w-6 h-3 mt-2 flex-shrink-0" />
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}


/** F4: "Is it for you?" in the U1 style: an icon per point, then the not-for-you list crossed out underneath. */
const FOR_ICONS = ['hand', 'speech', 'moon', 'house', 'compass'];
const NOT_ICONS = ['push', 'head', 'book', 'shield'];

export function ForF4() {
  return (
    <div>
      <p className="sp2-display text-[30px] mb-8">This is for you if&hellip;</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
        {FOR.map((t, i) => (
          <div key={t} className="text-center">
            <Icon name={FOR_ICONS[i]} className="w-16 h-16 mx-auto" />
            <p className="sp2-display text-[22px] leading-tight mt-3">{t}</p>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 40 80" className="w-8 h-16 mx-auto my-10" aria-hidden>
        <path d="M20,4 C18,26 22,46 20,72 M9,58 L20,74 L31,57" stroke="#1c1b18" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="max-w-[980px] mx-auto">
        <p className="sp2-display text-[30px] text-center mb-8 text-[color:var(--sp2-muted)]">It isn&apos;t for you if&hellip;</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {NOT_FOR.map((t, i) => (
            <div key={t} className="text-center">
              <Icon name={NOT_ICONS[i]} className="w-12 h-12 mx-auto opacity-60" />
              <p className="text-[18px] leading-snug mt-3 text-[color:var(--sp2-muted)] line-through decoration-[color:var(--sp2-oxblood)] decoration-2">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* The "not for you" half of F4, shared by F5 and F6. */
function NotForRow() {
  return (
    <>
      <svg viewBox="0 0 40 80" className="w-8 h-16 mx-auto my-10" aria-hidden>
        <path d="M20,4 C18,26 22,46 20,72 M9,58 L20,74 L31,57" stroke="#1c1b18" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="max-w-[980px] mx-auto">
        <p className="sp2-display text-[30px] text-center mb-8 text-[color:var(--sp2-muted)]">It isn&apos;t for you if&hellip;</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {NOT_FOR.map((t, i) => (
            <div key={t} className="text-center">
              <Icon name={NOT_ICONS[i]} className="w-12 h-12 mx-auto opacity-60" />
              <p className="text-[18px] leading-snug mt-3 text-[color:var(--sp2-muted)] line-through decoration-[color:var(--sp2-oxblood)] decoration-2">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function InlineIcon({ name }: { name: string }) {
  return <img src={`/v2/icons/${name}.png`} alt="" aria-hidden className="inline-block w-10 h-10 sm:w-12 sm:h-12 object-contain align-middle -mt-2 mr-1.5" />;
}

/** F5: the F3 paragraph, with a small icon starting each sentence; then the F4 "not for you" row. */
export function ForF5() {
  return (
    <div>
      <div className="max-w-[920px] mx-auto text-center">
        <p className="sp2-kicker">This is for you if</p>
        <p className="sp2-display text-[28px] sm:text-[40px] leading-[1.45]">
          <InlineIcon name="hand" />
          You <mark className="sp2-hl">say yes, then resent it.</mark> <InlineIcon name="speech" />
          You <mark className="sp2-hl">apologize</mark> for things you didn&apos;t do. <InlineIcon name="moon" />
          You <mark className="sp2-hl">replay conversations</mark> long after they end. <InlineIcon name="house" />
          People call you{' '}
          <span className="relative inline-block italic">
            &ldquo;the nice one,&rdquo;
            <Mark name="underline" red className="left-0 -bottom-1 w-full h-3" />
          </span>{' '}
          and you&apos;re tired of what it costs. <InlineIcon name="compass" />
          You want to stay kind. You just want to <mark className="sp2-hl">stop being easy to use.</mark>
        </p>
      </div>
      <NotForRow />
    </div>
  );
}

/** F6: a row of five icons above the F3 paragraph (one per sentence); then the F4 "not for you" row. */
export function ForF6() {
  return (
    <div>
      <div className="max-w-[920px] mx-auto text-center">
        <div className="flex justify-center gap-4 sm:gap-10 mb-8">
          {FOR_ICONS.map((n) => (
            <Icon key={n} name={n} className="w-12 h-12 sm:w-16 sm:h-16" />
          ))}
        </div>
        <p className="sp2-kicker">This is for you if</p>
        <p className="sp2-display text-[30px] sm:text-[42px] leading-[1.35]">
          You <mark className="sp2-hl">say yes, then resent it.</mark> You <mark className="sp2-hl">apologize</mark> for things you didn&apos;t do. You{' '}
          <mark className="sp2-hl">replay conversations</mark> long after they end. People call you{' '}
          <span className="relative inline-block italic">
            &ldquo;the nice one,&rdquo;
            <Mark name="underline" red className="left-0 -bottom-1 w-full h-3" />
          </span>{' '}
          and you&apos;re tired of what it costs. You want to stay kind. You just want to <mark className="sp2-hl">stop being easy to use.</mark>
        </p>
      </div>
      <NotForRow />
    </div>
  );
}


/** F7: F5 with each sentence on its own line, its icon in a column on the left. */
export function ForF7() {
  const lines: [string, React.ReactNode][] = [
    ['hand', <>You <mark className="sp2-hl">say yes, then resent it.</mark></>],
    ['speech', <>You <mark className="sp2-hl">apologize</mark> for things you didn&apos;t do.</>],
    ['moon', <>You <mark className="sp2-hl">replay conversations</mark> long after they end.</>],
    [
      'house',
      <>
        People call you{' '}
        <span className="relative inline-block italic">
          &ldquo;the nice one,&rdquo;
          <Mark name="underline" red className="left-0 -bottom-1 w-full h-3" />
        </span>{' '}
        and you&apos;re tired of what it costs.
      </>,
    ],
    ['compass', <>You want to stay kind. You just want to <mark className="sp2-hl">stop being easy to use.</mark></>],
  ];
  return (
    <div>
      <div className="max-w-[1120px] mx-auto">
        <p className="sp2-kicker text-center">This is for you if</p>
        <div className="mt-4">
          {lines.map(([icon, text]) => (
            <div key={icon} className="flex items-center gap-5 sm:gap-7 py-4 sm:py-5 border-b border-[color:var(--sp2-line)] last:border-b-0">
              <Icon name={icon} className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" />
              <p className="sp2-display text-[26px] sm:text-[36px] leading-[1.25]">{text}</p>
            </div>
          ))}
        </div>
      </div>
      <NotForRow />
    </div>
  );
}

/* ═══════════════ U. The usual fixes ═══════════════ */

const FIXES = [
  { icon: 'speech', t: 'Venting to friends', d: 'Feels better for an evening. Nothing changes on Monday.' },
  { icon: 'book', t: 'Books that explain why', d: 'Knowing why you say yes rarely changes what you do.' },
  { icon: 'ice', t: 'Getting harder and colder', d: 'It isn’t who you are, and it costs you people you love.' },
  { icon: 'scissors', t: 'Cutting everyone off', d: 'Often impossible: it’s your mother, your boss, your partner.' },
  { icon: 'hourglass', t: 'Waiting for them to change', d: 'They have no reason to. The deal works for them.' },
];
const CHANGES = ['Spot the move while it is happening', 'Calm words for each tactic, ready to say out loud', 'A 21-day practice plan, fifteen minutes a day', 'You stay kind. You just stop being easy to use.'];

function FixesHeading() {
  return (
    <div className="mb-12">
      <p className="sp2-kicker">What people usually try</p>
      <h2 className="sp2-display sp2-h2 max-w-[18ch]">The usual fixes, and what actually changes it.</h2>
    </div>
  );
}

/** U1: five icons in a row, each fix struck through, then what changes it underneath. */
export function FixesU1() {
  return (
    <div>
      <FixesHeading />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
        {FIXES.map((f) => (
          <div key={f.t} className="text-center">
            <Icon name={f.icon} className="w-16 h-16 mx-auto opacity-80" />
            <p className="sp2-display text-[22px] leading-tight mt-3 line-through decoration-[color:var(--sp2-oxblood)] decoration-2">{f.t}</p>
            <p className="text-[17px] leading-snug text-[color:var(--sp2-muted)] mt-2">{f.d}</p>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 40 80" className="w-8 h-16 mx-auto my-10" aria-hidden>
        <path d="M20,4 C18,26 22,46 20,72 M9,58 L20,74 L31,57" stroke="#1c1b18" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="max-w-[820px] mx-auto text-center">
        <p className="sp2-display text-[34px] sm:text-[44px]">What changes it is practice in the moment.</p>
        <div className="grid sm:grid-cols-2 gap-x-10 mt-8 text-left">
          {CHANGES.map((t) => (
            <p key={t} className="flex gap-3 items-start py-3 border-t border-[color:var(--sp2-line)]">
              <img src={`${INK}/check.png`} alt="" aria-hidden className="w-7 h-7 flex-shrink-0" />
              {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** U2: the fixes on a torn scrap, crossed out; beside it the book, with what it does. */
export function FixesU2() {
  return (
    <div>
      <FixesHeading />
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative bg-[#ece4d4] p-8 sm:p-10 rotate-[-1deg]" style={{ clipPath: 'polygon(0 2%,6% 0,14% 2%,22% 0,31% 1.5%,40% 0,52% 2%,63% 0,72% 1.5%,83% 0,92% 2%,100% 0,100% 100%,0 100%)' }}>
          <p className="sp2-note mb-4">Tried that.</p>
          {FIXES.map((f) => (
            <div key={f.t} className="flex gap-4 items-start py-3 border-t border-[#d1c6b2] first:border-t-0">
              <Icon name={f.icon} className="w-10 h-10 opacity-60 flex-shrink-0" />
              <div>
                <p className="text-[20px] font-semibold line-through decoration-[color:var(--sp2-oxblood)] decoration-2 text-[color:var(--sp2-muted)]">{f.t}</p>
                <p className="text-[17px] text-[color:var(--sp2-muted)]">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-5 lg:col-start-8 text-center lg:text-left">
          <img src="/v2/img/hero-opt-night.webp" alt="" className="w-[80%] max-w-[380px] mx-auto lg:mx-0" />
          <p className="sp2-display text-[32px] mt-6">What actually changes it</p>
          {CHANGES.map((t) => (
            <p key={t} className="flex gap-3 items-start py-3 border-t border-[color:var(--sp2-line)] text-left">
              <img src={`${INK}/check.png`} alt="" aria-hidden className="w-7 h-7 flex-shrink-0" />
              {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** U3: one fix at a time: tap through them, each ends in why it doesn't work. */
export function FixesU3() {
  const [i, setI] = useState(0);
  const done = i >= FIXES.length;
  const f = FIXES[Math.min(i, FIXES.length - 1)];
  return (
    <div>
      <FixesHeading />
      <div className="max-w-[760px] mx-auto text-center min-h-[380px]">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Icon name={f.icon} className="w-24 h-24 mx-auto" />
              <p className="sp2-type text-[18px] text-[color:var(--sp2-accent)] mt-4">
                FIX {i + 1} OF {FIXES.length}
              </p>
              <p className="sp2-display text-[44px] sm:text-[56px] leading-tight mt-1 line-through decoration-[color:var(--sp2-oxblood)] decoration-[3px]">{f.t}</p>
              <p className="sp2-lead mt-4 text-[color:var(--sp2-muted)]">{f.d}</p>
              <button onClick={() => setI(i + 1)} className="sp2-btn sp2-btn-ghost mt-8 !min-h-[56px]">
                {i === FIXES.length - 1 ? 'So what does work?' : 'Next fix'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="sp2-display text-[44px] sm:text-[56px] leading-tight">Practice in the moment.</p>
              <div className="text-left mt-8 max-w-[520px] mx-auto">
                {CHANGES.map((t) => (
                  <p key={t} className="flex gap-3 items-start py-3 border-t border-[color:var(--sp2-line)]">
                    <img src={`${INK}/check.png`} alt="" aria-hidden className="w-7 h-7 flex-shrink-0" />
                    {t}
                  </p>
                ))}
              </div>
              <button onClick={() => setI(0)} className="sp2-small underline underline-offset-4 mt-6">
                Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════ A. The companion app phone ═══════════════ */

function AppText() {
  return (
    <div>
      <p className="sp2-kicker">Included: 60 days of the companion app</p>
      <h2 className="sp2-display sp2-h2">Paste their message. See the tactic. Get a calm reply.</h2>
      <p className="sp2-body mt-6 max-w-[30em]">Paste a message or a screenshot. It names the tactic and suggests a calm reply. Then rehearse the hard conversation and follow the 21-day reset.</p>
    </div>
  );
}

/** A1: a real phone photo, with hand-written notes pointing at each part of the screen. */
export function AppA1() {
  const notes = [
    { top: '22%', text: 'Paste their message' },
    { top: '47%', text: 'It names the tactic' },
    { top: '70%', text: 'A calm reply to send' },
  ];
  return (
    <div className="grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6">
        <AppText />
      </div>
      <div className="lg:col-span-5 lg:col-start-8 relative">
        <img src="/v2/img/app-phone.webp" alt="The Decoder screen in the companion app" className="w-[78%] max-w-[340px] mx-auto rotate-[2deg] drop-shadow-[0_40px_40px_rgba(0,0,0,0.35)]" />
        {notes.map((n) => (
          <div key={n.text} className="hidden lg:flex absolute -left-[170px] items-center gap-2" style={{ top: n.top }}>
            <span className="sp2-note max-w-[130px] text-right leading-tight">{n.text}</span>
            <img src={`${INK}/arrow.png`} alt="" aria-hidden className="w-[64px] -scale-y-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A2: three phones fanned out, one per feature. */
export function AppA2() {
  return (
    <div>
      <div className="max-w-[760px]">
        <AppText />
      </div>
      <div className="relative h-[540px] sm:h-[640px] mt-12 max-w-[900px] mx-auto">
        <img src="/v2/img/app-phone-rehearse.webp" alt="Rehearse a hard conversation" className="absolute left-[4%] sm:left-[10%] top-[60px] w-[44%] sm:w-[30%] -rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" />
        <img src="/v2/img/app-phone-reset.webp" alt="The 21-day reset" className="absolute right-[4%] sm:right-[10%] top-[60px] w-[44%] sm:w-[30%] rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" />
        <img src="/v2/img/app-phone.webp" alt="The Decoder" className="absolute left-1/2 -translate-x-1/2 top-0 w-[50%] sm:w-[34%] z-10 drop-shadow-[0_40px_40px_rgba(0,0,0,0.4)]" />
      </div>
      <div className="grid grid-cols-3 gap-4 text-center max-w-[900px] mx-auto mt-4">
        {[
          ['Rehearse', 'Practice with an AI that plays the other person.'],
          ['Decode', 'See the tactic and get a calm reply.'],
          ['Reset', 'Your 21 days, one drill at a time.'],
        ].map(([a, b]) => (
          <div key={a}>
            <p className="sp2-display text-[26px]">{a}</p>
            <p className="text-[17px] leading-snug text-[color:var(--sp2-muted)]">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A3: the live, animated Decoder (it types the message and answers), inside the real phone frame. */
export function AppA3() {
  return (
    <div className="grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6">
        <AppText />
        <p className="sp2-note mt-6">It plays when it scrolls into view.</p>
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <div className="relative w-[340px] max-w-full mx-auto -rotate-[2deg]">
          <img src="/v2/img/app-phone-frame.webp" alt="" aria-hidden className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.35)]" />
          {/* The animated screen sits exactly in the photo's screen area */}
          <div className="absolute overflow-hidden rounded-[34px]" style={{ left: '4.68%', top: '2.24%', width: '89.97%', height: '95.48%' }}>
            <div className="[&>div]:!w-full [&>div]:!border-0 [&>div]:!rounded-none [&>div]:!shadow-none [&>div]:h-full">
              <DecoderPhone />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
