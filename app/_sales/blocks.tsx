/* eslint-disable @next/next/no-img-element */
/**
 * Shared page blocks for the sales pages (the homepage and the problem pages /b/[slug]).
 * Server components: they only arrange the client pieces from ui, editorial and interactive.
 * Copy that differs between versions is passed in; the offer details stay identical everywhere.
 */

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { BuyButton, BuyNote } from './ui';
import { Mark, MarginNote, TornEdge } from './editorial';
import { Faq } from './interactive';

const INK = '/v2/ink';

/* ───────────── Page structure ───────────── */

/** A section on the continuous paper sheet. */
export function Sheet({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative bg-[color:var(--sp2-paper)] sp2-grain ${className}`}>
      {/* Extra vertical room so sections do not run into each other. */}
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-8 sm:py-12">{children}</div>
    </section>
  );
}

/** A dark section with torn paper edges top and bottom. */
export function Night({ children, className = '', edges = true }: { children: React.ReactNode; className?: string; edges?: boolean }) {
  return (
    <section className={`relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-on-dark sp2-grain ${className}`}>
      {/* Deckled cotton-paper edges (generated 26 Oct, book-v3/site-images/edges): different from the hero's torn edge. */}
      {edges && <img src="/v2/img/edge-rough-top.webp" alt="" aria-hidden className="absolute -top-px inset-x-0 w-full h-[18px] sm:h-[24px] object-fill pointer-events-none select-none" />}
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-24 sm:py-32">{children}</div>
      {edges && <img src="/v2/img/edge-rough.webp" alt="" aria-hidden className="absolute -bottom-px inset-x-0 w-full h-[18px] sm:h-[24px] object-fill pointer-events-none select-none" />}
    </section>
  );
}

/** Section heading in the book's display face. */
export function Heading({ kicker, children, className = '', dark = false, center = false }: { kicker?: string; children: React.ReactNode; className?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`${center ? 'text-center' : ''} ${className}`}>
      {kicker && <p className={`sp2-kicker ${dark ? 'on-dark' : ''}`}>{kicker}</p>}
      <h2 className={`sp2-display text-[40px] sm:text-[60px] lg:text-[72px] leading-[1.06] tracking-[-0.01em] max-w-[24ch] ${center ? 'mx-auto' : ''} ${dark ? 'text-[#faf6ee]' : ''}`}>
        {children}
      </h2>
    </div>
  );
}

/* ───────────── Long-form letter pieces ───────────── */

/** A narrow reading column for letter copy: one idea per short paragraph, like a printed letter. */
export function Letter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-[680px] mx-auto text-[20px] sm:text-[22px] leading-[1.65] [&>p]:mb-[1.05em] [&>p:last-child]:mb-0 ${className}`}>{children}</div>;
}

/** A centred subhead inside a letter. */
export function LetterHead({ children, kicker }: { children: React.ReactNode; kicker?: string }) {
  return (
    <div className="max-w-[760px] mx-auto text-center my-14 sm:my-20">
      {kicker && <p className="sp2-kicker">{kicker}</p>}
      <h2 className="sp2-display text-[34px] sm:text-[50px] leading-[1.08]">{children}</h2>
    </div>
  );
}

/** A line pulled out of the letter, set large. */
export function PullLine({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[820px] mx-auto text-center sp2-display italic text-[32px] sm:text-[46px] leading-[1.18] my-14 sm:my-20">{children}</p>;
}

/** A short buy line placed between sections. */
export function InlineBuy({ line, href = '/checkout' }: { line: React.ReactNode; href?: string }) {
  return (
    <div className="max-w-[760px] mx-auto text-center py-6">
      <p className="sp2-display text-[30px] sm:text-[40px] leading-[1.15]">{line}</p>
      <div className="mt-7">
        <BuyButton href={href} className="w-full sm:w-auto" />
        <BuyNote />
      </div>
    </div>
  );
}

/** Nate's sign-off. */
export function Signature() {
  return (
    <div className="max-w-[680px] mx-auto mt-10">
      <p className="sp2-display italic text-[40px] leading-none">Nate</p>
      <p className="sp2-small text-[color:var(--sp2-muted)] mt-2">Nate Harlan, author of Shadow Persuasion</p>
    </div>
  );
}

/* ───────────── The offer (identical on every version) ───────────── */

// Cover images still show the previous edition's titles; new covers are listed in
// book-v3/launch-checklist.md. `img: null` draws a plain type-only cover instead.
export const STACK: { img: string | null; title: string; body: string }[] = [
  { img: '/v2/covers/book.jpg', title: 'Shadow Persuasion: The Hidden Rules of Power, in print', body: 'Printed and shipped free (US). 34 chapters in seven parts, with word-for-word replies and worked conversations where the other person argues back. Paperback or hardcover.' },
  { img: '/v2/covers/book.jpg', title: 'The digital edition', body: 'Digital, emailed the moment you order, so you can start reading tonight while the print copy is on its way.' },
  { img: '/v2/covers/journal.jpg', title: 'The 21-Day Power Reset Journal', body: 'Digital (print it or use it on screen). One page for each day of the 21-day practice at the end of the book: a small exercise in the morning, a few questions in the evening.' },
  { img: '/v2/covers/spotter.jpg', title: 'Bonus: The Tactic Spotter', body: 'Digital. A quick list of pressure moves people use (guilt trips, "that never happened", the silent treatment and more): what each one sounds like, when it is a pattern, and one calm reply.' },
  { img: '/v2/covers/planner.jpg', title: 'Bonus: The Conversation Planner', body: 'Digital. One page to prepare a hard conversation: what you want, how to ask for it, what they will probably say back, and what you will do if the answer is no. With two filled-in examples, one at work and one in a family.' },
  { img: '/v2/covers/cards.jpg', title: 'Bonus: The Power Map and Decision Cards', body: 'Digital, printable. Eight cards that sum up the book\'s tools on one page each, including a map of who really decides in a situation and a four-question check that your own request is fair.' },
  { img: '/v2/img/app-phone.webp', title: '60 days of the companion app', body: 'Paste a message or a screenshot and it suggests what tactic might be at work and a calm reply. Rehearse a hard conversation with an AI that pushes back. It never renews on its own. Keeping it after 60 days is your choice, at $9.99 a month.' },
];

export const FAQ_ITEMS = [
  {
    q: 'Is this a book about manipulating people?',
    a: 'No. It teaches you to spot unfair pressure and to ask for what you want in the open. Its one rule runs through every page: every technique is one you could explain openly to the person affected. Chapter 30 gives the Four Fair Influence Tests, so you can check your own requests as well as other people\'s.',
  },
  {
    q: "I've read plenty of self-help books. Why would this one be different?",
    a: 'Most of them explain why you say yes. This one gives you words for the moment itself, usually in a warm, a direct and a final version, and worked conversations where the other person argues back the way real people do. Part VII is a 21-day practice of small exercises, so the new answer is familiar before you need it.',
  },
  {
    q: 'Will it tell me whether someone is a narcissist?',
    a: 'No, and it explains why you don\'t need that. Chapter 6 shows how to judge a pattern instead: does it repeat, is there ever repair, and what happens when you say no. You can decide what to do without diagnosing anyone.',
  },
  {
    q: "I'm in my fifties (or sixties). Is it too late?",
    a: 'No. Many of the people in the book are in their fifties and sixties. The Reset starts with low-stakes moments, and Chapter 29 is about starting again after a role ends, including what to say when someone tells you "you\'ve changed."',
  },
  {
    q: 'Will this make me cold or rude?',
    a: 'No. Chapter 5 is about staying steady without going cold. The point is to choose what you give, instead of handing over whatever the moment seems to demand.',
  },
  {
    q: 'Does it give legal advice about divorce, custody or money?',
    a: 'No. It covers clear, brief messages, keeping records safely, and preparing for hard conversations. For custody, court orders, wills or debts, it tells you plainly when to talk to a family lawyer or another qualified professional.',
  },
  {
    q: 'What exactly do I get?',
    a: 'The book in print, shipped to you (US only). Plus, emailed right away: the digital edition, The 21-Day Power Reset Journal, three bonuses (The Tactic Spotter, The Conversation Planner, and The Power Map and Decision Cards), and 60 days of the companion app.',
  },
  {
    q: 'How much is shipping, and how long does it take?',
    a: 'Standard shipping within the US is free. Your copy is printed for you, then mailed, and you see the delivery estimate before you pay. If you want it sooner, you can pick a faster speed at checkout and pay only the difference. Your digital copy arrives by email straight away, so you can start tonight.',
  },
  {
    q: 'What is the difference between the paperback and the hardcover?',
    a: 'Same complete book, same bonuses and app. The paperback is the one you carry and underline. The hardcover is built to last, the copy that stays on your shelf for years. It is $30 more.',
  },
  {
    q: 'Is the app extra?',
    a: 'Sixty days of the app are included, starting the day you order. After that you can keep it for $9.99 a month, or simply let it end. Nothing is charged automatically, and the book works fully without it.',
  },
  {
    q: 'Is this therapy?',
    a: 'No. It is general information and self-help about everyday pressure and influence. It won\'t diagnose anyone or promise to heal your childhood. If you feel afraid of someone, please reach out for support. In the US, the National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788.',
  },
  {
    q: 'Do you ship outside the US?',
    a: 'Not yet. For now the printed book ships to US addresses only.',
  },
  {
    q: 'How is this different from The 48 Laws of Power?',
    a: 'Books like that describe how powerful people win. This one is for the other side of the table: spotting unfair pressure while it is happening, answering it calmly, and asking for what you want in the open. It gives you the actual words, worked conversations where the other person argues back, and a 21-day practice.',
  },
  {
    q: 'Where do I start, and how fast will I notice a difference?',
    a: 'Start tonight with the digital copy: find your situation in the Situation Finder at the back and read that chapter, then try one reply. The 21-day reset gives you a few minutes of practice a day. It is a schedule for practice, not a promise that someone else will change.',
  },
  {
    q: 'What if my situation is different?',
    a: 'The book covers work, money, partners and exes, family and group pressure, and the Situation Finder sends you to the closest example. Many replies come in a warm, a direct and a final version, so you can pick the one that fits the person in front of you.',
  },
  {
    q: 'What if I recognise some of this in my own behaviour?',
    a: 'Most people do. Chapter 30 has four questions to check your own requests, signs you have swung too far, and how to repair it when you have pushed someone unfairly.',
  },
  {
    q: 'What if saying no could put me at risk?',
    a: 'If someone threatens you or controls your movements or money, a firmer reply may not be the right next step. Start with Chapter 11, When Pressure Becomes Danger, and talk to someone trained to help. In the US, the National Domestic Violence Hotline is open at any hour at 1-800-799-7233.',
  },
  {
    q: 'What if it is not for me?',
    a: 'Email us within 30 days of delivery and send the book back, and you get a full refund.',
  },
];

/** A plain cover made of type, used until a product has its own cover image. */
export function TypeCover({ title }: { title: string }) {
  return (
    <div className="w-full aspect-[2/3] rounded-[2px] bg-[color:var(--sp2-night)] text-[#efe7da] flex flex-col items-center justify-between px-2 py-3 sm:px-3 sm:py-5 text-center shadow-[0_14px_22px_-12px_rgba(0,0,0,0.6)]" aria-hidden>
      <span className="sp2-type text-[9px] sm:text-[11px] tracking-[0.16em] text-[color:var(--sp2-gold)]">SHADOW PERSUASION</span>
      <span className="sp2-display text-[15px] sm:text-[21px] leading-[1.1]">{title}</span>
      <span className="sp2-type text-[9px] sm:text-[11px] tracking-[0.16em]">NATE HARLAN</span>
    </div>
  );
}

/** What you get, design A (chosen 26 Oct): the book, the four guides as a row of covers, the app as one optional line. */
export function StackList() {
  const guides = [
    ['/v2/covers/journal.jpg', '21-day journal'],
    ['/v2/covers/spotter.jpg', 'Tactic Spotter'],
    ['/v2/covers/planner.jpg', 'Conversation Planner'],
    ['/v2/covers/cards.jpg', 'Decision Cards'],
  ];
  return (
    <div className="max-w-[1080px] mx-auto">
      <Heading kicker="What you get">Your printed book and digital extras.</Heading>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 mt-10">
        <div className="bg-white border border-[color:var(--sp2-line)] rounded-[14px] p-6 sm:p-7 flex gap-6 items-center">
          <img src="/v2/covers/book.jpg" alt="Shadow Persuasion: The Hidden Rules of Power" className="w-[100px] sm:w-[120px] rounded-[2px] shadow-[0_14px_22px_-12px_rgba(0,0,0,0.6)]" loading="lazy" />
          <div>
            <p className="sp2-kicker !mb-1">The book</p>
            <p className="sp2-display text-[26px] sm:text-[30px] leading-[1.1]">In print, and digital tonight</p>
            <p className="text-[16px] sm:text-[17px] text-[color:var(--sp2-muted)] mt-2">346 pages, paperback or hardcover, shipped free in the US. The digital edition arrives by email the moment you order.</p>
          </div>
        </div>
        <div className="bg-white border border-[color:var(--sp2-line)] rounded-[14px] p-6 sm:p-7">
          <p className="sp2-kicker">Included guides (digital, printable)</p>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {guides.map(([src, name]) => (
              <div key={name} className="text-center">
                <img src={src} alt={name} className="w-full max-w-[80px] mx-auto rounded-[2px] shadow-[0_12px_20px_-12px_rgba(0,0,0,0.6)]" loading="lazy" />
                <p className="sp2-ui text-[13px] font-semibold leading-tight mt-2">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-[color:var(--sp2-line)] flex gap-4 items-center">
        <img src="/v2/img/app-phone.webp" alt="" aria-hidden className="w-10 flex-shrink-0" loading="lazy" />
        <p className="text-[17px]"><b>Optional: 60 days of the companion app.</b> <span className="text-[color:var(--sp2-muted)]">Paste a message and get a suggested reply, or rehearse a hard conversation. It never renews on its own. Keeping it after 60 days is your choice, at $9.99 a month.</span></p>
      </div>
    </div>
  );
}

/** The compact offer beside the first buy button (design A, chosen 26 Oct): bundle photo, what is in it, price, button, terms.
 * `note` adds one line above the list (the problem pages use it to say the book covers far more than one topic). */
export function OfferBox({ note }: { note?: React.ReactNode } = {}) {
  return (
    <div className="max-w-[1080px] mx-auto bg-white border border-[color:var(--sp2-line)] rounded-[14px] shadow-[0_30px_60px_-35px_rgba(0,0,0,0.45)] p-6 sm:p-10 grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] gap-8 md:gap-12 items-center">
      <img src="/v2/img/bundle-cutout.webp" alt="Shadow Persuasion: The Hidden Rules of Power with the journal and the three bonus guides" className="w-full" loading="lazy" />
      <div>
        <p className="sp2-kicker !mb-1">Everything you get</p>
        <p className="sp2-display text-[32px] sm:text-[38px] leading-[1.06]">Shadow Persuasion: The Hidden Rules of Power</p>
        {note && <p className="text-[17px] sm:text-[18px] leading-snug text-[color:var(--sp2-muted)] mt-3">{note}</p>}
        <ul className="mt-5 space-y-2.5 text-[18px] leading-snug">
          {[
            'The paperback, printed for you and shipped free (US)',
            'The digital edition tonight',
            'A 21-day practice journal and three printable guides',
            '60 days of the companion app (it never renews on its own)',
          ].map((t) => (
            <li key={t} className="flex gap-3"><span className="text-[color:var(--sp2-accent)] font-bold">&#10003;</span><span>{t}</span></li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <span className="sp2-display text-[56px] leading-none">$67</span>
          <BuyButton gold label="Get the paperback &rarr;" />
          <img src="/v2/img/seal-wax.png" alt="30-day money-back guarantee" className="w-[84px] sm:ml-auto" />
        </div>
        <p className="sp2-small text-[color:var(--sp2-muted)] mt-4">Free US shipping &middot; Digital copy tonight &middot; 30 days from delivery: return the book for a full refund &middot; One-time payment &middot; Hardcover $97</p>
      </div>
    </div>
  );
}

/** A thin rule with a small book icon, to separate sections without a heavy break. */
export function Divider() {
  return (
    <div className="bg-[color:var(--sp2-paper)] py-6" aria-hidden>
      <div className="flex items-center gap-5 max-w-[700px] mx-auto px-5">
        <span className="flex-1 h-px bg-[color:var(--sp2-line)]" />
        <img src="/v2/icons/book.png" alt="" className="w-8 opacity-70" />
        <span className="flex-1 h-px bg-[color:var(--sp2-line)]" />
      </div>
    </div>
  );
}

/** About the book: the owner chose to let the pages speak instead of an author bio (Nate Harlan is a pen name). */
export function AboutBook() {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="sp2-display text-[40px] sm:text-[56px] leading-[1.04]">About the Book</h2>
      <div className="sp2-body mt-8 text-left sm:text-center">
        <p>Shadow Persuasion: The Hidden Rules of Power is 346 pages in print: 34 chapters in seven parts, with word-for-word replies, worked conversations where the other person argues back, and a Situation Finder at the back that sends you to the page for what you are facing.</p>
        <p>The excerpts on this site are word for word from the book, and adapted scripts are labeled. Read them, try one, and decide for yourself. If it isn&apos;t for you, the guarantee below gets you your money back.</p>
      </div>
    </div>
  );
}

/** Why a $67 book: what is actually in the price, said plainly. */
export function WhyThePrice() {
  return (
    <div className="max-w-4xl mx-auto">
      <Heading kicker="About the price">Why this costs more than a book at the airport.</Heading>
      <Letter className="mt-10 !mx-0">
        <p>Fair question. Most books cost twenty dollars, and you have probably bought a few that told you to &ldquo;set boundaries&rdquo; and left you exactly where you started.</p>
        <p>This is not a book you read once and shelve. It comes with a journal page for every day of the 21-day Reset, three working bonuses (a pressure-pattern reference, a conversation planner and eight tool cards), and 60 days of an app that reads the message in front of you and drafts a calm reply. Each copy is printed one at a time, for you, and shipped free.</p>
        <p>Put it next to the other ways people try to fix this. An hour with a coach. A weekend workshop. Another year of saying yes and lying awake about it. Sixty-seven dollars, once, and if it is not for you, the guarantee below gets you your money back.</p>
      </Letter>
    </div>
  );
}

export function GuaranteeNight({ title = 'Read it. Try the exercises. Then decide.' }: { title?: string }) {
  return (
    <Night edges={false}>
      <div className="grid md:grid-cols-[150px_1fr] gap-8 md:gap-12 items-center max-w-[1000px] mx-auto">
        {/* The red wax seal (chosen 26 Oct). The words are part of the image: book-v3/site-images/seals. */}
        <img src="/v2/img/seal-wax.png" alt="30-day money-back guarantee" className="w-[130px] sm:w-[150px] mx-auto" />
        <div>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02] text-[#faf6ee]">{title}</h2>
          <p className="sp2-lead mt-6 text-[#e6ddcf] max-w-[34em]">
            If the book isn&apos;t for you, email us within 30 days of delivery and send the book back. You&apos;ll get a full refund, no questions asked.
          </p>
        </div>
      </div>
    </Night>
  );
}

export function OrderCards() {
  return (
    <>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="sp2-display text-[44px] sm:text-[64px] leading-[1.02]">Choose your copy.</h2>
        <p className="sp2-lead mt-5 text-[color:var(--sp2-muted)]">
          The same complete book and the same extras in both: the digital edition tonight, The 21-Day Power Reset Journal, three bonuses and 60 days of the companion app.
        </p>
        <MarginNote className="mt-3">Free US shipping on both. One-time payment. You see your delivery date at checkout before you pay. Not available on Amazon.</MarginNote>
      </div>
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {[
          { key: 'paperback', title: 'Paperback', tag: 'The one you carry', price: 67, img: '/v2/img/paperback.jpg', points: ['The complete book, all 34 chapters', 'Fits in your bag, made to be underlined', 'Printed to order and shipped to you'], tilt: '-rotate-[0.8deg]' },
          { key: 'hardcover', title: 'Hardcover', tag: 'The one you keep', price: 97, img: '/v2/img/hardcover.jpg', points: ['The same complete book, in hardcover', 'A sturdier copy for your shelf', 'Hardcover binding. Same book and digital extras.'], tilt: 'rotate-[0.8deg]' },
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
              <BuyButton full className="mt-7" href={f.key === 'hardcover' ? '/checkout?format=hardcover' : '/checkout'} label={`Get the ${f.title.toLowerCase()}, $${f.price}`} />
            </div>
          </div>
        ))}
      </div>
      <p className="sp2-small mt-12 flex items-center justify-center gap-2 text-[color:var(--sp2-muted)]">
        <Lock className="w-4 h-4" /> Secure checkout · Free US shipping · 30 days from delivery: return the book for a full refund
      </p>
    </>
  );
}

export function FaqSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="sp2-display text-[40px] sm:text-[56px] leading-[1.05] mb-8">Questions people ask</h2>
      <Faq items={FAQ_ITEMS} />
    </div>
  );
}

/** The closing image and line, then the P.S. passed in by each version. `headline` optionally replaces the big closing line. */
export function Close({ ps, headline }: { ps: React.ReactNode; headline?: React.ReactNode }) {
  return (
    <>
      <div className="text-center">
        <img src="/v2/img/strings-cut.png" alt="Two hands cutting the strings of a puppet bar" className="w-[240px] sm:w-[300px] mx-auto" loading="lazy" />
        <h2 className="sp2-display text-[44px] sm:text-[72px] lg:text-[88px] leading-[1] mt-4 max-w-[16ch] mx-auto">
          {headline ?? (
            <>
              The strings only work while you{' '}
              <span className="relative inline-block italic">
                don&apos;t see them.
                <Mark name="underline" red className="left-0 -bottom-4 w-full h-3" />
              </span>
            </>
          )}
        </h2>
        <p className="sp2-lead mt-8 text-[color:var(--sp2-muted)]">See them. Answer calmly. Keep being kind, on your own terms.</p>
        <div className="mt-9">
          <BuyButton className="w-full sm:w-auto" />
          <BuyNote />
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-24 sp2-body">{ps}</div>
    </>
  );
}

export function PsLink({ children = 'Get your copy here.' }: { children?: React.ReactNode }) {
  return (
    <Link href="/checkout" className="text-[color:var(--sp2-accent)] underline underline-offset-4">
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="sp2-small max-w-[1320px] mx-auto px-5 sm:px-10 py-10 text-[color:var(--sp2-muted)] flex flex-wrap gap-4 justify-between sp2-rule">
      <span>&copy; {new Date().getFullYear()} ShadowPersuasion.com</span>
      <span className="flex gap-5">
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
        <Link href="/terms" className="underline">
          Terms
        </Link>
      </span>
    </footer>
  );
}
