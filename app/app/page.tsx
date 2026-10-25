'use client';

/* Today: a calm start page. Today's reset step, the four things people reach
   for most, what to do next, and what you did recently. A brand-new reader first
   sees a short welcome (components/app/Welcome.tsx); Settings reopens it with ?welcome=1. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ClipboardList, LifeBuoy, MessageSquareText, Mic } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError } from '@/components/app/ui';
import { RecommendationPanel } from '@/components/app/RecommendationPanel';
import { IS_V3, RESET } from '@/lib/edition';
import { Welcome, WELCOME_DONE_KEY } from '@/components/app/Welcome';

type Progress = {
  reset: {
    doneCount: number;
    total: number;
    streak: { current: number; longest: number };
    level: { name: string };
    currentDay: { day_number: number; label: string; title: string; drill: string; practice?: string | null; chapter: number; chapter_title: string } | null;
    doneToday: boolean;
  };
  recent: { kind: string; label: string; detail: string; date: string; href: string }[];
};

const QUICK = [
  { href: '/app/analyze', title: 'Decode a Message', body: 'See what is really going on in a text or email.', Icon: MessageSquareText },
  { href: '/app/assist', title: 'Right Now', body: 'In the middle of it? Get a calm line to say.', Icon: LifeBuoy },
  { href: '/app/warroom', title: 'Plan a Conversation', body: 'Know what to say before a hard talk.', Icon: ClipboardList },
  { href: '/app/spar', title: 'Rehearse It', body: 'Practice out loud with a pretend version of them.', Icon: Mic },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TodayPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(false);
  const router = useRouter();

  // Asked for again from Settings (?welcome=1, or the older localStorage flag).
  useEffect(() => {
    let asked = false;
    try {
      asked = new URLSearchParams(window.location.search).get('welcome') === '1' || localStorage.getItem('shadow-force-onboarding') === 'true';
    } catch {
      asked = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (asked) setWelcome(true);
  }, []);

  // First run: nothing done yet and the welcome never finished on this device.
  // Only decided when the progress request succeeded, so a slow network never
  // drops an existing reader into the welcome.
  useEffect(() => {
    if (!data) return;
    let done = true;
    try {
      done = localStorage.getItem(WELCOME_DONE_KEY) === '1';
    } catch {
      done = true;
    }
    if (done || data.reset.doneCount > 0 || data.recent.length > 0) return;
    // A reader who answered on another device has goals saved already.
    apiFetch('/api/user')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !(Array.isArray(d.profile?.goals) && d.profile.goals.length > 0)) setWelcome(true);
      })
      .catch(() => {});
  }, [data]);

  const closeWelcome = () => {
    setWelcome(false);
    if (typeof window !== 'undefined' && window.location.search.includes('welcome')) router.replace('/app');
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!user) return;
    apiFetch(`/api/user/progress?tz=${new Date().getTimezoneOffset()}`)
      .then(async (res) => {
        if (!res.ok) return setError(await friendlyError(res, 'We could not load today just now. Please refresh the page.'));
        setData(await res.json());
      })
      .catch(() => setError('We could not load today just now. Please check your connection and refresh.'));
  }, [user]);

  const first = (user?.displayName || '').trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const r = data?.reset;

  if (welcome) {
    return (
      <div className="max-w-4xl">
        <Welcome firstName={first} onDone={closeWelcome} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        kicker={today}
        title={`${greeting()}${first ? `, ${first}` : ''}.`}
        subtitle="One small step today. Everything else is here for when something comes up."
      />

      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {/* Today's reset step */}
      {!data && !error && (
        <Card className="mb-8">
          <p className="text-[color:var(--app-muted)]">Loading today&apos;s step…</p>
        </Card>
      )}
      {r && (
        <Card tone="night" className="mb-8">
          {r.currentDay ? (
            <>
              <p className="app-type text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)] mb-2">
                {r.doneToday ? 'Next reset step' : "Today's reset step"} · {r.currentDay.label}
              </p>
              <h2 className="app-serif text-[28px] sm:text-[32px] leading-tight font-semibold mb-3">{r.currentDay.title}</h2>
              {r.doneToday ? (
                <p className="text-[16px] leading-relaxed opacity-90 mb-5 flex items-start gap-2">
                  <Check className="h-5 w-5 mt-0.5 shrink-0 text-[color:var(--app-gold)]" />
                  You did a step today. The next one is ready whenever you are, tomorrow is a good time.
                </p>
              ) : (
                <>
                <p className="text-[16px] leading-relaxed opacity-90 mb-5">
                  {r.currentDay.practice ? <>Today&apos;s practice: {r.currentDay.practice}</> : r.currentDay.drill}
                </p>
                {[1, 7, 14, 21].includes(r.currentDay.day_number) && IS_V3 && (
                  <p className="text-[15px] opacity-85 -mt-3 mb-5">There&apos;s a short check-in on today&apos;s page.</p>
                )}
                </>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <Button href="/app/field-ops" variant="gold">
                  {r.doneToday ? 'See the reset' : r.doneCount === 0 ? 'Start the reset' : "Open today's step"} <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-[14px] opacity-80">
                  {r.doneCount} of {r.total} done
                  {r.streak.current > 1 ? ` · ${r.streak.current} days in a row` : ''}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="app-type text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)] mb-2">{RESET.title}</p>
              <h2 className="app-serif text-[28px] leading-tight font-semibold mb-3">You finished all {RESET.total} {RESET.dayOffset ? 'steps' : 'days'}.</h2>
              <p className="text-[16px] leading-relaxed opacity-90 mb-5">
                Keep it going with one courage drill a week, and a short note two or three times a week.
              </p>
              <Button href="/app/field-ops" variant="gold">
                Read your notes <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Quick actions */}
      <section className="mb-10">
        <Label>When something comes up</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK.map(({ href, title, body, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-5 transition-colors hover:bg-[color:var(--app-paper-2)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--app-paper-2)] text-[color:var(--app-accent)]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">{title}</span>
                <span className="block text-[15px] leading-snug text-[color:var(--app-muted)]">{body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <RecommendationPanel className="mb-10" />

      {/* Recently */}
      {data && data.recent.length > 0 && (
        <section className="mb-6">
          <Label>Recently</Label>
          <Card className="!p-2 sm:!p-3">
            <ul>
              {data.recent.map((item, i) => (
                <li key={`${item.kind}-${item.date}-${i}`}>
                  <Link href={item.href} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[color:var(--app-paper-2)]">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{item.label}</span>
                      {item.detail && <span className="block truncate text-[14px] text-[color:var(--app-muted)]">{item.detail}</span>}
                    </span>
                    <span className="app-type shrink-0 text-[11px] text-[color:var(--app-muted)]">{when(item.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {data && data.recent.length === 0 && (
        <p className="text-[15px] text-[color:var(--app-muted)]">
          Nothing here yet. Your decodes, practice and reset steps will show up here. {IS_V3 ? <BookRef chapter={31} title="Your Three-Day Quick Start" /> : <BookRef chapter={7} title="How the 21 Days Work" />}
        </p>
      )}
    </div>
  );
}
