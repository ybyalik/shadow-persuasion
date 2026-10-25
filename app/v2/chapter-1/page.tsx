/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { CHAPTER_ONE_HTML } from '@/lib/sp2/content.generated';

// The chapter text comes from lib/sp2/content.generated.ts (maintained separately). Its title below must match it.
export const metadata = { title: 'Chapter 1: The 3 A.M. Replay | Shadow Persuasion: The Hidden Rules of Power' };

export default async function ChapterOnePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  return (
    <main>
      <header className="bg-[color:var(--sp2-paper)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between">
          <Link href="/v2" className="sp2-type text-[16px] tracking-[0.12em] text-[color:var(--sp2-accent)]">
            SHADOW PERSUASION
          </Link>
          <Link href="/v2/checkout" className="sp2-small underline underline-offset-4">
            Get the full book
          </Link>
        </div>
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-6">
          <img src="/v2/lino/replay.jpg" alt="" aria-hidden className="w-full" />
          <p className="sp2-kicker mt-10">Free chapter · Chapter 1</p>
          <h1 className="sp2-h1">The 3 A.M. Replay</h1>
        </div>
      </header>

      <article className="max-w-[680px] mx-auto px-4 sm:px-6 pt-12 pb-16">
        {welcome && (
          <div className="sp2-ui mb-10 rounded-lg border border-[color:var(--sp2-gold)] bg-[color:var(--sp2-card)] px-5 py-4 text-[17px] leading-relaxed">
            You&apos;re in. We&apos;ve also emailed you a link to this chapter, so you can come back to it anytime.
          </div>
        )}
        <div className="sp2-prose" dangerouslySetInnerHTML={{ __html: CHAPTER_ONE_HTML }} />

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
            <Link href="/v2/checkout" className="sp2-btn sp2-btn-gold  w-full sm:w-auto">
              Get the paperback for $67 →
            </Link>
            <p className="sp2-ui mt-3 text-[17px] text-[#bdb4a5]">Free US shipping · Digital copy emailed instantly · 30-day money-back guarantee</p>
          </div>
        </div>
      </article>
    </main>
  );
}
