/** Server-only: loads the reset steps and one person's progress. Used by the reset, Today and My Progress routes. */
import { createClient } from '@supabase/supabase-js';
import { RESET } from '@/lib/edition';
import { RESET_TOTAL, currentResetDay, dayStreak, resetLevel, type ResetDay, type ResetEntry } from '@/lib/progress';

export const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/** v3 check-ins, tool pages and reviews (migration 032). Not applied yet at the time of writing. */
export const PAGES_TABLE = 'reset_pages_v3';

/**
 * True when Supabase says a table or column isn't there yet (a migration not applied),
 * so screens can show a friendly "not switched on yet" state instead of failing.
 */
export function isMissingSchema(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return false;
  if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(e.code ?? '')) return true;
  const m = (e.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('schema cache');
}

export async function loadReset(uid: string, tzOffsetMin: number) {
  const [daysRes, entriesRes] = await Promise.all([
    // '*' so the v3 "practice" column (migration 032) comes along when it exists, and nothing breaks when it doesn't.
    db.from(RESET.daysTable).select('*').order('day_number'),
    db.from(RESET.progressTable).select('day_number, note, reflection, completed_at').eq('user_id', uid).order('day_number'),
  ]);
  if (daysRes.error) throw daysRes.error;
  if (entriesRes.error) throw entriesRes.error;
  const days = (daysRes.data ?? []) as ResetDay[];
  const entries = (entriesRes.data ?? []) as ResetEntry[];
  const doneDays = entries.map((e) => e.day_number);
  return {
    days,
    entries,
    currentDay: currentResetDay(doneDays),
    doneCount: doneDays.length,
    total: RESET_TOTAL,
    streak: dayStreak(entries.map((e) => e.completed_at), tzOffsetMin),
    level: resetLevel(doneDays.length),
  };
}

export type ResetPageRow = { page_key: string; answers: Record<string, unknown>; reflection: string | null; updated_at: string };

/** One person's saved v3 pages. ready=false when the table isn't there yet. */
export async function loadPages(uid: string): Promise<{ ready: boolean; pages: ResetPageRow[] }> {
  const { data, error } = await db.from(PAGES_TABLE).select('page_key, answers, reflection, updated_at').eq('user_id', uid);
  if (error) {
    if (isMissingSchema(error)) return { ready: false, pages: [] };
    throw error;
  }
  return { ready: true, pages: (data ?? []) as ResetPageRow[] };
}
