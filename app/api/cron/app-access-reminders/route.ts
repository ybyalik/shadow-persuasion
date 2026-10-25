/**
 * GET /api/cron/app-access-reminders (daily, Vercel Cron, CRON_SECRET)
 *
 * Emails book buyers 10 days and 2 days before their included app access ends,
 * unless they already have a live subscription. Each reminder is claimed
 * atomically so it is sent once. Test rows are skipped in production.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccess } from '@/lib/access';
import { sendAppAccessReminder } from '@/lib/sp2/server';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const STAGES = [
  { col: 'reminder_50_sent_at', withinDays: 10 },
  { col: 'reminder_58_sent_at', withinDays: 2 },
] as const;

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const now = new Date();
  let sent = 0;
  for (const stage of STAGES) {
    const cutoff = new Date(now.getTime() + stage.withinDays * 86400_000).toISOString();
    let q = db.from('app_access').select('id, email, access_until').gt('access_until', now.toISOString()).lte('access_until', cutoff).is(stage.col, null).limit(200);
    if (process.env.NODE_ENV === 'production') q = q.eq('is_test', false);
    const { data: rows } = await q;
    for (const r of rows ?? []) {
      const access = await getAccess(r.email);
      if (access.ok && access.kind !== 'book') continue; // subscribed or admin
      const { data: claimed } = await db.from('app_access').update({ [stage.col]: now.toISOString() }).eq('id', r.id).is(stage.col, null).select('id');
      if (!claimed?.length) continue;
      const daysLeft = Math.max(1, Math.ceil((new Date(r.access_until).getTime() - now.getTime()) / 86400_000));
      const endsOn = new Date(r.access_until).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const res = await sendAppAccessReminder({ to: r.email, daysLeft, endsOn });
      if (res.ok) sent += 1;
      else await db.from('app_access').update({ [stage.col]: null }).eq('id', r.id);
    }
  }
  return NextResponse.json({ ok: true, sent });
}
