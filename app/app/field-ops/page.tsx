'use client';

/* The 21-Day Reset: Part Two of the book, one step at a time.
   (v3 edition: the 21-Day Power Reset, Part VII, Days 1 to 21; labels come from lib/edition.ts RESET.)
   3-Day Quick Start (Chapter 6), then Week 1 Notice, Week 2 Pause, Week 3 Hold.
   People go at their own pace; one step a day is the suggestion, not a lock. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Circle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { PHASES, type ResetDay, type ResetEntry } from '@/lib/progress';
import { RESET } from '@/lib/edition';

type ResetData = {
  days: ResetDay[];
  entries: ResetEntry[];
  currentDay: number | null;
  doneCount: number;
  total: number;
  streak: { current: number; longest: number };
  level: { name: string; next: string | null; blurb: string };
};

const tz = () => new Date().getTimezoneOffset();
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ResetPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ResetData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const [reflectError, setReflectError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/missions?tz=${tz()}`);
      if (!res.ok) {
        setLoadError(await friendlyError(res, 'We could not load your reset just now. Please refresh the page.'));
        return;
      }
      const d: ResetData = await res.json();
      setData(d);
      setLoadError(null);
      setSelected((s) => s ?? d.currentDay ?? d.total);
    } catch {
      setLoadError('We could not load your reset just now. Please check your connection and refresh.');
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const entryByDay = useMemo(() => new Map((data?.entries ?? []).map((e) => [e.day_number, e])), [data]);
  const day = data?.days.find((d) => d.day_number === selected) ?? null;
  const entry = selected ? entryByDay.get(selected) : undefined;
  const isDone = Boolean(entry);

  // Fill the text box with the saved note whenever the chosen step changes.
  useEffect(() => {
    setNote(entry?.note ?? '');
    setSaveError(null);
    setSavedMsg(null);
    setReflectError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function save() {
    if (!day) return;
    setSaving(true);
    setSaveError(null);
    setSavedMsg(null);
    try {
      const res = await apiFetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: day.day_number, note, tz: tz() }),
      });
      if (!res.ok) {
        setSaveError(await friendlyError(res, 'We could not save that just now. Your note is still here, so please try again.'));
        return;
      }
      const d: ResetData & { ok: boolean } = await res.json();
      setData(d);
      setSavedMsg(isDone ? 'Note updated.' : "Saved. That step is done.");
    } catch {
      setSaveError('We could not save that just now. Your note is still here, so please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function reflect() {
    if (!day) return;
    setReflecting(true);
    setReflectError(null);
    try {
      const res = await apiFetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: day.day_number }),
      });
      if (!res.ok) {
        setReflectError(await friendlyError(res, 'We could not write a reflection just now. Your note is saved.'));
        return;
      }
      const { reflection } = await res.json();
      setData((d) =>
        d ? { ...d, entries: d.entries.map((e) => (e.day_number === day.day_number ? { ...e, reflection } : e)) } : d
      );
    } catch {
      setReflectError('We could not write a reflection just now. Your note is saved.');
    } finally {
      setReflecting(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-3xl">
        <PageHeader kicker={RESET.partLabel} title={RESET.title} />
        <Notice tone="error">{loadError}</Notice>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl">
        <PageHeader kicker={RESET.partLabel} title={RESET.title} />
        <p className="text-[color:var(--app-muted)]">Loading your reset…</p>
      </div>
    );
  }

  const allDone = data.currentDay === null;
  const pct = Math.round((data.doneCount / data.total) * 100);
  const noteChanged = (entry?.note ?? '') !== note.trim();

  return (
    <div className="max-w-5xl">
      <PageHeader
        kicker={RESET.partLabel}
        title={RESET.title}
        subtitle="About fifteen minutes a day. One step a day is a good pace, but go at yours. Missed a day? That's fine. Don't start over, just pick up where you left off."
      />

      {/* Progress strip */}
      <div className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2 text-[15px]">
          <span>
            <strong>{data.doneCount}</strong> of {data.total} steps done
          </span>
          <span className="text-[color:var(--app-muted)]">
            {data.streak.current > 0
              ? `${data.streak.current} ${data.streak.current === 1 ? 'day' : 'days'} in a row`
              : 'Your streak starts with your next step'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[color:var(--app-paper-2)] overflow-hidden" aria-hidden>
          <div className="h-full rounded-full bg-[color:var(--app-gold)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] items-start">
        {/* The chosen step */}
        <div className="space-y-4 min-w-0">
          {allDone && selected === data.total && isDone && (
            <Card tone="night">
              <Label className="!text-[color:var(--app-gold)]">You finished the reset</Label>
              <p className="app-serif text-[24px] leading-snug mb-2">Three weeks isn&apos;t the end of this work. It&apos;s the end of the beginning.</p>
              <p className="text-[15px] leading-relaxed opacity-90">
                To keep it going, pick one courage drill each week and do it once. Keep writing a short note two or three
                times a week. And when a hard conversation comes up, use the buffer, then come back to the book.
              </p>
            </Card>
          )}

          {day && (
            <Card tone={selected === data.currentDay ? 'gold' : 'plain'}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <Label className="!mb-0">
                  {selected === data.currentDay ? `Today's step · ${day.label}` : day.label}
                </Label>
                {isDone && entry && (
                  <span className="app-type text-[11px] text-[color:var(--app-sage)]">Done {formatDay(entry.completed_at)}</span>
                )}
              </div>
              <h2 className="app-serif text-[28px] sm:text-[30px] leading-tight font-semibold mb-3">{day.title}</h2>
              <p className="text-[16px] leading-relaxed mb-4">{day.drill}</p>
              <p className="text-[15px] text-[color:var(--app-muted)] mb-4">
                <span className="font-semibold text-[color:var(--app-ink)]">This morning: </span>
                {day.morning_prompt}
              </p>
              <BookRef chapter={day.chapter} title={day.chapter_title} />

              <div className="mt-6 border-t border-[color:var(--app-line)] pt-5">
                <Label>How did it go?</Label>
                <p className="text-[15px] text-[color:var(--app-muted)] mb-3">
                  Write in the evening, even two lines, even on a bad day. Especially on a bad day.
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[15px] mb-4">
                  {day.journal_prompts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
                <label htmlFor="reset-note" className="sr-only">
                  Your note for {day.title}
                </label>
                <textarea
                  id="reset-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={7}
                  maxLength={8000}
                  placeholder="What happened, what you felt, what you noticed…"
                  className={cx(inputClass, 'resize-y leading-relaxed')}
                />
                {saveError && (
                  <div className="mt-3">
                    <Notice tone="error">{saveError}</Notice>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {!isDone ? (
                    <Button onClick={save} loading={saving} variant={selected === data.currentDay ? 'gold' : 'primary'}>
                      <Check className="h-4 w-4" /> Mark done
                    </Button>
                  ) : (
                    <Button onClick={save} loading={saving} variant="ghost" disabled={!noteChanged}>
                      Save changes
                    </Button>
                  )}
                  {savedMsg && <span className="text-[15px] text-[color:var(--app-sage)]">{savedMsg}</span>}
                  {isDone && !allDone && data.currentDay !== selected && data.currentDay && (
                    <Button variant="ghost" onClick={() => setSelected(data.currentDay)}>
                      Go to your next step
                    </Button>
                  )}
                </div>
              </div>

              {/* Optional short reflection on the saved note */}
              {isDone && entry && (entry.note?.trim().length ?? 0) >= 10 && (
                <div className="mt-6 rounded-lg bg-[color:var(--app-paper-2)] p-4">
                  {entry.reflection ? (
                    <>
                      <Label>A thought on your note</Label>
                      <p className="text-[15px] leading-relaxed whitespace-pre-line">{entry.reflection}</p>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[15px] text-[color:var(--app-muted)]">Want a short reflection on what you wrote?</p>
                      <Button variant="ghost" onClick={reflect} loading={reflecting} disabled={noteChanged}>
                        <Sparkles className="h-4 w-4" /> Reflect on my note
                      </Button>
                    </div>
                  )}
                  {noteChanged && !entry.reflection && (
                    <p className="mt-2 text-[13px] text-[color:var(--app-muted)]">Save your changes first.</p>
                  )}
                  {reflectError && (
                    <div className="mt-3">
                      <Notice tone="error">{reflectError}</Notice>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* The map of all 24 steps */}
        <div className="space-y-5 min-w-0">
          {PHASES.map((ph) => {
            const days = data.days.filter((d) => d.phase === ph.key);
            const done = days.filter((d) => entryByDay.has(d.day_number)).length;
            return (
              <Card key={ph.key} className="!p-4 sm:!p-5">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="app-serif text-[20px] font-semibold">{ph.name}</h3>
                  <span className="app-type text-[11px] text-[color:var(--app-muted)]">
                    {done}/{days.length}
                  </span>
                </div>
                <p className="text-[14px] text-[color:var(--app-muted)] mb-3">{ph.blurb}</p>
                <ul className="space-y-1">
                  {days.map((d) => {
                    const isSel = d.day_number === selected;
                    const isCur = d.day_number === data.currentDay;
                    const isDoneDay = entryByDay.has(d.day_number);
                    const short = d.phase === 'quick_start' ? `Day ${d.day_number}` : `Day ${d.day_number - RESET.dayOffset}`;
                    return (
                      <li key={d.day_number}>
                        <button
                          type="button"
                          onClick={() => setSelected(d.day_number)}
                          aria-current={isSel ? 'true' : undefined}
                          className={cx(
                            'w-full min-h-[44px] flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] transition-colors',
                            isSel ? 'bg-[color:var(--app-paper-2)] ring-1 ring-[color:var(--app-line)]' : 'hover:bg-[color:var(--app-paper-2)]'
                          )}
                        >
                          <span
                            className={cx(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                              isDoneDay && 'border-[color:var(--app-sage)] bg-[color:var(--app-sage)] text-[color:var(--app-paper)]',
                              !isDoneDay && isCur && 'border-[color:var(--app-gold)] text-[color:var(--app-gold)]',
                              !isDoneDay && !isCur && 'border-[color:var(--app-line)] text-[color:var(--app-muted)]'
                            )}
                            aria-hidden
                          >
                            {isDoneDay ? <Check className="h-3.5 w-3.5" /> : isCur ? <Circle className="h-2.5 w-2.5 fill-current" /> : null}
                          </span>
                          <span className="app-type w-14 shrink-0 text-[11px] text-[color:var(--app-muted)]">{short}</span>
                          <span className={cx('min-w-0 flex-1', isCur && !isDoneDay && 'font-semibold')}>{d.title}</span>
                          <span className="sr-only">{isDoneDay ? '(done)' : isCur ? '(today)' : '(upcoming)'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}

          {data.entries.some((e) => e.note) && (
            <Card className="!p-4 sm:!p-5">
              <h3 className="app-serif text-[20px] font-semibold mb-1">Your notes</h3>
              <p className="text-[14px] text-[color:var(--app-muted)] mb-3">
                Reading back is part of the reset. It shows progress you can&apos;t see from inside a single day.
              </p>
              <ul className="space-y-1">
                {[...data.entries]
                  .filter((e) => e.note)
                  .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
                  .map((e) => {
                    const d = data.days.find((x) => x.day_number === e.day_number);
                    return (
                      <li key={e.day_number}>
                        <button
                          type="button"
                          onClick={() => setSelected(e.day_number)}
                          className="w-full min-h-[44px] rounded-lg px-3 py-2 text-left hover:bg-[color:var(--app-paper-2)]"
                        >
                          <span className="block text-[15px] font-medium">{d?.title}</span>
                          <span className="block truncate text-[14px] text-[color:var(--app-muted)]">
                            {formatDay(e.completed_at)} · {e.note}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
