'use client';

/* "What to do next", in the book's terms (from /api/recommendations).
   Quietly shows nothing if suggestions can't load: it's a nice-to-have. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { BookRef, Label } from '@/components/app/ui';

type Suggestion = { title: string; body: string; href: string; cta: string; chapter?: number; chapterTitle?: string };

export function RecommendationPanel({ className }: { className?: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Suggestion[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    apiFetch(`/api/recommendations?tz=${new Date().getTimezoneOffset()}`)
      .then((r) => (r.ok ? r.json() : { suggestions: [] }))
      .then((d) => alive && setItems(d.suggestions ?? []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [user]);

  if (!items || items.length === 0) return null;

  return (
    <section className={className}>
      <Label>What to do next</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <div key={s.title} className="flex flex-col rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-5">
            <p className="app-serif text-[20px] leading-snug font-semibold mb-1">{s.title}</p>
            <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)] mb-3">{s.body}</p>
            {s.chapterTitle && (
              <div className="mb-3">
                <BookRef chapter={s.chapter} title={s.chapterTitle} />
              </div>
            )}
            <Link
              href={s.href}
              className="mt-auto inline-flex min-h-[44px] items-center gap-1.5 self-start text-[15px] font-semibold text-[color:var(--app-accent)] hover:underline"
            >
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
