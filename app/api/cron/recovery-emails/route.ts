/**
 * GET /api/cron/recovery-emails
 *
 * Cart abandonment recovery cron. Intended to be triggered hourly by
 * Vercel Cron (configured in vercel.json). Walks checkout_leads and
 * sends whichever recovery email is due for each non-converted lead.
 *
 * Cadence is DB-driven: each template in the `cart_recovery` sequence
 * carries a `delay_hours` value (absolute hours from the lead's
 * created_at). Admin can edit cadence or add a step 4 from
 * /app/admin/emails without a deploy — the cron auto-picks it up.
 *
 * Leads flip to status='abandoned' after the last step if still
 * unconverted. Converted / recovered leads are never touched.
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

type SequenceStep = {
  step: number;
  delay_hours: number;
};

/**
 * Load the sequence cadence from the DB. Sorted ascending by step
 * number so we can walk the timeline in order. Disabled templates
 * are skipped (cron still respects the admin's enable toggle).
 */
async function loadRecoveryCadence(): Promise<SequenceStep[]> {
  const { data } = await supabase
    .from('email_templates')
    .select('sequence_step, delay_hours, enabled')
    .eq('sequence_key', 'cart_recovery')
    .eq('enabled', true)
    .order('sequence_step', { ascending: true });
  return (data ?? [])
    .filter((t) => typeof t.sequence_step === 'number' && typeof t.delay_hours === 'number')
    .map((t) => ({
      step: t.sequence_step as number,
      delay_hours: t.delay_hours as number,
    }));
}

/**
 * Given a lead's current status, figure out which step number is
 * eligible next. Lead statuses follow the pattern:
 *   created          → step 1 next
 *   recovery_sent_1  → step 2 next
 *   recovery_sent_N  → step N+1 next
 * Returns null if the lead is in a terminal status.
 */
function nextStepNumber(status: string): number | null {
  if (status === 'created') return 1;
  const m = status.match(/^recovery_sent_(\d+)$/);
  if (m) return parseInt(m[1], 10) + 1;
  return null;
}

export async function GET(req: Request) {
  // Auth
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cadence = await loadRecoveryCadence();
    if (cadence.length === 0) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        sent: 0,
        abandoned: 0,
        note: 'No cart_recovery templates enabled',
      });
    }

    // Build quick lookup: step → delay_hours
    const delayByStep: Record<number, number> = {};
    for (const s of cadence) delayByStep[s.step] = s.delay_hours;
    const lastStep = cadence[cadence.length - 1].step;

    // Pull candidate leads. We include every non-terminal status so
    // the loop below can handle arbitrary numbers of steps.
    const { data: leads, error } = await supabase
      .from('checkout_leads')
      .select('*')
      .not('status', 'in', '(abandoned,converted,recovered)')
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
      const step = nextStepNumber(lead.status);
      if (step === null) continue;

      const delay = delayByStep[step];
      // If there's no template for this step (admin hasn't added it
      // yet), treat it as "last step done" and abandon.
      if (delay === undefined) {
        if (step > lastStep) {
          await supabase
            .from('checkout_leads')
            .update({ status: 'abandoned' })
            .eq('id', lead.id);
          abandoned += 1;
        }
        continue;
      }

      const ageHours = (now - new Date(lead.created_at).getTime()) / HOUR_MS;
      if (ageHours < delay) continue;

      // Safety: leads sitting in the same status for more than a week
      // past their trigger time get abandoned rather than receiving
      // a very stale email (timezone drift, cron downtime, etc.)
      if (ageHours > delay + 7 * 24) {
        await supabase
          .from('checkout_leads')
          .update({ status: 'abandoned' })
          .eq('id', lead.id);
        abandoned += 1;
        continue;
      }

      // Send
      const result = await sendRecoveryEmail({
        to: lead.email,
        firstName: lead.first_name,
        step: step as 1 | 2 | 3, // sender still types step as 1|2|3; widens if we add step 4 later
      });

      if (!result.ok) {
        errors.push({ leadId: lead.id, error: result.error ?? 'unknown' });
        continue;
      }

      const newEntry = {
        step,
        sent_at: new Date().toISOString(),
        email_id: result.id ?? null,
      };
      const existingSends = Array.isArray(lead.recovery_emails) ? lead.recovery_emails : [];

      await supabase
        .from('checkout_leads')
        .update({
          status: `recovery_sent_${step}`,
          recovery_emails: [...existingSends, newEntry],
        })
        .eq('id', lead.id);

      sent += 1;
    }

    return NextResponse.json({
      ok: true,
      processed: leads.length,
      sent,
      abandoned,
      cadence: cadence.map((c) => `step ${c.step} @ ${c.delay_hours}h`),
      errors,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/recovery-emails]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
