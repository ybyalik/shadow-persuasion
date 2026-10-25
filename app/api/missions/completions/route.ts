/**
 * The 21-Day Reset: your finished steps with their journal notes (for reading
 * past notes), plus your streak. ?tz=<browser getTimezoneOffset()>
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { loadReset } from '../reset-data';

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const tz = parseInt(req.nextUrl.searchParams.get('tz') || '0', 10) || 0;
    const r = await loadReset(uid, tz);
    const titles = new Map(r.days.map((d) => [d.day_number, { label: d.label, title: d.title }]));
    const entries = r.entries
      .map((e) => ({ ...e, ...(titles.get(e.day_number) ?? { label: `Step ${e.day_number}`, title: '' }) }))
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    return NextResponse.json({ entries, streak: r.streak, doneCount: r.doneCount, total: r.total });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load your notes just now. Please try again.', 500, '[reset:notes]', err);
  }
}
