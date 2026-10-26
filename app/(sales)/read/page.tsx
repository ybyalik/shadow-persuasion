/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { CHAPTER_ONE_HTML } from '@/lib/sp2/content.generated';
import { FREE_CHAPTER_V3_HTML, FREE_CHAPTER_V3_TITLE } from '@/lib/sp2/free-chapter-v3.generated';
import { IS_V3 } from '@/lib/edition';

const FREE_HTML = IS_V3 ? FREE_CHAPTER_V3_HTML : CHAPTER_ONE_HTML;
const FREE_KICKER = IS_V3 ? 'Free chapter · Chapter 4' : 'Free chapter · Chapter 1';
const FREE_TITLE = IS_V3 ? FREE_CHAPTER_V3_TITLE : 'The 3 A.M. Replay';

// The free chapter, linked only from the welcome email (the signup form lands on /free-chapter instead,
// so a fake email gets nothing). Hidden from search engines by the layout.
// The chapter text comes from lib/sp2/content.generated.ts (maintained separately). Its title below must match it.
export const metadata = { title: `Free chapter: ${FREE_TITLE} | Shadow Persuasion: The Hidden Rules of Power` };

export default function FreeChapterPage() {
  return (
    <main>
      <header className="bg-[color:var(--sp2-paper)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between">
          <Link href="/" className="sp2-type text-[16px] tracking-[0.12em] text-[color:var(--sp2-accent)]">
            SHADOW PERSUASION
          </Link>
          <Link href="/checkout" className="sp2-small underline underline-offset-4">
            Get the full book
          </Link>
        </div>
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-6">
          <img src="/v2/lino/replay.jpg" alt="" aria-hidden className="w-full" />
          <p className="sp2-kicker mt-10">{FREE_KICKER}</p>
          <h1 className="sp2-h1">{FREE_TITLE}</h1>
        </div>
      </header>

      <article className="max-w-[680px] mx-auto px-4 sm:px-6 pt-12 pb-16">
        <div className="sp2-prose" dangerouslySetInnerHTML={{ __html: FREE_HTML }} />

        <div className="mt-16 rounded-xl overflow-hidden bg-[color:var(--sp2-night)] text-[#e9e2d6] shadow-2xl">
          <img src="/v2/img/bundle-hero.jpg" alt="The Shadow Persuasion paperback with the journal and bonuses" className="w-full aspect-[16/9] object-cover" />
          <div className="p-7 sm:p-9">
            <p className="sp2-kicker !text-[color:var(--sp2-gold)] mb-3">Keep going</p>
            <h2 className="text-[30px] leading-tight font-medium text-white mb-3">The rest of the book is the practice.</h2>
            <p className="text-[19px] leading-relaxed mb-7">
              The full book has 34 chapters in seven parts: who really decides, the rules you never chose, calm answers to guilt, changing
              stories and silence, how to ask for what you want in the open, and situation chapters for work, money, exes and family. It ends
              with the 21-Day Power Reset and its journal. The paperback ships to your door, and the digital copy arrives the moment you order.
            </p>
            <Link href="/checkout" className="sp2-btn sp2-btn-gold  w-full sm:w-auto">
              Get the paperback for $67 →
            </Link>
            <p className="sp2-ui mt-3 text-[17px] text-[#bdb4a5]">Free US shipping · Digital copy emailed instantly · 30-day money-back guarantee</p>
          </div>
        </div>
      </article>
    </main>
  );
}
