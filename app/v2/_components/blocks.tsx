/* eslint-disable @next/next/no-img-element */
/**
 * Shared page blocks for the sales-page versions (/v2, the test versions /v3 to /v6, and the angle pages /a/[angle]).
 * Server components: they only arrange the client pieces from ui, editorial and interactive.
 * Copy that differs between versions is passed in; the offer details stay identical everywhere.
 */

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { BuyButton, BuyNote } from './ui';
import { Mark, MarginNote, TornEdge } from './editorial';
import { Faq } from './interactive';
import { pageRefShort } from './pageRef';
import type { Fascination } from './copy';

const INK = '/v2/ink';

/* ───────────── Page structure ───────────── */

/** A section on the continuous paper sheet. */
export function Sheet({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative bg-[color:var(--sp2-paper)] sp2-grain ${className}`}>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">{children}</div>
    </section>
  );
}

/** A dark section with torn paper edges top and bottom. */
export function Night({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
export function Heading({ kicker, children, className = '', dark = false, center = false }: { kicker?: string; children: React.ReactNode; className?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`${center ? 'text-center' : ''} ${className}`}>
      {kicker && <p className={`sp2-kicker ${dark ? 'on-dark' : ''}`}>{kicker}</p>}
      <h2 className={`sp2-display text-[40px] sm:text-[60px] lg:text-[72px] leading-[1.02] tracking-[-0.01em] max-w-[16ch] ${center ? 'mx-auto' : ''} ${dark ? 'text-[#faf6ee]' : ''}`}>
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

/** Page-numbered bullets ("fascinations"): each one a benefit with the answer held back. Shows "Ch. N" until page numbers are final. */
export function Fascinations({ items, intro }: { items: Fascination[]; intro?: React.ReactNode }) {
  return (
    <div className="max-w-[860px] mx-auto">
      {intro && <div className="text-center mb-10">{intro}</div>}
      {items.map((b) => (
        <div key={`${b.ch}:${b.section}`} className="sp2-rule flex gap-5 sm:gap-7 py-5">
          <span className="sp2-type text-[18px] sm:text-[20px] text-[color:var(--sp2-oxblood)] whitespace-nowrap pt-1 min-w-[64px] sm:min-w-[76px]">{pageRefShort(b.ch, b.section)}</span>
          <p className="text-[20px] sm:text-[21px] leading-[1.5]">{b.text}</p>
        </div>
      ))}
    </div>
  );
}

/** "You don't need..." list: objections answered before they are raised. */
export function DoesntNeed({ items }: { items: [string, string][] }) {
  return (
    <div className="max-w-[860px] mx-auto grid sm:grid-cols-2 gap-x-12">
      {items.map(([t, d]) => (
        <div key={t} className="sp2-rule py-5">
          <p className="sp2-display text-[26px] leading-tight">{t}</p>
          <p className="text-[color:var(--sp2-muted)] mt-1">{d}</p>
        </div>
      ))}
    </div>
  );
}

/** A short buy line placed between sections. */
export function InlineBuy({ line, href = '/v2/checkout' }: { line: React.ReactNode; href?: string }) {
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
  { img: '/v2/covers/book.jpg', title: 'Shadow Persuasion: The Hidden Rules of Power, in print', body: '34 chapters in seven parts, with scripts and worked conversations where the other person pushes back. Paperback or hardcover, shipped free to your door.' },
  { img: '/v2/covers/book.jpg', title: 'The digital edition', body: 'Emailed the moment you order, so you can start reading tonight.' },
  { img: '/v2/covers/journal.jpg', title: 'The 21-Day Power Reset Journal', body: 'A page for every day of the Reset in Part VII, with the morning and evening questions, four check-ins and tool pages. Print it, or use it on screen.' },
  { img: '/v2/covers/spotter.jpg', title: 'Bonus: The Tactic Spotter', body: 'A quick reference to pressure patterns, organized like Part II of the book: what each one sounds like, other possible explanations, when it becomes a pattern, one calm reply, and when not to confront.' },
  { img: '/v2/covers/planner.jpg', title: 'Bonus: The Conversation Planner', body: 'Prepare one hard conversation on paper: what you want, your Clean Ask, likely pushback, your No-Agreement Plan, and the follow-up message. With two filled-in examples, one at work and one in a family.' },
  { img: '/v2/covers/cards.jpg', title: 'Bonus: The Power Map and Decision Cards', body: 'Eight printable cards, one for each tool in the book, including a Power Map you can write on and a Four Fair Influence Tests checklist.' },
  { img: '/v2/img/app-phone.webp', title: '60 days of the companion app', body: 'Decode messages and screenshots, rehearse hard conversations with an AI that pushes back, and follow the 21-day reset on your phone. $9.99 a month after that, only if you choose to keep it.' },
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
    q: 'What if it is not for me?',
    a: 'Email us within 30 days and you get a full refund.',
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

export function StackList() {
  return (
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
        <p>Put it next to the other ways people try to fix this. An hour with a coach. A weekend workshop. Another year of saying yes and lying awake about it. Sixty-seven dollars, once, and the guarantee below means it costs you nothing if it is not for you.</p>
      </Letter>
    </div>
  );
}

export function GuaranteeNight({ title = 'Read it. Try the reset. Then decide.' }: { title?: string }) {
  return (
    <Night>
      <div className="grid md:grid-cols-[240px_1fr] gap-12 items-center">
        <div className="relative mx-auto w-[200px] sm:w-[230px]">
          <img src="/v2/img/guarantee-rosette.png" alt="30-day money-back guarantee" className="w-full" />
          <div className="absolute left-1/2 top-[37%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center leading-none">
            <span className="sp2-display text-[56px] sm:text-[64px] text-[#faf6ee]">30</span>
            <span className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)] mt-1">DAYS</span>
          </div>
        </div>
        <div>
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02] text-[#faf6ee]">{title}</h2>
          <p className="sp2-lead mt-6 text-[#e6ddcf] max-w-[34em]">
            If the book isn&apos;t for you, email us within 30 days and you&apos;ll get a full refund. No forms, no hoops, and no guilt trip. That would be a strange way to sell this book.
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
    <Link href="/v2/checkout" className="text-[color:var(--sp2-accent)] underline underline-offset-4">
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
