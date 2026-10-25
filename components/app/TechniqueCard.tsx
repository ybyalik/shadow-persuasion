'use client';

import Link from 'next/link';

/** One tactic in the Spot the Tactic library. */
export type TacticSummary = {
  slug: string;
  name: string;
  looks_like: string;
  chapter: number;
  chapter_title: string;
};

const STATUS_STYLE: Record<string, string> = {
  due: 'bg-[color:var(--app-gold)]/25 text-[color:var(--app-ink)]',
  learning: 'bg-[color:var(--app-paper-2)] text-[color:var(--app-muted)]',
  known: 'bg-[color:var(--app-sage)]/15 text-[color:var(--app-sage)]',
};

export function TechniqueCard({ tactic, href, status, statusLabel }: { tactic: TacticSummary; href?: string; status?: string; statusLabel?: string }) {
  return (
    <Link
      href={href || `/app/techniques/${tactic.slug}`}
      className="block min-h-[44px] rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4 transition-colors hover:border-[color:var(--app-accent)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="app-serif text-[20px] font-semibold leading-snug">{tactic.name}</h3>
        {status && status !== 'new' && statusLabel && (
          <span className={`app-type shrink-0 rounded-md px-2 py-1 text-[10px] uppercase tracking-wide ${STATUS_STYLE[status] ?? ''}`}>{statusLabel}</span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{tactic.looks_like}</p>
    </Link>
  );
}
