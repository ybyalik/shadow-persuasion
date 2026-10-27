/**
 * GET /api/admin/subscribers?test=1
 *
 * Free-chapter signups (sp2_subscribers) and where each one is in the 20-email sequence,
 * for /app/admin/free-chapter. Test signups are left out unless ?test=1.
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { sp2db, SEQUENCE_LENGTH } from '@/lib/sp2/server';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const includeTest = new URL(req.url).searchParams.get('test') === '1';
    let q = sp2db
      .from('sp2_subscribers')
      .select('id, email, first_name, status, sequence_step, next_send_at, last_sent_at, converted_at, is_test, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (!includeTest) q = q.or('is_test.is.null,is_test.eq.false');
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const count = (s: string) => rows.filter((r) => r.status === s).length;
    return NextResponse.json({
      subscribers: rows,
      sequenceLength: SEQUENCE_LENGTH,
      stats: { total: rows.length, active: count('active'), bought: count('converted'), finished: count('completed'), unsubscribed: count('unsubscribed') },
    });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Could not load signups.', 500, '[admin/subscribers]', err);
  }
}
