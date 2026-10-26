/* eslint-disable @next/next/no-img-element */
/**
 * Where the free-chapter signup form lands. The chapter itself is NOT shown here (a fake email would
 * get it for free); it lives at /read, which is linked only from the welcome email. This page says
 * "check your email", then makes the case to buy the book now, with the same offer as the sales page.
 */
import Link from 'next/link';
import { FREE_CHAPTER_V3_TITLE } from '@/lib/sp2/free-chapter-v3.generated';
import { IS_V3 } from '@/lib/edition';
import { Footer, GuaranteeNight, Heading, OrderCards, Sheet, StackList } from '../../_sales/blocks';
import { MarginNote } from '../../_sales/editorial';
import { BuyButton, BuyNote } from '../../_sales/ui';

const FREE_TITLE = IS_V3 ? FREE_CHAPTER_V3_TITLE : 'The 3 A.M. Replay';

export const metadata = { title: 'Check your email | Shadow Persuasion: The Hidden Rules of Power' };

// What the chapter gives them, then what only the rest of the book gives them.
const IN_THE_CHAPTER = 'Why the perfect reply shows up hours late, and what the replay in your head is really telling you.';
const IN_THE_BOOK = [
  'Word-for-word replies to guilt trips, "that never happened" and the silent treatment, usually in a warm, a direct and a final version.',
  'Worked conversations where the other person argues back, the way real people do.',
  'Chapters for the exact situations: a parent who still makes you feel small, an ex who controls the schedule, a coworker who takes credit, a boss who keeps adding work.',
  'How to ask for what you want in the open: credit, pay, help, fair terms.',
  'The 21-Day Power Reset: small daily practices, so the new answer is familiar before you need it.',
];

export default function FreeChapterSentPage() {
  return (
    <main className="bg-[color:var(--sp2-paper)] pb-24 md:pb-0">
      {/* ═══ CHECK YOUR EMAIL ═══ */}
      <section className="relative bg-[color:var(--sp2-night)] text-[#efe7da] sp2-grain">
        <header className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6 flex items-center justify-between">
          <Link href="/" className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)]">
            SHADOW PERSUASION
          </Link>
          <a href="#order" className="sp2-small underline underline-offset-[6px] decoration-[color:var(--sp2-gold)]">
            Get the book
          </a>
        </header>
        <div className="max-w-[860px] mx-auto px-5 sm:px-10 pt-14 sm:pt-20 pb-28 sm:pb-36 text-center">
          <img src="/v2/icons/pen.png" alt="" aria-hidden className="w-20 h-20 mx-auto object-contain" style={{ filter: 'invert(0.92) sepia(0.35)' }} />
          <p className="sp2-type text-[16px] tracking-[0.14em] text-[color:var(--sp2-gold)] mt-6">YOU&apos;RE IN</p>
          <h1 className="sp2-display font-medium text-[44px] sm:text-[68px] leading-[1.02] text-[#faf6ee] mt-3">
            Check your email.
            <span className="block italic text-[color:var(--sp2-gold)] text-[34px] sm:text-[50px] mt-3">Your free chapter is on its way.</span>
          </h1>
          <ol className="sp2-ui text-left max-w-[30em] mx-auto mt-10 space-y-4 text-[18px] sm:text-[19px] leading-snug">
            <li className="flex gap-4">
              <span className="sp2-display text-[30px] leading-none text-[color:var(--sp2-gold)]">1</span>
              <span>Open the email from Shadow Persuasion. It usually arrives within a minute or two.</span>
            </li>
            <li className="flex gap-4">
              <span className="sp2-display text-[30px] leading-none text-[color:var(--sp2-gold)]">2</span>
              <span>
                Click <b className="text-white">Read the free chapter</b> to open &ldquo;{FREE_TITLE}.&rdquo;
              </span>
            </li>
            <li className="flex gap-4">
              <span className="sp2-display text-[30px] leading-none text-[color:var(--sp2-gold)]">3</span>
              <span>Not there? Check your spam or promotions folder, and move it to your inbox so the next emails reach you.</span>
            </li>
          </ol>
        </div>
        <div className="absolute bottom-0 inset-x-0 translate-y-[1px] pointer-events-none">
          <img src="/v2/img/torn-soft.webp" alt="" aria-hidden className="block w-full h-auto min-h-[40px] object-cover object-bottom" />
        </div>
      </section>

      {/* ═══ WHILE YOU WAIT: THE WHOLE BOOK ═══ */}
      <Sheet className="pt-20 sm:pt-28 pb-24">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-center">
          <div className="lg:col-span-5">
            <img src="/v2/img/hero-opt-night.webp" alt="The Shadow Persuasion book beside a phone, reading glasses and a cup of tea" className="w-full drop-shadow-[0_30px_30px_rgba(28,27,24,0.35)]" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Heading kicker="While you wait">The chapter shows you the problem. The book gives you the words.</Heading>
            <p className="sp2-lead mt-6 text-[color:var(--sp2-muted)]">
              <b className="text-[color:var(--sp2-ink)]">In the free chapter:</b> {IN_THE_CHAPTER}
            </p>
            <p className="sp2-lead mt-4 text-[color:var(--sp2-muted)]">
              <b className="text-[color:var(--sp2-ink)]">In the other 33:</b> what to actually say the next time it happens.
            </p>
            <div className="mt-8">
              <BuyButton className="w-full sm:w-auto" href="#order" />
              <BuyNote />
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet className="pb-24">
        <div className="max-w-[860px] mx-auto">
          <Heading kicker="What the rest of the book adds">Everything the chapter doesn&apos;t cover.</Heading>
          <div className="mt-10">
            {IN_THE_BOOK.map((t) => (
              <div key={t} className="sp2-rule flex gap-4 py-5 items-start">
                <img src="/v2/ink/check.png" alt="" aria-hidden className="w-7 h-7 flex-shrink-0 mt-1" />
                <p className="text-[20px] sm:text-[21px] leading-[1.5]">{t}</p>
              </div>
            ))}
          </div>
          <MarginNote className="mt-6">Already reading the chapter? The book picks up right where it ends.</MarginNote>
        </div>
      </Sheet>

      {/* ═══ THE OFFER (same as the sales page) ═══ */}
      <Sheet className="pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="sp2-display text-[40px] sm:text-[60px] leading-[1.02]">Here is everything you get.</h2>
        </div>
      </Sheet>
      <Sheet className="pb-24">
        <StackList />
      </Sheet>
      <GuaranteeNight />
      <Sheet id="order" className="pt-28 pb-24 scroll-mt-6">
        <OrderCards />
      </Sheet>
      <Footer />
    </main>
  );
}
