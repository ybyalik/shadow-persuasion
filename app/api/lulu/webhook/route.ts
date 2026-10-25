/**
 * POST /api/lulu/webhook
 *
 * Lulu calls this whenever a print job's status changes (topic
 * PRINT_JOB_STATUS_CHANGED). We check Lulu's signature against the raw body,
 * update the print order, and email tracking when it ships.
 *
 * Register once (after deploy) with Lulu's API:
 *   POST https://api.lulu.com/webhooks/  {"topics":["PRINT_JOB_STATUS_CHANGED"],"url":"https://<site>/api/lulu/webhook"}
 */

import { NextResponse } from 'next/server';
import { verifyLuluSignature, type LuluPrintJob } from '@/lib/sp2/lulu';
import { applyJob } from '@/lib/sp2/print';
import { sp2db } from '@/lib/sp2/server';

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyLuluSignature(raw, req.headers.get('lulu-hmac-sha256'))) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: { topic?: string; data?: LuluPrintJob & { external_id?: string } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad payload' }, { status: 400 });
  }
  const job = payload.data;
  if (payload.topic !== 'PRINT_JOB_STATUS_CHANGED' || !job?.id) return NextResponse.json({ ok: true, ignored: true });

  // Match by Lulu's job id, falling back to our external id (the Stripe payment id).
  let { data: row } = await sp2db.from('sp2_print_jobs').select('id').eq('lulu_print_job_id', job.id).maybeSingle();
  if (!row && job.external_id) {
    ({ data: row } = await sp2db.from('sp2_print_jobs').select('id').eq('stripe_payment_intent_id', job.external_id).maybeSingle());
  }
  if (!row) return NextResponse.json({ ok: true, unknown: true }); // not one of ours; don't make Lulu retry

  await applyJob(row.id, job);
  return NextResponse.json({ ok: true });
}
