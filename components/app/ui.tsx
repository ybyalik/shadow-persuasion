'use client';

/* Shared building blocks for app pages, in the book's look.
   Colors come from the .sp-app CSS variables in app/globals.css, so light and
   dark mode both work. Use these instead of one-off styles. */

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { CHAPTERS_V3, v3ChapterForLegacyTitle } from '@/lib/edition';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Page title block: small typewriter label, serif title, plain-English subtitle. */
export function PageHeader({ kicker, title, subtitle, right }: { kicker?: string; title: string; subtitle?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && <p className="app-type text-[12px] uppercase tracking-[0.2em] text-[color:var(--app-accent)] mb-2">{kicker}</p>}
        <h1 className="app-serif text-[34px] sm:text-[40px] leading-[1.08] font-semibold">{title}</h1>
        {subtitle && <p className="mt-3 text-[16px] sm:text-[17px] leading-relaxed text-[color:var(--app-muted)]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className, tone = 'plain' }: { children: React.ReactNode; className?: string; tone?: 'plain' | 'night' | 'gold' }) {
  return (
    <div
      className={cx(
        'rounded-xl border p-5 sm:p-6',
        tone === 'plain' && 'border-[color:var(--app-line)] bg-[color:var(--app-card)]',
        tone === 'night' && 'border-transparent bg-[color:var(--app-night)] text-[#efe9df]',
        tone === 'gold' && 'border-[color:var(--app-gold)] bg-[color:var(--app-card)]',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Small typewriter label used above a block of content. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx('app-type text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-accent)] mb-2', className)}>{children}</p>;
}

type BtnProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'gold' | 'ghost';
  loading?: boolean;
  className?: string;
} & ({ href: string; onClick?: never; type?: never; disabled?: never } | { href?: never; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean });

export function Button(props: BtnProps) {
  const { children, variant = 'primary', loading, className } = props;
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    variant === 'primary' && 'bg-[color:var(--app-ink)] text-[color:var(--app-paper)] hover:opacity-90',
    variant === 'gold' && 'bg-[color:var(--app-gold)] text-[#0b0a08] hover:brightness-105',
    variant === 'ghost' && 'border border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]',
    className
  );
  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? 'button'} onClick={props.onClick} disabled={props.disabled || loading} className={cls}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputClass =
  'w-full rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3 text-[16px] text-[color:var(--app-ink)] placeholder:text-[color:var(--app-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--app-accent)]';

/** Friendly notice for errors, limits and empty states. Never put raw errors in here. */
export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warn' | 'error' }) {
  return (
    <div
      className={cx(
        'rounded-lg border px-4 py-3 text-[15px] leading-relaxed',
        tone === 'info' && 'border-[color:var(--app-line)] bg-[color:var(--app-paper-2)]',
        tone === 'warn' && 'border-[color:var(--app-gold)] bg-[color:var(--app-card)]',
        tone === 'error' && 'border-[color:var(--app-oxblood)]/40 bg-[color:var(--app-card)] text-[color:var(--app-oxblood)]'
      )}
    >
      {children}
    </div>
  );
}

/** Points to the chapter in the book that covers this, e.g. <BookRef chapter={11} title="Guilt and Obligation" />. */
export function BookRef({ chapter, title }: { chapter?: number; title: string }) {
  // Pointers saved under the v2 book (old decodes, plans, goals) show the matching v3 chapter after launch (lib/edition.ts).
  const v3 = v3ChapterForLegacyTitle(title);
  const shownChapter = v3 ?? chapter;
  const shownTitle = v3 ? CHAPTERS_V3[v3] : title;
  return (
    <span className="app-type inline-flex items-center gap-1.5 rounded-md bg-[color:var(--app-paper-2)] px-2 py-1 text-[11px] tracking-wide text-[color:var(--app-muted)]">
      In the book: {shownChapter ? `Chapter ${shownChapter}, ` : ''}
      {shownTitle}
    </span>
  );
}

/**
 * Turns an API error response into a friendly sentence for the screen.
 * Routes send { error, message } for limits (429) and ended access (403).
 */
export async function friendlyError(res: Response, fallback = 'Something went wrong. Please try again.') {
  try {
    const d = await res.json();
    if (res.status === 429 || res.status === 403) return d.message || fallback;
    return typeof d.error === 'string' && d.error.length < 160 ? d.error : fallback;
  } catch {
    return fallback;
  }
}
