'use client';

/* Eight Tools: the book's eight named tools as short cards (from The Power Map and
   Decision Cards bonus). Each card links to the part of the app that puts it to work.
   New edition only (lib/edition.ts). */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BONUSES, IS_V3 } from '@/lib/edition';
import { TOOL_CARDS, cardChapter } from '@/lib/tool-cards';
import { Card, Label, PageHeader } from '@/components/app/ui';
import { ComingSoon } from '@/components/app/ComingSoon';

export default function ToolsPage() {
  if (!IS_V3) {
    return <ComingSoon title="Eight Tools" body="Short cards for the eight tools in the book, each linked to the part of the app that helps you use it." />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        kicker="The book's tools"
        title="Eight Tools"
        subtitle="Short reminders, not lessons. Read a card in the minute before you decide. If you haven't read the chapter behind a card yet, read it first."
      />

      <nav aria-label="Jump to a tool" className="mb-8 flex flex-wrap gap-2 print:hidden">
        {TOOL_CARDS.map((t) => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            className="inline-flex min-h-[40px] items-center rounded-full border border-[color:var(--app-line)] px-3.5 text-[14px] hover:bg-[color:var(--app-paper-2)]"
          >
            {t.name}
          </a>
        ))}
      </nav>

      <div className="space-y-5">
        {TOOL_CARDS.map((t, idx) => (
          <Card key={t.slug} className="scroll-mt-20">
            <div id={t.slug} className="scroll-mt-20" />
            <p className="app-type text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Card {idx + 1}</p>
            <h2 className="app-serif mt-1 text-[26px] font-semibold leading-tight">{t.name}</h2>
            <p className="mt-2 text-[17px] leading-relaxed">{t.what}</p>

            <div className="mt-5">
              <Label>When to use it</Label>
              <p className="text-[16px] leading-relaxed">{t.when}</p>
            </div>

            <div className="mt-5">
              <Label>Steps</Label>
              <ol className="space-y-2.5">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[16px] leading-relaxed">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--app-paper-2)] text-[14px] font-semibold">{i + 1}</span>
                    <span>
                      <span className="font-semibold">{s.title}</span> {s.body}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 rounded-lg bg-[color:var(--app-paper-2)] px-4 py-3">
              <p className="app-type mb-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">A line you could say</p>
              <p className="app-serif text-[18px] leading-snug">&ldquo;{t.example}&rdquo;</p>
              {t.exampleNote && <p className="mt-1 text-[14px] text-[color:var(--app-muted)]">{t.exampleNote}</p>}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {t.chapters.map((c) => (
                <span
                  key={c.n}
                  className="app-type inline-flex items-center rounded-md bg-[color:var(--app-paper-2)] px-2 py-1 text-[11px] tracking-wide text-[color:var(--app-muted)]"
                >
                  In the book: {cardChapter(c)}
                </span>
              ))}
            </div>

            {t.app && t.app.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 print:hidden">
                {t.app.map((a) => (
                  <Link key={a.href + a.label} href={a.href} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[color:var(--app-accent)] hover:underline">
                    {a.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <p className="mt-8 text-[14px] leading-relaxed text-[color:var(--app-muted)]">
        From {BONUSES.cards}, which comes with the book. If there is fear, threats, physical harm, stalking, or control of your money or devices, no card is the
        answer. Go to Chapter 11, When Pressure Becomes Danger, and get help suited to your situation. In the US, the National Domestic Violence Hotline is
        1-800-799-7233 (text START to 88788). In immediate danger, call 911.
      </p>
    </div>
  );
}
