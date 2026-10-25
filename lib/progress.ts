/**
 * Shared pieces for the 21-Day Reset and My Progress.
 * Pure helpers only (no database, no browser storage), so both API routes and
 * pages can import them.
 */

import { RESET, type ResetPhaseKey } from '@/lib/edition';

/** Steps in the reset: 24 in the v2 book (3 quick start + 21 days), 21 in v3 (Days 1 to 21). See lib/edition.ts. */
export const RESET_TOTAL = RESET.total;

export type ResetPhase = ResetPhaseKey;

export type ResetDay = {
  day_number: number;
  phase: ResetPhase;
  label: string;
  title: string;
  drill: string;
  morning_prompt: string;
  journal_prompts: string[];
  chapter: number;
  chapter_title: string;
};

export type ResetEntry = {
  day_number: number;
  note: string | null;
  reflection: string | null;
  completed_at: string;
};

export const PHASES: { key: ResetPhase; name: string; short: string; chapter: number; chapterTitle: string; blurb: string }[] = RESET.phases;

/**
 * Plain progress levels named after the reset.
 * Based only on reset steps finished, so the name always matches where you are.
 */
export function resetLevel(doneCount: number): { name: string; next: string | null; blurb: string } {
  if (doneCount >= RESET_TOTAL) return { name: 'Quiet Power', next: null, blurb: 'You finished the reset. Keep one drill a week going.' };
  if (doneCount >= RESET.levels.holding) return { name: 'Holding', next: 'Quiet Power', blurb: 'Staying calm and steady when people push.' };
  if (doneCount >= RESET.levels.pausing) return { name: 'Pausing', next: 'Holding', blurb: 'Making space before you answer.' };
  return { name: 'Noticing', next: 'Pausing', blurb: 'Learning to see pressure while it happens.' };
}

/** The step to work on now: the first one not finished yet (1 to RESET_TOTAL), or null when all are done. */
export function currentResetDay(doneDays: number[]): number | null {
  const done = new Set(doneDays);
  for (let d = 1; d <= RESET_TOTAL; d++) if (!done.has(d)) return d;
  return null;
}

function localDate(iso: string, tzOffsetMin: number) {
  return new Date(new Date(iso).getTime() - tzOffsetMin * 60_000).toISOString().slice(0, 10);
}

/**
 * Days in a row with at least one finished step, counting back from today
 * (or from yesterday, so the streak doesn't vanish before you've had a chance today).
 * tzOffsetMin is the browser's getTimezoneOffset().
 */
export function dayStreak(timestamps: string[], tzOffsetMin = 0): { current: number; longest: number } {
  const days = Array.from(new Set(timestamps.map((t) => localDate(t, tzOffsetMin)))).sort().reverse();
  if (!days.length) return { current: 0, longest: 0 };
  const dayMs = 86_400_000;
  const gap = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / dayMs);

  const today = localDate(new Date().toISOString(), tzOffsetMin);
  let current = 0;
  if (gap(today, days[0]) <= 1) {
    current = 1;
    for (let i = 1; i < days.length && gap(days[i - 1], days[i]) === 1; i++) current++;
  }
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = gap(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest: Math.max(longest, current) };
}
