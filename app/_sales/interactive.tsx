'use client';

/* Animated diagrams and interactive pieces for the v2 sales page.
   Several are rebuilt from the original site's sections (rolodex, scenario
   simulator, dossier breakdown, progression path), recolored to the book. */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { pageRef } from './pageRef';

/** Splits `[[marked]]` parts out of a string so a page can choose how to mark them. */
export function marked(text: string, mark: (s: string, i: number) => React.ReactNode) {
  return text.split(/(\[\[[^\]]+\]\])/g).map((s, i) => (s.startsWith('[[') ? mark(s.slice(2, -2), i) : s));
}

/* ───────────── The nice-person loop (animated circle diagram) ───────────── */

const LOOP = [
  { icon: 'push', t: 'They push' },
  { icon: 'smooth', t: 'You give in' },
  { icon: 'learn', t: 'It works' },
  { icon: 'weight', t: 'They push harder' },
];

/* Point on the loop's circle at a clockwise angle from the top (viewBox 400, radius 150). */
const C = 200;
const R = 150;
const at = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  // Rounded so the server and the browser produce exactly the same numbers.
  return { x: Math.round((C + r * Math.sin(a)) * 100) / 100, y: Math.round((C - r * Math.cos(a)) * 100) / 100 };
};

/**
 * The nice-person loop: four icon steps round a circle, joined by arrows that point clockwise.
 * The arrows draw in, then a light travels round and each step lights up as it arrives.
 */
export function NiceLoop({ steps = LOOP, center }: { steps?: { icon: string; t: string }[]; center?: React.ReactNode } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [step, setStep] = useState(0); // keeps counting up so the light always moves forward
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setStep((x) => x + 1), 2200);
    return () => clearInterval(id);
  }, [inView]);
  const current = step % steps.length;
  return (
    <div ref={ref} className="relative mx-auto w-[calc(100%-40px)] max-w-[460px] aspect-square">
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
        {steps.map((_, i) => {
          // An arc from just after one step to just before the next, with its arrowhead at the end.
          const from = i * 90 + 24;
          const to = i * 90 + 66;
          const p0 = at(from);
          const p1 = at(to);
          const tip = at(to + 2);
          const back = at(to - 6, R - 9);
          const back2 = at(to - 6, R + 9);
          return (
            <g key={i}>
              <motion.path
                d={`M${p0.x},${p0.y} A${R},${R} 0 0 1 ${p1.x},${p1.y}`}
                fill="none"
                stroke="#8a5a2b"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.35, duration: 0.5 }}
              />
              <motion.path
                d={`M${back.x},${back.y} L${tip.x},${tip.y} L${back2.x},${back2.y}`}
                fill="none"
                stroke="#8a5a2b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.85 + i * 0.35 }}
              />
            </g>
          );
        })}
        {/* The travelling light */}
        <g style={{ transform: `rotate(${step * 90}deg)`, transformOrigin: '200px 200px', transformBox: 'view-box', transition: 'transform 1.6s cubic-bezier(.6,0,.3,1)', opacity: inView ? 1 : 0 }}>
          <circle cx={C} cy={C - R} r="16" fill="#c9a46b" opacity="0.3" />
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="sp2-display italic text-[20px] sm:text-[34px] leading-[1.05] text-center max-w-[46%]">
          {center ?? (
            <>
              The <span className="whitespace-nowrap">nice-person</span>
              <br />
              loop
            </>
          )}
        </p>
      </div>

      {steps.map((n, i) => {
        const p = at(i * 90);
        const lit = inView && current === i;
        return (
          <motion.div
            key={n.t}
            className="absolute flex flex-col items-center w-[120px]"
            style={{ left: `${(p.x / 4).toFixed(2)}%`, top: `${(p.y / 4).toFixed(2)}%`, x: '-50%', y: '-36px' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 + i * 0.35, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <div
              className={`w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-[#fdfbf6] border-2 flex items-center justify-center transition-all duration-500 ${
                lit ? 'border-[color:var(--sp2-oxblood)] scale-110 shadow-[0_12px_24px_-12px_rgba(122,46,34,0.6)]' : 'border-[color:var(--sp2-ink)]'
              }`}
            >
              <Icon name={n.icon} className="w-11 h-11 sm:w-14 sm:h-14" />
            </div>
            <p className={`sp2-display text-[20px] sm:text-[22px] leading-tight text-center mt-1 px-1.5 bg-[color:var(--sp2-paper)] transition-colors duration-500 ${lit ? 'text-[color:var(--sp2-oxblood)]' : ''}`}>{n.t}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/** A custom linocut icon from public/v2/icons. */
function Icon({ name, className = 'w-16 h-16' }: { name: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/v2/icons/${name}.png`} alt="" aria-hidden className={`object-contain ${className}`} />;
}

/* ───────────── The way out: Notice, Pause, Hold ───────────── */

// Notice, Pause, Hold is a tool from Chapter 5, and the shape of the 21-day Reset (Part VII).
const STEPS = [
  { icon: 'eye', name: 'Notice', week: 'Week 1', body: 'See the pattern while it is happening: the fast yes, the third Friday request, the sigh.' },
  { icon: 'hourglass', name: 'Pause', week: 'Week 2', body: 'Make room to choose. Often that is one sentence that buys time.' },
  { icon: 'hand', name: 'Hold', week: 'Week 3', body: 'Follow through on what you decided, even when someone is disappointed.' },
];

export function WayOut({ steps = STEPS }: { steps?: { icon: string; name: string; week: string; body: string }[] } = {}) {
  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-12 md:gap-4 items-start">
      {steps.map((s, i) => (
        <div key={s.name} className="contents">
          <div className="text-center">
            <Icon name={s.icon} className="w-28 h-28 mx-auto" />
            <p className="sp2-kicker !mb-0 mt-5">{s.week}</p>
            <p className="sp2-display text-[48px] leading-tight">{s.name}</p>
            <p className="mt-2 text-[color:var(--sp2-muted)] max-w-[16em] mx-auto">{s.body}</p>
          </div>
          {i < steps.length - 1 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/v2/ink/arrow2.png" alt="" aria-hidden className="hidden md:block w-[70px] mt-10 -rotate-[100deg] opacity-80" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────── Exhibit A: an intercepted message (from DossierAnalysis) ───────────── */

// Replies from Chapter 7 (The ledger) and Chapter 26 (When past help becomes a claim on your time).
const REPLY_OPTIONS = [
  {
    id: 'A',
    title: 'Acknowledge the help. Decline the request.',
    script: '"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."',
    why: 'You agree with the true part (they have helped you) without agreeing that you now owe this favor. Chapter 7.',
  },
  {
    id: 'B',
    title: 'The warmer version',
    script: '"I remember, and it meant a lot. This one doesn\'t work for me."',
    why: 'Don\'t start listing what you have done for them. That agrees you are both keeping score, and invites a long argument about who owes whom.',
  },
  {
    id: 'C',
    title: 'Offer what you can, if you want to',
    script: '"I appreciated that help, a lot. I can drive you Tuesday. I can\'t do the whole week."',
    why: 'You can give part of what is asked. Only offer what you will actually do. Chapter 26, When past help becomes a claim on your time.',
  },
];

type ReplyOption = { id: string; title: string; script: string; why: string };

/** Optional: who it's from, the message (`[[words]]` get highlighted), the three facts and the three replies. */
export function InterceptedMessage({
  from = 'MOM',
  text,
  facts,
  replies = REPLY_OPTIONS,
}: { from?: string; text?: string; facts?: [string, string][]; replies?: ReplyOption[] } = {}) {
  const [sel, setSel] = useState(replies[0].id);
  const opt = replies.find((o) => o.id === sel) ?? replies[0];
  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-start">
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
          <span className="flex items-center gap-3">
            <motion.span
              className="block w-2.5 h-2.5 rounded-full bg-[color:var(--sp2-gold)]"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="sp2-type text-[16px] tracking-[0.2em] text-[color:var(--sp2-gold)]">INCOMING MESSAGE</span>
          </span>
          <span className="sp2-type text-[16px] text-white/75">FROM: {from}</span>
        </div>
        <div className="relative rounded-lg border border-white/10 bg-[#1d1914] p-6 sm:p-8">
          <p className="text-[24px] sm:text-[30px] leading-snug text-[#efe9df]">
            {text ? (
              <>
                &ldquo;
                {marked(text, (s, i) => (
                  <span key={i} className="relative inline-block">
                    <span className="relative z-10">{s}</span>
                    <motion.span
                      className="absolute inset-x-[-4px] bottom-[2px] top-[55%] bg-[color:var(--sp2-oxblood)] -z-0 rounded-sm"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
                      style={{ originX: 0 }}
                    />
                  </span>
                ))}
                &rdquo;
              </>
            ) : (
              <>
              &ldquo;After{' '}
              <span className="relative inline-block">
                <span className="relative z-10">everything I&apos;ve done for you</span>
                <motion.span
                  className="absolute inset-x-[-4px] bottom-[2px] top-[55%] bg-[color:var(--sp2-oxblood)] -z-0 rounded-sm"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{ originX: 0 }}
                />
              </span>
              , you can&apos;t do{' '}
              <span className="relative inline-block">
                <span className="relative z-10">this one thing</span>
                <motion.span
                  className="absolute inset-x-[-4px] bottom-[2px] top-[55%] bg-[color:var(--sp2-oxblood)] -z-0 rounded-sm"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  style={{ originX: 0 }}
                />
              </span>
              ?&rdquo;
              </>
            )}
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {(
            facts ?? [
              ['Pattern', 'Guilt over past favors'],
              ['Why it works', 'Past kindness becomes a debt, and today\u2019s request becomes the payment'],
              ['How it feels', 'Ungrateful as well as unhelpful if you say no'],
            ]
          ).map(([k, v], i) => (
            <motion.div
              key={k}
              className="rounded-md border border-white/10 bg-white/[0.03] p-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 + i * 0.2 }}
            >
              <p className="sp2-type text-[16px] tracking-[0.18em] text-[color:var(--sp2-gold)] uppercase">{k}</p>
              <p className="text-[17px] leading-snug text-[#e9e2d6] mt-1.5">{v}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#c9a46b]/40 bg-[#1d1914] p-6 sm:p-7">
        <p className="sp2-type text-[16px] tracking-[0.2em] text-[color:var(--sp2-gold)] mb-4">CHOOSE A CALM REPLY</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {replies.map((o) => (
            <button
              key={o.id}
              onClick={() => setSel(o.id)}
              className={`sp2-ui rounded-md border px-2 py-2.5 text-[16px] font-semibold leading-tight transition-colors ${
                sel === o.id
                  ? 'border-[color:var(--sp2-gold)] bg-[color:var(--sp2-gold)] text-[color:var(--sp2-black)]'
                  : 'border-white/15 text-white/85 hover:border-white/40'
              }`}
            >
              Option {o.id}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <p className="sp2-ui text-[16px] font-bold uppercase tracking-wider text-white/80">{opt.title}</p>
            <p className="text-[24px] leading-snug text-white mt-2">{opt.script}</p>
            <p className="text-[17px] leading-relaxed text-[#d8cfc1] mt-4 border-t border-white/10 pt-4">
              <span className="text-[color:var(--sp2-gold)]">Why this helps: </span>
              {opt.why}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────── The tactics, declassified (from DarkPatternRolodex) ───────────── */

// Eight pressure patterns from Part II of the book (Chapters 7 to 11) and Chapter 8's "everyone agrees with me".
export const TACTICS = [
  { name: 'Guilt Over Past Favors', ch: 'Chapter 7', says: '"After everything I\'ve done for you..."', reply: '"You\'ve done a lot for me, and I\'m grateful. I still can\'t do this."', common: 10 },
  { name: 'Denying What Happened', ch: 'Chapter 8', says: '"That never happened. You\'re too sensitive."', reply: '"I remember it differently. Here\'s what I need now."', common: 8 },
  { name: 'The Silent Treatment', ch: 'Chapter 9', says: 'Two days of cold silence after you disagree.', reply: '"I can tell you\'re upset. When you want to talk, I\'m here." Then carry on with your normal life.', common: 8 },
  { name: 'Flattery Before the Ask', ch: 'Chapter 10', says: '"You\'re the only one on the team I trust with this..."', reply: '"That\'s kind of you. I can\'t take it on this week."', common: 7 },
  { name: 'The Favor That Never Ends', ch: 'Chapter 10', says: '"Just until I find a place." Six months ago.', reply: '"Happy to help until the end of March. Let\'s check in then."', common: 9 },
  { name: 'When It Becomes Danger', ch: 'Chapter 11', says: 'Threats, tracking your phone, controlling the money.', reply: 'No clever line here. Trust the fear, and talk to someone trained to help.', common: 6 },
  { name: 'Fake Urgency', ch: 'Chapter 10', says: '"I need an answer by end of day."', reply: '"If it has to be decided now, my answer is no."', common: 9 },
  { name: '"Everyone Agrees With Me"', ch: 'Chapter 8', says: '"Your brother thinks you overreacted."', reply: '"Other people can have their views. I\'m talking with you."', common: 7 },
];

export const TACTIC_ART = ['t-guilt', 't-rewrite', 't-silence', 't-charm', 't-squeeze', 't-intimidate', 't-urgency', 't-group'];

/* One tactic, printed straight on the page (no card); tapping swaps the quote for the calm reply. */
export type Tactic = { name: string; ch: string; says: string; reply: string };

function TacticCell({ t, art, flipped, onFlip }: { t: Tactic; art: string; flipped: boolean; onFlip: () => void }) {
  return (
    <button onClick={onFlip} className="group h-full w-full text-left flex flex-col px-5 pt-4 pb-6" aria-label={`${t.name}: ${flipped ? 'show what they say' : 'show the calm reply'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/v2/lino/${art}.png`} alt="" className="w-[150px] h-[150px] mx-auto object-contain transition-transform duration-300 group-hover:-translate-y-1" loading="lazy" />
      <p className="sp2-kicker !mb-1 mt-2">{t.ch}</p>
      <h3 className="sp2-display text-[28px] leading-[1.1]">{t.name}</h3>
      <AnimatePresence mode="wait">
        <motion.p
          key={flipped ? 'reply' : 'says'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={flipped ? 'sp2-display text-[23px] leading-snug mt-2' : 'italic text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-2'}
        >
          {flipped ? <mark className="sp2-hl">{t.reply}</mark> : t.says}
        </motion.p>
      </AnimatePresence>
      <p className="mt-auto pt-3 text-[17px] font-semibold text-[color:var(--sp2-accent)] underline underline-offset-4 decoration-1 group-hover:decoration-2">
        {flipped ? 'Show what they say' : 'Tap for the calm reply'}
      </p>
    </button>
  );
}

/** Optional: other tactics, with one art name (TACTIC_ART) per tactic. */
export function TacticRolodex({ tactics: all = TACTICS, art: allArt = TACTIC_ART, openFirst = false, skipDanger = false, more }: { tactics?: Tactic[]; art?: string[]; openFirst?: boolean; skipDanger?: boolean; more?: { title: string; text: string } } = {}) {
  // skipDanger: leave out the danger card (the page gives danger its own visible line instead of a reply).
  const keep = all.map((t, i) => i).filter((i) => !(skipDanger && all[i].name.startsWith('When It Becomes Danger')));
  const tactics = keep.map((i) => all[i]);
  const art = keep.map((i) => allArt[i % allArt.length]);
  // openFirst: show the first card's reply without a tap, so the reader sees one answer straight away.
  const [flipped, setFlipped] = useState<Record<number, boolean>>(openFirst ? { 0: true } : {});
  const flip = (i: number) => setFlipped((f) => ({ ...f, [i]: !f[i] }));
  return (
    <>
      {/* Phones: a swipeable row */}
      <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 [scrollbar-width:none] border-y border-[color:var(--sp2-line)]">
        {tactics.map((t, i) => (
          <div key={t.name} className="min-w-[270px] w-[270px] min-h-[420px] flex-shrink-0 snap-center border-r border-[color:var(--sp2-line)] last:border-r-0">
            <TacticCell t={t} art={art[i % art.length]} flipped={!!flipped[i]} onFlip={() => flip(i)} />
          </div>
        ))}
      </div>
      {/* Desktop: a grid divided by thin lines, like a printed page */}
      <div className={`hidden lg:grid ${(tactics.length + (more ? 1 : 0)) % 3 === 0 && (tactics.length + (more ? 1 : 0)) % 4 !== 0 ? 'grid-cols-3' : 'grid-cols-4'} mt-10 border-t border-l border-[color:var(--sp2-line)]`}>
        {tactics.map((t, i) => (
          <div key={t.name} className="min-h-[420px] border-r border-b border-[color:var(--sp2-line)]">
            <TacticCell t={t} art={art[i % art.length]} flipped={!!flipped[i]} onFlip={() => flip(i)} />
          </div>
        ))}
        {more && (
          <div className="min-h-[420px] border-r border-b border-[color:var(--sp2-line)] bg-[color:var(--sp2-night)] text-[#efe7da] flex flex-col justify-center px-6 py-6">
            <p className="sp2-display text-[30px] leading-[1.1] text-[#faf6ee]">{more.title}</p>
            <p className="text-[17px] leading-snug text-[#d8cfc1] mt-3">{more.text}</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────── Old answer vs calm answer (from ScenarioSimulator) ───────────── */

export type Scenario = { tab: string; icon: string; who: string; them: string; old: string; calm: string; note: string };

export const SCENARIOS: Scenario[] = [
  { tab: 'At work', icon: 'briefcase', who: 'Your manager, Friday at 4:40', them: 'Need you on this over the weekend. It\u2019s due Monday.', old: 'Oh, sure, no problem. I\u2019ll make it work.', calm: 'Let me look at what\u2019s already on my plate and tell you in ten minutes.', note: 'The pause, Chapter 5' },
  { tab: 'Family', icon: 'house', who: 'The family group chat', them: 'So we\u2019re all at yours for Christmas again?', old: 'I guess so\u2026 if nobody else can.', calm: 'I haven\u2019t agreed to host this year. I can bring two dishes. Who else has room?', note: 'The Power Map, Chapter 2' },
  { tab: 'Partner', icon: 'rings', who: 'Your partner, after you raised something', them: '(Two days of silence.)', old: 'I\u2019m sorry, I shouldn\u2019t have brought it up. Can we just forget it?', calm: 'I can tell you\u2019re upset. When you want to talk, I\u2019m here.', note: 'Chapter 9, Silence, Distance, and Conditional Warmth' },
  { tab: 'Friends', icon: 'speech', who: 'A friend, with last spring\u2019s loan still open', them: 'Could you spot me again? Just till next month, promise.', old: 'How much do you need? I can move some things around.', calm: 'I\u2019m not able to lend more until the first loan is sorted out. When do you think you can start paying that back?', note: 'The slow squeeze, Chapter 10' },
];

/** Optional: other scenario wording, which tab opens first, and the label on the crossed-out answer. */
export function ScenarioTabs({ scenarios = SCENARIOS, initial = 0, oldLabel = 'the old you' }: { scenarios?: Scenario[]; initial?: number; oldLabel?: string } = {}) {
  const [i, setI] = useState(initial < scenarios.length ? initial : 0);
  const s = scenarios[i];
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 mb-12" role="tablist">
        {scenarios.map((x, k) => (
          <button
            key={x.tab}
            role="tab"
            aria-selected={i === k}
            onClick={() => setI(k)}
            className={`flex items-center gap-3 pl-2 pr-5 py-2 rounded-full border-2 min-h-[56px] ${i === k ? 'border-[color:var(--sp2-ink)] bg-[#fdfbf6]' : 'border-transparent hover:border-[color:var(--sp2-line)]'}`}
          >
            <Icon name={x.icon} className="w-10 h-10" />
            <span className="sp2-display text-[26px]">{x.tab}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-[720px] mx-auto sp2-ui bg-white rounded-[24px] shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] px-5 sm:px-10 py-8 sm:py-10">
          <p className="text-center text-[16px] text-[color:var(--sp2-muted)] mb-6">{s.who}</p>
          <div className="flex">
            <p className="max-w-[78%] bg-[#ece8e1] rounded-[22px] rounded-bl-[6px] px-5 py-3.5 text-[19px] leading-snug">{s.them}</p>
          </div>
          <div className="flex justify-end mt-5 relative">
            <p className="max-w-[78%] bg-[#f3efe8] text-[color:var(--sp2-muted)] rounded-[22px] rounded-br-[6px] px-5 py-3.5 text-[19px] leading-snug line-through decoration-[color:var(--sp2-oxblood)] decoration-2">{s.old}</p>
            <span className="sp2-note absolute left-0 top-2 !text-[17px] rotate-[-4deg] hidden sm:block">{oldLabel}</span>
          </div>
          <div className="flex justify-end mt-3 relative">
            <p className="max-w-[78%] bg-[color:var(--sp2-ink)] text-[#faf6ee] rounded-[22px] rounded-br-[6px] px-5 py-3.5 text-[19px] leading-snug">{s.calm}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/ink/check.png" alt="" aria-hidden className="absolute -right-3 -bottom-5 w-10 h-10" />
          </div>
          <p className="sp2-note text-right mt-8">{s.note}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────── The 21-day reset, as a habit-tracker calendar (days match the journal) ───────────── */

// Day numbers match Part VII of the book and the journal: Days 1-3, 4-7, 8-14, 15-21.
const RESET = [
  { label: 'Days 1 to 3', name: 'The Quick Start', icon: 'sprout', start: 1, count: 3, body: 'Pause before an automatic yes, drop the reflex sorry, then one clean no. Three ordinary days for an early win.' },
  { label: 'Week 1', name: 'Notice', icon: 'eye', start: 4, count: 4, body: 'Count your yeses, catch your clause, draw one Power Map and run one Choice Check on a real situation.' },
  { label: 'Week 2', name: 'Pause and choose', icon: 'hourglass', start: 8, count: 7, body: 'Make the pause your normal answer, find what you want, then make a Clean Ask and one clean no with someone you know.' },
  { label: 'Week 3', name: 'Hold and follow through', icon: 'hand', start: 15, count: 7, body: 'Say it again, let someone be disappointed, propose a trade, confirm the Smallest Agreed Step, and repair a mistake.' },
];

export function ResetPath() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14">
        {RESET.map((w) => (
          <div key={w.label}>
            <div className="flex items-center gap-3">
              <Icon name={w.icon} className="w-14 h-14" />
              <div>
                <p className="sp2-kicker !mb-0">{w.label}</p>
                <p className="sp2-display text-[34px] leading-none">{w.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6 max-w-[260px]">
              {Array.from({ length: w.count }, (_, i) => (
                <div key={i} className="relative aspect-square border-2 border-[color:var(--sp2-ink)]/70 bg-[#fdfbf6] flex items-center justify-center">
                  <span className="sp2-display text-[26px]">{w.start + i}</span>
                  {i === 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/v2/ink/circle-red.png" alt="" aria-hidden className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] max-w-none" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-[color:var(--sp2-muted)]">{w.body}</p>
          </div>
        ))}
      </div>
      <div className="sp2-rule mt-14 pt-8 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
        <p className="sp2-kicker !mb-0 whitespace-nowrap flex-shrink-0">After the reset</p>
        <p>
          <span className="sp2-display text-[30px] mr-3">Keep it going.</span>
          <span className="text-[color:var(--sp2-muted)]">Rotate one practice a week, and when a hard conversation comes up, use the pause and turn to the chapter that fits.</span>
        </p>
      </div>
    </div>
  );
}

/* ───────────── The Decoder, shown on a phone with a typing animation ───────────── */

const DECODER_MSG = "I just think it's funny how you always have time for your friends but never for me. But it's fine. Do whatever you want.";

/** Optional: the message typed out, the bold label and text of what is happening, and the calm reply. */
export function DecoderPhone({
  msg = DECODER_MSG,
  whatBold = 'Guilt plus a test.',
  what = '\u201cIt\u2019s fine\u201d isn\u2019t permission. It sets up a loss either way: stay and resent it, or go and feel guilty.',
  reply = '\u201cIt sounds like you\u2019ve been missing time together. I\u2019m going tonight. Can we plan Saturday, just us?\u201d',
}: { msg?: string; whatBold?: string; what?: string; reply?: string } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const [typed, setTyped] = useState(0);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      setTyped(Math.min(n, msg.length));
      if (n >= msg.length) {
        clearInterval(id);
        setTimeout(() => setStage(1), 500);
        setTimeout(() => setStage(2), 1700);
      }
    }, 28);
    return () => clearInterval(id);
  }, [inView, msg]);
  return (
    <div ref={ref} className="mx-auto w-[300px] sm:w-[330px] rounded-[44px] border-[10px] border-[#2a251e] bg-[#f4efe6] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className="h-7 bg-[#2a251e] flex justify-center">
        <div className="w-24 h-5 rounded-b-xl bg-[#1a1612]" />
      </div>
      <div className="px-4 pt-3 pb-6 min-h-[520px] sp2-ui">
        <p className="text-center text-[16px] font-bold tracking-[0.18em] text-[color:var(--sp2-accent)]">THE DECODER</p>
        <div className="mt-4 rounded-2xl rounded-bl-sm bg-white border border-[color:var(--sp2-line)] p-3.5 text-[17px] leading-snug text-[color:var(--sp2-ink)] min-h-[92px]">
          {msg.slice(0, typed)}
          {typed < msg.length && <span className="inline-block w-[2px] h-4 bg-[color:var(--sp2-ink)] align-middle animate-pulse ml-0.5" />}
        </div>
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div key="what" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-[color:var(--sp2-night)] text-white p-3.5">
              <p className="flex items-center gap-1.5 text-[16px] font-bold tracking-[0.15em] text-[color:var(--sp2-gold)]">
                <Sparkles className="w-3.5 h-3.5" /> WHAT IS HAPPENING
              </p>
              <p className="text-[17px] leading-snug mt-1.5">
                <b>{whatBold}</b> {what}
              </p>
            </motion.div>
          )}
          {stage >= 2 && (
            <motion.div key="reply" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border-2 border-[color:var(--sp2-gold)] bg-white p-3.5">
              <p className="flex items-center gap-1.5 text-[16px] font-bold tracking-[0.15em] text-[color:var(--sp2-accent)]">
                <MessageSquareText className="w-3.5 h-3.5" /> A CALM REPLY
              </p>
              <p className="font-[family-name:var(--font-sp2-serif)] text-[17px] leading-snug mt-1.5">
                {reply}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────── The Good Person Contract: redactions lift as it scrolls in ───────────── */

// The five clauses of The Good Person Contract (Chapter 3).
const CLAUSES = [
  "Other people's feelings are your job.",
  'Your needs are a burden.',
  'Conflict means something went wrong.',
  "If you're good enough, you'll be treated fairly.",
  "If you stop being nice, you'll become one of them.",
];

/** Optional: the document's label, title, clauses, signature line and stamp. */
export function GoodPersonContract({
  docLabel = 'DOCUMENT NO. 1 // NEVER SIGNED, STILL IN FORCE',
  title = 'The Good Person Contract',
  clauses = CLAUSES,
  signed = 'nobody asked you',
  stamp = 'Void',
}: { docLabel?: string; title?: string; clauses?: string[]; signed?: string; stamp?: string } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  return (
    <div ref={ref} className="relative rounded-sm border-2 border-[#c9bda6] bg-[color:var(--sp2-card)] p-7 sm:p-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] sp2-grain rotate-[-0.6deg]">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#c9bda6] pb-4 mb-6">
        <div>
          <p className="sp2-type text-[16px] tracking-[0.2em] text-[color:var(--sp2-muted)]">{docLabel}</p>
          <p className="text-[28px] sm:text-[32px] font-semibold leading-tight mt-1">{title}</p>
        </div>
      </div>
      <ol className="space-y-4">
        {clauses.map((c, i) => (
          <li key={c} className="flex gap-4 text-[20px] sm:text-[22px] leading-snug">
            <span className="sp2-type text-[17px] text-[color:var(--sp2-accent)] pt-1.5">§{i + 1}</span>
            <span className="relative">
              <span className="italic">{c}</span>
              <motion.span
                aria-hidden
                className="absolute inset-y-0 -inset-x-1 bg-[color:var(--sp2-ink)] origin-right"
                initial={{ scaleX: 1 }}
                animate={inView ? { scaleX: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.35, duration: 0.5, ease: 'easeInOut' }}
              />
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="sp2-type text-[16px] text-[color:var(--sp2-muted)]">
          Signed: <span className="font-[family-name:var(--font-sp2-serif)] italic text-[22px] text-[color:var(--sp2-ink)] ml-1">{signed}</span>
        </div>
        <motion.span
          className="sp2-stamp text-[26px] text-[color:var(--sp2-oxblood)]"
          initial={{ opacity: 0, scale: 2.4, rotate: -24 }}
          animate={inView ? { opacity: 0.85, scale: 1, rotate: -14 } : {}}
          transition={{ delay: 2.4, type: 'spring', stiffness: 380, damping: 16 }}
        >
          {stamp}
        </motion.span>
      </div>
    </div>
  );
}

/* ───────────── Look inside: real pages from the book, fanned out ───────────── */

// These page images are still from the previous edition and must be replaced with pages from
// the new book before launch (see book-v3/launch-checklist.md). Alt text describes the intended pages.
const PAGES = [
  { src: '/v2/pages/page-1.jpg', alt: 'The contents page' },
  { src: '/v2/pages/page-2.jpg', alt: 'Chapter 3, The Rules You Never Chose' },
  { src: '/v2/pages/page-3.jpg', alt: 'Chapter 7, Guilt, Favors, and Hidden Debts' },
  { src: '/v2/pages/page-4.jpg', alt: 'A worked conversation' },
  { src: '/v2/pages/page-5.jpg', alt: 'A day from the 21-Day Power Reset' },
];

export function LookInside() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:hidden [scrollbar-width:none]">
        {PAGES.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} className="snap-center flex-shrink-0 w-[62%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} className="w-full rounded-sm shadow-xl border border-[color:var(--sp2-line)]" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="relative hidden md:block h-[460px]">
        {PAGES.map((p, i) => {
          const off = i - 2;
          return (
            <motion.button
              key={p.src}
              onClick={() => setOpen(i)}
              className="absolute left-1/2 top-4 w-[250px] focus:outline-none"
              style={{ zIndex: 10 - Math.abs(off) }}
              initial={{ x: '-50%', rotate: 0, y: 30, opacity: 0 }}
              whileInView={{ x: `calc(-50% + ${off * 170}px)`, rotate: off * 4, y: Math.abs(off) * 14, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ type: 'spring', stiffness: 110, damping: 16, delay: 0.05 * i }}
              whileHover={{ y: -18, scale: 1.06, rotate: 0, zIndex: 40 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="w-full rounded-sm shadow-2xl border border-[color:var(--sp2-line)] bg-white" loading="lazy" />
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.img
              key={open}
              src={PAGES[open].src}
              alt={PAGES[open].alt}
              className="max-h-[90vh] max-w-full rounded-sm shadow-2xl bg-white"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────── FAQ accordion ───────────── */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[color:var(--sp2-line)] border-y border-[color:var(--sp2-line)]">
      {items.map((f, i) => (
        <div key={f.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center gap-4 py-5 text-left text-[21px] font-semibold leading-snug"
            aria-expanded={open === i}
          >
            {f.q}
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="sp2-ui text-[26px] text-[color:var(--sp2-accent)] leading-none">
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="pb-6 text-[19px] leading-relaxed text-[color:var(--sp2-muted)]">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Phone-only buy bar that appears after the first screen ───────────── */

export function StickyBuyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const order = document.getElementById('order');
      const nearOrder = order ? order.getBoundingClientRect().top < window.innerHeight && order.getBoundingClientRect().bottom > 0 : false;
      setShow(window.scrollY > window.innerHeight * 0.9 && !nearOrder);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-50 bg-[#14110d]/95 backdrop-blur border-t border-white/10"
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Design A (chosen 26 Oct): one slim bar on phones and desktop; it hides near the order section. */}
          <div className="max-w-[1320px] mx-auto px-4 sm:px-10 py-3 flex items-center gap-3 sm:gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/img/paperback.jpg" alt="" aria-hidden className="hidden sm:block w-12 h-12 object-cover rounded-[4px]" />
            <div className="sp2-ui text-white leading-tight flex-1 min-w-0">
              <p className="hidden sm:block text-[17px] font-semibold truncate">Shadow Persuasion: The Hidden Rules of Power</p>
              <p className="sm:hidden text-[17px] font-bold">Free US shipping</p>
              <p className="text-[15px] text-white/75 truncate"><span className="sm:hidden">30-day guarantee</span><span className="hidden sm:inline">Free US shipping &middot; Digital copy tonight &middot; 30-day guarantee</span></p>
            </div>
            <a href="/checkout" className="sp2-btn sp2-btn-gold !min-h-[50px] !px-5 sm:!px-7 !text-[17px] whitespace-nowrap flex-shrink-0">
              Get the book, $67
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────── "Tap every one that happened to you" ───────────── */

const MOMENTS = [
  { m: 'A "quick favor" took your whole Saturday.', t: 'You told yourself it was no big deal.' },
  { m: 'You hosted the holiday again.', t: 'You told yourself someone has to.' },
  { m: 'You apologized for something they did.', t: 'You told yourself it kept the peace.' },
  { m: 'Your idea came out of someone else’s mouth in a meeting.', t: 'You told yourself it didn’t matter who said it.' },
  { m: 'Someone went quiet for two days, and you fixed it.', t: 'You told yourself that’s what you do for people you love.' },
  { m: 'You lent money you didn’t want to lend.', t: 'You told yourself they’d pay it back this time.' },
  { m: 'You lay awake replaying what you should have said.', t: 'You told yourself you’d say something next time.' },
];

export function MomentsChecklist() {
  const [on, setOn] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  return (
    <div>
      <div className="space-y-3">
        {MOMENTS.map((x, i) => {
          const checked = on.has(i);
          return (
            <button
              key={x.m}
              onClick={() => toggle(i)}
              aria-pressed={checked}
              className={`w-full text-left rounded-lg border-2 px-5 py-4 transition-colors flex gap-4 items-start ${
                checked ? 'border-[color:var(--sp2-ink)] bg-[color:var(--sp2-card)]' : 'border-[color:var(--sp2-line)] hover:border-[#bfb29a]'
              }`}
            >
              <span
                className={`mt-1 w-6 h-6 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                  checked ? 'bg-[color:var(--sp2-ink)] border-[color:var(--sp2-ink)] text-white' : 'border-[#bfb29a]'
                }`}
              >
                {checked && <span className="text-[17px] leading-none">✓</span>}
              </span>
              <span>
                <span className="block text-[20px] leading-snug font-semibold">{x.m}</span>
                <AnimatePresence initial={false}>
                  {checked && (
                    <motion.span
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="block overflow-hidden text-[18px] italic text-[color:var(--sp2-muted)] mt-1"
                    >
                      {x.t}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {on.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-lg bg-[color:var(--sp2-night)] text-[#e9e2d6] p-6 text-[19px] leading-relaxed"
          >
            <span className="text-white font-semibold">
              You checked {on.size} of {MOMENTS.length}.
            </span>{' '}
            Nobody forced you into any of them. It just felt easier to give in than to make it awkward. They got the easy
            evening. You paid for it. The book shows you how to stop paying, without becoming someone you don&apos;t like.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── "What keeps happening to you?" (from the book's Situation Finder) ───────────── */

// From the book's Situation Finder. Each points at a chapter and an exact section heading.
export type SituationGroup = { group: string; icon?: string; items: { s: string; where: string; ch: number; section: string; find: string }[] };

const SITUATIONS: SituationGroup[] = [
  {
    group: 'At work',
    items: [
      { s: 'Someone took credit for my work.', where: 'Chapter 23, Work, Pay, and Recognition', ch: 23, section: 'When someone repeats your idea in a meeting', find: 'What to send before the meeting, what to say in it, the short note to send the same day, and what to do when the manager does nothing.' },
      { s: 'Work keeps landing on my desk.', where: 'Chapter 10, Charm, Urgency, and the Slow Squeeze', ch: 10, section: 'The slow squeeze', find: 'Scope creep and "temporary" jobs that never end: list what you actually do now, and ask for a decision about it.' },
      { s: 'I want a raise, and keep not asking.', where: 'Chapter 23, Asking for a raise', ch: 23, section: 'Asking for a raise', find: 'Prepare a clear case, hold the conversation, and handle the answers you are most likely to hear.' },
      { s: 'They praise me right before piling on more.', where: 'Chapter 10, Pleasant pressure', ch: 10, section: 'Pleasant pressure', find: 'Thank them for the compliment, then answer the request on its own.' },
    ],
  },
  {
    group: 'Partner or ex',
    items: [
      { s: 'They go silent after we disagree.', where: 'Chapter 9, Silence, Distance, and Conditional Warmth', ch: 9, section: 'How to respond without chasing', find: 'Name it once, kindly. Carry on with your normal life. Don\u2019t change your decision to end the silence.' },
      { s: 'They deny saying things I remember.', where: 'Chapter 8, When the Story Keeps Changing', ch: 8, section: 'Protecting your memory', find: 'Write it down soon, confirm agreements in writing, say your version once, then answer the decision instead of the history.' },
      { s: 'My ex rewrites our agreements by text.', where: 'Chapter 25, After a separation', ch: 25, section: 'After a separation: when your ex still controls everything', find: 'Brief, factual messages about one practical thing, records kept privately, and when to bring in a family lawyer.' },
      { s: '\u201cIf you loved me, you would\u2026\u201d', where: 'Chapter 7, Guilt, Favors, and Hidden Debts', ch: 7, section: 'When affection or character is made conditional', find: 'Why it lands so hard, and how to treat a decision as a decision, not a verdict on your love.' },
    ],
  },
  {
    group: 'With family',
    items: [
      { s: '\u201cAfter everything I\u2019ve done for you\u2026\u201d', where: 'Chapter 7, The ledger', ch: 7, section: 'When past help is treated as a debt', find: 'Honor the past, then separate it from today. And the one reply that starts a long argument about who owes whom.' },
      { s: 'A parent still makes me feel small.', where: 'Chapter 26, Family, Friends, and the Roles That Stick', ch: 26, section: 'The parent who still makes you feel small', find: 'Criticism dressed as concern, comparisons, the phone call and the visit, and pushback after a limit.' },
      { s: 'I\u2019m doing all the care for an aging parent.', where: 'Chapter 26, Caring for an aging parent', ch: 26, section: 'Caring for an aging parent without doing it all alone', find: 'Make the work visible, hold a family call that ends with named commitments, and decide what to do when relatives won\u2019t help.' },
      { s: 'A relative keeps borrowing money.', where: 'Chapter 24, Clients, Customers, and Money Decisions', ch: 24, section: 'When family or friends ask to borrow money', find: 'The question to ask yourself before you answer, and the rule you\u2019re allowed to make: no new loans until the old one is settled.' },
    ],
  },
  {
    group: 'Inside my head',
    items: [
      { s: 'I replay conversations at night.', where: 'Chapter 4, The Voice That Keeps You Stuck', ch: 4, section: 'The replay is a signal', find: 'What the replay is doing, why going blank is normal, and how to give the inner voice a different job.' },
      { s: 'I say yes before I\u2019ve even thought.', where: 'Chapter 3 and the Quick Start', ch: 3, section: 'A rule you follow vs a choice you make', find: 'The instant yes, the rule behind it, and the small pause on Day 1 that gives you back the choice.' },
      { s: 'I apologize for everything.', where: 'Chapter 3, What other people learn from you', ch: 3, section: 'What other people learn from you', find: 'The reflex apology and five other signals people pick up, and why they are habits, not your personality.' },
      { s: 'I feel guilty after I say no.', where: 'Chapter 7, Guilt, Favors, and Hidden Debts', ch: 7, section: 'Duties, favors, and agreements', find: 'Tell a real duty from a favor, and both from an agreement, so guilt stops making the decision.' },
    ],
  },
];

const GROUP_ICONS = ['briefcase', 'rings', 'house', 'head'];

/** Optional: which group and which situation in it are selected when the page loads. */
export function SituationPicker({ initialGroup = 0, initialItem = 0, situations = SITUATIONS }: { initialGroup?: number; initialItem?: number; situations?: SituationGroup[] } = {}) {
  const g0 = initialGroup < situations.length ? initialGroup : 0;
  const [g, setG] = useState(g0);
  const [sel, setSel] = useState(initialItem < situations[g0].items.length ? initialItem : 0);
  const group = situations[g];
  const item = group.items[sel];
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div>
        <div className="grid gap-2 sm:gap-3 mb-8" style={{ gridTemplateColumns: `repeat(${situations.length}, minmax(0, 1fr))` }}>
          {situations.map((x, i) => (
            <button
              key={x.group}
              onClick={() => {
                setG(i);
                setSel(0);
              }}
              className={`flex flex-col items-center gap-2 py-4 px-1 rounded-[4px] border-2 ${g === i ? 'border-[color:var(--sp2-ink)] bg-[#fdfbf6]' : 'border-transparent hover:border-[color:var(--sp2-line)]'}`}
            >
              <Icon name={x.icon ?? GROUP_ICONS[i % GROUP_ICONS.length]} className="w-12 h-12" />
              <span className="sp2-ui text-[16px] text-center leading-tight">{x.group}</span>
            </button>
          ))}
        </div>
        {group.items.map((x, i) => (
          <button
            key={x.s}
            onClick={() => setSel(i)}
            className={`w-full text-left py-4 border-t border-[color:var(--sp2-line)] text-[20px] leading-snug flex items-center gap-3 ${sel === i ? 'font-semibold' : ''}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sel === i ? 'bg-[color:var(--sp2-oxblood)]' : 'bg-[#cfc5b2]'}`} />
            {x.s}
          </button>
        ))}
      </div>
      {/* The answer, shown as a book page with a ribbon bookmark */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${g}-${sel}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#fdfbf6] shadow-[0_30px_50px_-30px_rgba(28,27,24,0.55)] p-8 sm:p-10 pr-16 sm:pr-24"
        >
          <div className="absolute -top-2 right-8 sm:right-12 w-8 h-24 bg-[color:var(--sp2-oxblood)]" style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)' }} />
          <p className="sp2-kicker !mb-1">Turn to {pageRef(item.ch, item.section)}</p>
          <p className="sp2-display text-[30px] sm:text-[34px] leading-tight">{item.where}</p>
          <p className="mt-4 text-[20px] leading-relaxed">{item.find}</p>
          <p className="sp2-note mt-6">The Situation Finder at the back of the book lists every one of these.</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────── The seven parts, as a staircase: see it first, practice last ───────────── */

const SEVEN_PARTS = [
  { n: 'I', icon: 'eye', title: 'See where your power goes', short: 'Who really decides, the rules you never chose, and the voice that argues for the other side.', chapters: '1 to 5' },
  { n: 'II', icon: 'shield', title: 'Stop unfair pressure', short: 'Guilt, changing stories, silence, charm and urgency, and when pressure becomes danger.', chapters: '6 to 11' },
  { n: 'III', icon: 'speech', title: 'Build real influence', short: 'Listen, ask better questions, make your case land, and negotiate well.', chapters: '12 to 17' },
  { n: 'IV', icon: 'key', title: 'Power beyond the conversation', short: 'Alternatives, credibility, allies, fair leadership, and agreements that turn into action.', chapters: '18 to 22' },
  { n: 'V', icon: 'briefcase', title: 'Put it to work in your life', short: 'Work and pay, money decisions, relationships and exes, family roles, and group pressure.', chapters: '23 to 27' },
  { n: 'VI', icon: 'compass', title: 'Keep your power useful', short: 'When they still say no, starting again, and power without becoming what you resent.', chapters: '28 to 30' },
  { n: 'VII', icon: 'sprout', title: 'The 21-Day Power Reset', short: 'A Quick Start, then three weeks of small daily practices. Start it any time.', chapters: '31 to 34' },
];

export function SevenParts() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-0 lg:items-end">
        {SEVEN_PARTS.map((p, i) => (
          <div key={p.n} className="flex flex-col">
            <div className="px-3 lg:px-4 pb-5">
              <Icon name={p.icon} className="w-12 h-12 lg:w-14 lg:h-14" />
              <h3 className="sp2-display text-[24px] lg:text-[22px] leading-tight mt-3">{p.title}</h3>
              <p className="text-[17px] lg:text-[16px] leading-snug text-[color:var(--sp2-muted)] mt-2">{p.short}</p>
              <p className="sp2-note mt-2">Chapters {p.chapters}</p>
            </div>
            {/* The step itself, taller each time */}
            <div
              className="border-t-[3px] border-[color:var(--sp2-ink)] lg:border-r-[3px] bg-[repeating-linear-gradient(135deg,transparent_0,transparent_9px,rgba(28,27,24,0.07)_9px,rgba(28,27,24,0.07)_10px)] flex items-start px-3 lg:px-4 pt-3 h-[60px] lg:h-[var(--step)]"
              style={{ ['--step' as string]: `${60 + i * 30}px` }}
            >
              <span className="sp2-display text-[40px] leading-none text-[color:var(--sp2-accent)]">{p.n}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden lg:flex justify-between sp2-note mt-4">
        <span>See it</span>
        <span>Practice it &rarr;</span>
      </div>
    </div>
  );
}

/* ───────────── Is it for you? One line per sentence, each with its icon; then who it isn't for ───────────── */

const NOT_FOR: [string, string][] = [
  ['push', 'You want tricks to control or deceive people'],
  ['head', 'You are looking for a replacement for therapy'],
  ['book', 'You want to read about it without practicing it'],
  ['shield', 'You are in danger right now (please use the hotline in the questions below)'],
];

type ForYouProps = {
  kicker?: string;
  /** [icon name, line] pairs. */
  lines?: [string, React.ReactNode][];
  notForHead?: React.ReactNode;
  notFor?: [string, string][];
  /** Draw the not-for lines crossed out (off on the problem pages, where one of them is a safety pointer). */
  strike?: boolean;
};

/** All props are optional replacements (the angle pages describe who the book is written for, not the reader). */
export function ForYou({ kicker = 'This is for you if', lines: linesProp, notForHead, notFor = NOT_FOR, strike = true }: ForYouProps = {}) {
  const lines: [string, React.ReactNode][] = linesProp ?? [
    ['hand', <>You <mark className="sp2-hl">say yes, then resent it.</mark></>],
    ['speech', <>You <mark className="sp2-hl">apologize</mark> for things you didn&apos;t do.</>],
    ['moon', <>You <mark className="sp2-hl">replay conversations</mark> long after they end.</>],
    [
      'house',
      <>
        People call you{' '}
        <span className="relative inline-block italic">
          &ldquo;the nice one,&rdquo;
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/ink/underline-red.png" alt="" aria-hidden className="pointer-events-none select-none absolute left-0 -bottom-1 w-full h-3" />
        </span>{' '}
        and you&apos;re tired of what it costs.
      </>,
    ],
    ['compass', <>You want to stay kind. You just want to <mark className="sp2-hl">stop being easy to use.</mark></>],
  ];
  return (
    <div>
      <div className="max-w-[1120px] mx-auto">
        <p className="sp2-kicker text-center">{kicker}</p>
        <div className="mt-4">
          {lines.map(([icon, text], i) => (
            <div key={i} className="flex items-center gap-5 sm:gap-7 py-4 sm:py-5 border-b border-[color:var(--sp2-line)] last:border-b-0">
              <Icon name={icon} className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" />
              <p className="sp2-display text-[26px] sm:text-[36px] leading-[1.25]">{text}</p>
            </div>
          ))}
        </div>
      </div>
      {notFor.length > 0 && (<>
      <svg viewBox="0 0 40 80" className="w-8 h-16 mx-auto my-10" aria-hidden>
        <path d="M20,4 C18,26 22,46 20,72 M9,58 L20,74 L31,57" stroke="#1c1b18" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="max-w-[980px] mx-auto">
        <p className="sp2-display text-[30px] text-center mb-8 text-[color:var(--sp2-muted)]">{notForHead ?? <>It isn&apos;t for you if&hellip;</>}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {notFor.map(([icon, t], i) => (
            <div key={i} className="text-center">
              <Icon name={icon} className="w-12 h-12 mx-auto opacity-60" />
              <p className={`text-[18px] leading-snug mt-3 text-[color:var(--sp2-muted)] ${strike ? 'line-through decoration-[color:var(--sp2-oxblood)] decoration-2' : ''}`}>{t}</p>
            </div>
          ))}
        </div>
      </div>
      </>)}
    </div>
  );
}
