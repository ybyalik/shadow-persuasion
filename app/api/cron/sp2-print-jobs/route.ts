/**
 * GET /api/cron/sp2-print-jobs
 *
 * Daily safety net for paperback orders (Vercel Cron, CRON_SECRET):
 *   - retries orders that failed to reach Lulu (up to 5 attempts)
 *   - frees orders stuck "sending" for over 15 minutes so they can be retried
 *   - refreshes open jobs from Lulu in case a webhook was missed (and emails tracking on ship)
 */

import { NextResponse } from 'next/server';
import { FINAL_STATUSES, refreshJob, sendToLulu } from '@/lib/sp2/print';
import { sp2db } from '@/lib/sp2/server';

export async function GET(req: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stuckBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  await sp2db.from('sp2_print_jobs').update({ status: 'send_failed' }).eq('status', 'sending').lt('updated_at', stuckBefore);

  const { data: unsent } = await sp2db
    .from('sp2_print_jobs')
    .select('stripe_payment_intent_id')
    .is('lulu_print_job_id', null)
    .in('status', ['pending', 'send_failed']) // dry runs are never sent automatically
    .lt('attempts', 5)
    .limit(50);
  for (const r of unsent ?? []) await sendToLulu(r.stripe_payment_intent_id);

  const { data: open } = await sp2db
    .from('sp2_print_jobs')
    .select('id, lulu_print_job_id, status')
    .not('lulu_print_job_id', 'is', null)
    .limit(200);
  let refreshed = 0;
  for (const r of (open ?? []).filter((r) => !FINAL_STATUSES.has(r.status))) {
    try {
      await refreshJob(r.id, Number(r.lulu_print_job_id));
      refreshed += 1;
    } catch (err) {
      console.error('[cron/sp2-print-jobs] refresh failed', r.lulu_print_job_id, err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json({ ok: true, retried: unsent?.length ?? 0, refreshed });
}
