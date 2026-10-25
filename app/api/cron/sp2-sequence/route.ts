/**
 * GET /api/cron/sp2-sequence
 *
 * Sends the next due email in the v2 free-chapter sequence (20 emails over
 * 60 days, content in lib/sp2/content.generated.ts). Runs hourly via Vercel
 * Cron. Buyers drop out automatically (lib/sp2/fulfill.ts marks them
 * converted), and unsubscribes are honored at send time.
 *
 * Security: Authorization: Bearer CRON_SECRET.
 *
 * Testing outside production: add ?force=1 to send the next email to every
 * active TEST subscriber right away, ignoring the schedule.
 */

import { NextResponse } from 'next/server';
import { SEQUENCE_LENGTH, nextSendAt, sendSequenceEmail, sp2db } from '@/lib/sp2/server';

const LAST_EMAIL = SEQUENCE_LENGTH; // 20 in both book editions (lib/sp2/server.ts)

export async function GET(req: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = process.env.NODE_ENV !== 'production' && new URL(req.url).searchParams.get('force') === '1';

  let query = sp2db
    .from('sp2_subscribers')
    .select('id, email, first_name, sequence_step, created_at')
    .eq('status', 'active')
    .order('next_send_at', { ascending: true })
    .limit(200);
  query = force ? query.eq('is_test', true) : query.lte('next_send_at', new Date().toISOString());

  const { data: due, error } = await query;
  if (error) {
    console.error('[cron/sp2-sequence] query failed:', error.message);
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  let sent = 0;
  let completed = 0;
  for (const sub of due ?? []) {
    const number = (sub.sequence_step ?? 0) + 1;
    if (number > LAST_EMAIL) {
      await sp2db.from('sp2_subscribers').update({ status: 'completed', next_send_at: null }).eq('id', sub.id);
      completed += 1;
      continue;
    }

    const result = await sendSequenceEmail({ to: sub.email, firstName: sub.first_name, number });
    if (result.error === 'unsubscribed') {
      await sp2db.from('sp2_subscribers').update({ status: 'unsubscribed', next_send_at: null }).eq('id', sub.id);
      continue;
    }
    if (!result.ok) continue; // leave it due; the next run retries

    const next = nextSendAt(new Date(sub.created_at), number);
    await sp2db
      .from('sp2_subscribers')
      .update({
        sequence_step: number,
        last_sent_at: new Date().toISOString(),
        next_send_at: next?.toISOString() ?? null,
        ...(next ? {} : { status: 'completed' }),
      })
      .eq('id', sub.id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, processed: due?.length ?? 0, sent, completed });
}
