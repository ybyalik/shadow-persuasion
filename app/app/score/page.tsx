'use client';

/* My Progress: plain numbers about what you've done. No scores, no ranks.
   Levels follow the reset itself: Noticing, Pausing, Holding, Quiet Power. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError } from '@/components/app/ui';
import { PHASES, type ResetDay, type ResetEntry } from '@/lib/progress';
import { RESET } from '@/lib/edition';

type Reset = {
  days: ResetDay[];
  entries: ResetEntry[];
  doneCount: number;
  total: number;
  streak: { current: number; longest: number };
  level: { name: string; next: string | null; blurb: string };
};
type Stats = { decoded: number; rehearsals: number; scenes: number; heldGround: number; spotRounds: number; spotRight: number; plans: number };

const LEVELS = ['Noticing', 'Pausing', 'Holding', 'Quiet Power'];
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 rounded-full bg-[color:var(--app-paper-2)] overflow-hidden" aria-hidden>
      <div className="h-full rounded-full bg-[color:var(--app-gold)]" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Stat({ label, value, note, href, cta }: { label: string; value: number | string; note: string; href: string; cta: string }) {
  return (
    <Card className="flex flex-col">
      <Label>{label}</Label>
      <p className="app-serif text-[40px] leading-none font-semibold mb-2">{value}</p>
      <p className="text-[14px] leading-snug text-[color:var(--app-muted)] mb-3">{note}</p>
      <Link href={href} className="mt-auto inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[color:var(--app-accent)] hover:underline">
        {cta}
      </Link>
    </Card>
  );
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [reset, setReset] = useState<Reset | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const tz = new Date().getTimezoneOffset();
    Promise.all([apiFetch(`/api/missions?tz=${tz}`), apiFetch(`/api/user/progress?tz=${tz}`)])
      .then(async ([a, b]) => {
        if (!a.ok) return setError(await friendlyError(a, 'We could not load your progress just now. Please refresh the page.'));
        if (!b.ok) return setError(await friendlyError(b, 'We could not load your progress just now. Please refresh the page.'));
        setReset(await a.json());
        setStats((await b.json()).stats);
      })
      .catch(() => setError('We could not load your progress just now. Please check your connection and refresh.'));
  }, [user]);

  if (error) {
    return (
      <div className="max-w-4xl">
        <PageHeader kicker="My Progress" title="Your progress" />
        <Notice tone="error">{error}</Notice>
      </div>
    );
  }

  if (!reset || !stats) {
    return (
      <div className="max-w-4xl">
        <PageHeader kicker="My Progress" title="Your progress" />
        <p className="text-[color:var(--app-muted)]">Loading…</p>
      </div>
    );
  }

  const done = new Set(reset.entries.map((e) => e.day_number));
  const levelIdx = LEVELS.indexOf(reset.level.name);

  return (
    <div className="max-w-4xl">
      <PageHeader
        kicker="My Progress"
        title="Your progress"
        subtitle="Progress is often invisible from inside a single day. Here is what you have actually done."
      />

      {/* Where you are */}
      <Card tone="night" className="mb-6">
        <p className="app-type text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)] mb-2">Where you are</p>
        <h2 className="app-serif text-[32px] leading-tight font-semibold mb-1">{reset.level.name}</h2>
        <p className="text-[16px] opacity-90 mb-5">{reset.level.blurb}</p>
        <ol className="grid grid-cols-4 gap-2" aria-label="Reset levels">
          {LEVELS.map((l, i) => (
            <li key={l} className="min-w-0">
              <div className={cx('h-1.5 rounded-full mb-2', i <= levelIdx ? 'bg-[color:var(--app-gold)]' : 'bg-white/15')} />
              <span className={cx('block text-[12px] sm:text-[13px] leading-tight', i === levelIdx ? 'font-semibold' : 'opacity-70')}>{l}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* The reset */}
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr] mb-6">
        <Card>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <Label className="!mb-0">{RESET.title}</Label>
            <span className="text-[15px]">
              <strong>{reset.doneCount}</strong> of {reset.total}
            </span>
          </div>
          <div className="mt-3 mb-5">
            <Bar value={reset.doneCount} max={reset.total} />
          </div>
          <ul className="space-y-3">
            {PHASES.map((ph) => {
              const days = reset.days.filter((d) => d.phase === ph.key);
              const n = days.filter((d) => done.has(d.day_number)).length;
              return (
                <li key={ph.key}>
                  <div className="flex items-baseline justify-between gap-2 text-[15px] mb-1">
                    <span>{ph.name}</span>
                    <span className="text-[color:var(--app-muted)]">
                      {n}/{days.length}
                    </span>
                  </div>
                  <Bar value={n} max={days.length} />
                </li>
              );
            })}
          </ul>
          <div className="mt-5">
            <Button href="/app/field-ops" variant="ghost">
              {reset.doneCount === 0 ? 'Start the reset' : reset.doneCount >= reset.total ? 'Read your notes' : 'Continue the reset'}
            </Button>
          </div>
        </Card>

        <Card>
          <Label>Days in a row</Label>
          <p className="app-serif text-[48px] leading-none font-semibold mb-2">{reset.streak.current}</p>
          <p className="text-[14px] text-[color:var(--app-muted)] mb-4">
            {reset.streak.current === 0 ? 'Do a reset step today to start a streak.' : 'Days in a row with a finished reset step.'}
          </p>
          <p className="text-[15px]">
            Longest: <strong>{reset.streak.longest}</strong>
          </p>
          <p className="mt-4 text-[14px] text-[color:var(--app-muted)]">
            Missed days are fine. A reset that takes 25 days works perfectly well.
          </p>
        </Card>
      </div>

      {/* Everything else */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Stat label="Messages decoded" value={stats.decoded} note="Times you looked closely at what was really going on." href="/app/analyze" cta="Decode a message" />
        <Stat label="Times you held your ground" value={stats.heldGround} note="From your practice debriefs, when you kept your answer under pressure." href="/app/spar" cta="Rehearse it" />
        <Stat label="Rehearsals" value={stats.rehearsals} note="Hard conversations you practiced before having them." href="/app/spar" cta="Rehearse it" />
        <Stat label="Practice scenes" value={stats.scenes} note="Scenes from the book you played through." href="/app/training" cta="Practice a scene" />
        <Stat
          label="Spot the Tactic"
          value={stats.spotRounds ? `${stats.spotRight}/${stats.spotRounds}` : 0}
          note="Tactics you named correctly, out of rounds played."
          href="/app/techniques"
          cta="Play a round"
        />
        <Stat label="Conversations planned" value={stats.plans} note="Hard talks you walked into with a plan." href="/app/warroom" cta="Plan a conversation" />
      </div>

      <p className="text-[15px] text-[color:var(--app-muted)]">
        The book has a five-question check-in to rate at the start of each week. Compare them at the end and see what moved.{' '}
        <BookRef chapter={7} title="How the 21 Days Work" />
      </p>
    </div>
  );
}
