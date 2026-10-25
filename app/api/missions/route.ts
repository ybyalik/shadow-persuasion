/**
 * The 21-Day Reset (page: /app/field-ops).
 *
 * GET  -> all steps (24 in the v2 book, 21 in v3; see lib/edition.ts RESET), the person's finished steps with notes, today's step, streak.
 *         ?tz=<browser getTimezoneOffset()> so the streak uses their own days.
 * POST { day, note } -> marks a step done with its journal note, or updates the
 *         note on a step already done (the original finish date is kept).
 *
 * People move at their own pace: any step can be finished, in any order.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { RESET_TOTAL } from '@/lib/progress';
import { RESET } from '@/lib/edition';
import { db, loadReset } from './reset-data';

const MAX_NOTE = 8000;

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const tz = parseInt(req.nextUrl.searchParams.get('tz') || '0', 10) || 0;
    return NextResponse.json(await loadReset(uid, tz));
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load your reset just now. Please try again.', 500, '[reset:get]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const day = Number(body?.day);
    if (!Number.isInteger(day) || day < 1 || day > RESET_TOTAL) return apiError('Please pick a day of the reset.', 400);
    const note = typeof body?.note === 'string' ? body.note.trim().slice(0, MAX_NOTE) : '';

    const { data: existing } = await db
      .from(RESET.progressTable)
      .select('day_number, note')
      .eq('user_id', uid)
      .eq('day_number', day)
      .maybeSingle();

    const now = new Date().toISOString();
    if (existing) {
      // Editing a past note clears an old reflection that no longer matches it.
      const changed = (existing.note || '') !== note;
      const { error } = await db
        .from(RESET.progressTable)
        .update({ note: note || null, updated_at: now, ...(changed ? { reflection: null } : {}) })
        .eq('user_id', uid)
        .eq('day_number', day);
      if (error) throw error;
    } else {
      const { error } = await db.from(RESET.progressTable).insert({ user_id: uid, day_number: day, note: note || null, completed_at: now, updated_at: now });
      if (error) throw error;
    }

    const tz = parseInt(String(body?.tz ?? '0'), 10) || 0;
    return NextResponse.json({ ok: true, ...(await loadReset(uid, tz)) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not save that just now. Your note is still on the screen, so please try again.', 500, '[reset:save]', err);
  }
}
