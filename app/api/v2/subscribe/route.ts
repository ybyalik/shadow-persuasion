/**
 * POST /api/v2/subscribe
 *
 * Free-chapter signup for the v2 funnel. Saves the subscriber in
 * sp2_subscribers (never checkout_leads), sends email 1 right away, and
 * schedules email 2. The rest of the sequence is sent by
 * /api/cron/sp2-sequence.
 *
 * Body: { email, firstName?, utm_source?, utm_medium?, utm_campaign?, utm_content? }
 */

import { NextResponse } from 'next/server';
import { SP2_IS_TEST } from '@/lib/sp2/config';
import { nextSendAt, sendSequenceEmail, sp2db } from '@/lib/sp2/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const firstName = body?.firstName ? String(body.firstName).trim().slice(0, 80) : null;
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const { data: existing } = await sp2db
      .from('sp2_subscribers')
      .select('id, status')
      .ilike('email', email)
      .maybeSingle();

    // Already signed up: don't restart the sequence, just let them read.
    if (existing) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    const now = new Date();
    const { data: row, error } = await sp2db
      .from('sp2_subscribers')
      .insert({
        email,
        first_name: firstName,
        is_test: SP2_IS_TEST,
        utm_source: body?.utm_source ?? null,
        utm_medium: body?.utm_medium ?? null,
        utm_campaign: body?.utm_campaign ?? null,
        utm_content: body?.utm_content ?? null,
        referrer: req.headers.get('referer'),
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        user_agent: req.headers.get('user-agent'),
      })
      .select('id, created_at')
      .single();
    if (error || !row) throw new Error(error?.message || 'insert failed');

    const sent = await sendSequenceEmail({ to: email, firstName, number: 1 });
    const signupAt = new Date(row.created_at ?? now);
    await sp2db
      .from('sp2_subscribers')
      .update({
        sequence_step: sent.ok ? 1 : 0,
        last_sent_at: sent.ok ? new Date().toISOString() : null,
        // If email 1 failed, the cron retries it on its next run.
        next_send_at: (sent.ok ? nextSendAt(signupAt, 1) : now)?.toISOString() ?? null,
      })
      .eq('id', row.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[v2/subscribe] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
