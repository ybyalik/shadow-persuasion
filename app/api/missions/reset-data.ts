/** Server-only: loads the reset steps and one person's progress. Used by the reset, Today and My Progress routes. */
import { createClient } from '@supabase/supabase-js';
import { RESET } from '@/lib/edition';
import { RESET_TOTAL, currentResetDay, dayStreak, resetLevel, type ResetDay, type ResetEntry } from '@/lib/progress';

export const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function loadReset(uid: string, tzOffsetMin: number) {
  const [daysRes, entriesRes] = await Promise.all([
    db.from(RESET.daysTable).select('day_number, phase, label, title, drill, morning_prompt, journal_prompts, chapter, chapter_title').order('day_number'),
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
