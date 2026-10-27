/**
 * GET /api/cron/sp2-cart-recovery
 *
 * Sends the three cart-recovery reminders (lib/sp2/cart-recovery-emails.ts) to people who typed
 * their email at /checkout (app/api/v2/lead) but didn't pay: 1 hour, 1 day and 3 days after they
 * left. Runs hourly via Vercel Cron. Before each send it checks for a paid order on that email
 * (and marks the lead converted), and unsubscribes are honored. Leads older than 7 days are
 * never started, so nobody gets a first reminder long after the fact.
 *
 * Security: Authorization: Bearer CRON_SECRET.
 *
 * Testing outside production: ?dry=1 renders what each due lead would get without sending.
 */

import { NextResponse } from 'next/server';
import { SP2_FUNNEL, SP2_LEAD_FUNNEL } from '@/lib/sp2/config';
import { renderCartRecoveryEmail, sendCartRecoveryEmail, sp2db } from '@/lib/sp2/server';
import { CART_RECOVERY_EMAILS } from '@/lib/sp2/cart-recovery-emails';

const HOUR = 60 * 60 * 1000;
const STEP_FOR_STATUS: Record<string, number> = { created: 1, recovery_sent_1: 2, recovery_sent_2: 3 };

export async function GET(req: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const dry = process.env.NODE_ENV !== 'production' && new URL(req.url).searchParams.get('dry') === '1';
  const now = Date.now();

  const { data: leads, error } = await sp2db
    .from('checkout_leads')
    .select('id, email, status, created_at, recovery_emails, metadata')
    .eq('funnel', SP2_LEAD_FUNNEL)
    .in('status', Object.keys(STEP_FOR_STATUS))
    .lte('created_at', new Date(now - HOUR).toISOString())
    .order('created_at', { ascending: true })
    .limit(200);
  // Local test checkouts write to the same database; the live cron never emails them.
  const real = (leads ?? []).filter((l) => dry || (l.metadata as Record<string, unknown> | null)?.is_test !== true);
  if (error) {
    console.error('[cron/sp2-cart-recovery] query failed:', error.message);
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  let sent = 0;
  let converted = 0;
  const preview: { email: string; step: number; subject: string }[] = [];
  for (const lead of real) {
    const step = STEP_FOR_STATUS[lead.status];
    const email = CART_RECOVERY_EMAILS.find((e) => e.step === step)!;
    const age = now - new Date(lead.created_at).getTime();
    if (age < email.afterHours * HOUR) continue; // not due yet
    if (step === 1 && age > 7 * 24 * HOUR) continue; // too old to start

    // Bought already (fulfill.ts normally marks this; this catches anything it missed)?
    const { data: paid } = await sp2db
      .from('orders')
      .select('id')
      .ilike('email', lead.email)
      .eq('metadata->>funnel', SP2_FUNNEL)
      .limit(1)
      .maybeSingle();
    if (paid) {
      if (!dry) await sp2db.from('checkout_leads').update({ status: 'converted', converted_at: new Date().toISOString(), order_id: paid.id }).eq('id', lead.id);
      converted += 1;
      continue;
    }

    const format = (lead.metadata as Record<string, unknown> | null)?.format as string | undefined;
    if (dry) {
      const r = renderCartRecoveryEmail(step, { to: lead.email, format });
      preview.push({ email: lead.email, step, subject: r?.subject ?? '' });
      continue;
    }

    const result = await sendCartRecoveryEmail(step, { to: lead.email, format });
    if (result.error === 'unsubscribed') {
      await sp2db.from('checkout_leads').update({ status: 'unsubscribed' }).eq('id', lead.id);
      continue;
    }
    if (!result.ok) continue; // left due; the next run retries
    const log = Array.isArray(lead.recovery_emails) ? lead.recovery_emails : [];
    await sp2db
      .from('checkout_leads')
      .update({ status: `recovery_sent_${step}`, recovery_emails: [...log, { step, sent_at: new Date().toISOString(), email_id: result.id ?? null }] })
      .eq('id', lead.id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, checked: leads?.length ?? 0, sent, converted, ...(dry ? { preview } : {}) });
}
