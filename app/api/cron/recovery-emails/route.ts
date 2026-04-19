/**
 * GET /api/cron/recovery-emails
 *
 * Cart abandonment recovery cron. Intended to be triggered hourly by Vercel
 * Cron (configured in vercel.json). Walks the checkout_leads table and
 * sends whichever recovery email is due for each non-converted lead.
 *
 * Schedule:
 *   Step 1 email:  1  hour after created_at
 *   Step 2 email:  24 hours after created_at
 *   Step 3 email:  72 hours after created_at
 *
 * Leads flip to status='abandoned' after step 3 if still unconverted.
 * Converted / recovered leads are never touched.
 *
 * Security: protected by CRON_SECRET header. Set it in Vercel env and
 * include it in the Vercel Cron config.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRecoveryEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HOUR_MS = 60 * 60 * 1000;

// Map current lead status → {step, minAgeHours} we should send next
const NEXT_STEP: Record<string, { step: 1 | 2 | 3; minAgeHours: number } | null> = {
  created:          { step: 1, minAgeHours: 1 },
  recovery_sent_1:  { step: 2, minAgeHours: 24 },
  recovery_sent_2:  { step: 3, minAgeHours: 72 },
  recovery_sent_3:  null, // done
  abandoned:        null,
  converted:        null,
  recovered:        null,
};

export async function GET(req: Request) {
  // Auth check
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
    // when `schedule` is defined in vercel.json.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Grab all leads that are candidates for a next email
    const { data: leads, error } = await supabase
      .from('checkout_leads')
      .select('*')
      .in('status', ['created', 'recovery_sent_1', 'recovery_sent_2'])
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, sent: 0, abandoned: 0 });
    }

    const now = Date.now();
    let sent = 0;
    let abandoned = 0;
    const errors: Array<{ leadId: string; error: string }> = [];

    for (const lead of leads) {
      const next = NEXT_STEP[lead.status];
      if (!next) continue;

      const ageHours = (now - new Date(lead.created_at).getTime()) / HOUR_MS;
      if (ageHours < next.minAgeHours) continue;

      // Leads older than 96 hours in `recovery_sent_2` state → abandon instead
      // (prevents sending step 3 to leads that might have already been processed).
      if (next.step === 3 && ageHours > 96) {
        await supabase
          .from('checkout_leads')
          .update({ status: 'abandoned' })
          .eq('id', lead.id);
        abandoned += 1;
        continue;
      }

      // Send the recovery email
      const result = await sendRecoveryEmail({
        to: lead.email,
        firstName: lead.first_name,
        step: next.step,
      });

      if (!result.ok) {
        errors.push({ leadId: lead.id, error: result.error ?? 'unknown' });
        continue;
      }

      // Record the send in the lead row
      const newEntry = {
        step: next.step,
        sent_at: new Date().toISOString(),
        email_id: result.id ?? null,
      };
      const existingSends = Array.isArray(lead.recovery_emails) ? lead.recovery_emails : [];
      const nextStatus =
        next.step === 1 ? 'recovery_sent_1'
        : next.step === 2 ? 'recovery_sent_2'
        : 'recovery_sent_3';

      await supabase
        .from('checkout_leads')
        .update({
          status: nextStatus,
          recovery_emails: [...existingSends, newEntry],
        })
        .eq('id', lead.id);

      sent += 1;
    }

    // Also flip any recovery_sent_3 leads older than 7 days to abandoned
    const weekAgo = new Date(now - 7 * 24 * HOUR_MS).toISOString();
    const { count: stillUnresolved } = await supabase
      .from('checkout_leads')
      .update({ status: 'abandoned' }, { count: 'exact' })
      .eq('status', 'recovery_sent_3')
      .lt('created_at', weekAgo);

    return NextResponse.json({
      ok: true,
      processed: leads.length,
      sent,
      abandoned: abandoned + (stillUnresolved ?? 0),
      errors,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/recovery-emails]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
