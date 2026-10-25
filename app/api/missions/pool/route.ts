/** The 21-Day Reset: every step from the book (the map), without anyone's progress. */
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { RESET } from '@/lib/edition';
import { db } from '../reset-data';

export async function GET(req: NextRequest) {
  try {
    await requireAppUser(req);
    const { data, error } = await db
      .from(RESET.daysTable)
      .select('*') // includes the v3 practice line once migration 032 is applied
      .order('day_number');
    if (error) throw error;
    return NextResponse.json({ days: data ?? [] });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load the reset just now. Please try again.', 500, '[reset:days]', err);
  }
}
