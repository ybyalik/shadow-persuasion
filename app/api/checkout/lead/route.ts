/**
 * POST /api/checkout/lead
 *
 * Captures/updates a checkout lead the moment a visitor types a valid
 * email into /checkout/book (debounced client-side). Used for cart-
 * abandonment recovery emails.
 *
 * Body: { email, firstName?, includeBump?, funnel? }
 * Returns: { ok, leadId }
 *
 * Upserts on (lower(email), funnel). Idempotent — calling repeatedly
 * from the same browser won't create duplicate rows.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const firstName = body?.firstName ? String(body.firstName).trim() : null;
    const includeBump = Boolean(body?.includeBump);
    const funnel = String(body?.funnel || 'book_checkout');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Pull lightweight request context for analytics
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null;
    const userAgent = req.headers.get('user-agent') || null;
    const referrer = req.headers.get('referer') || null;

    // Compute intended amount (book $7, bump $17)
    const amountCents = 700 + (includeBump ? 1700 : 0);

    // Does a lead row already exist for (email, funnel)?
    const { data: existing } = await supabase
      .from('checkout_leads')
      .select('id, status')
      .eq('email', email)
      .eq('funnel', funnel)
      .maybeSingle();

    if (existing) {
      // Update include_bump + amount_cents (they may toggle the bump), but
      // don't overwrite converted/recovered statuses.
      const preserveStatus =
        existing.status === 'converted' || existing.status === 'recovered';
      const { error } = await supabase
        .from('checkout_leads')
        .update({
          first_name: firstName || undefined,
          include_bump: includeBump,
          amount_cents: amountCents,
          ...(preserveStatus ? {} : { status: 'created' }),
        })
        .eq('id', existing.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, leadId: existing.id });
    }

    // New lead
    const { data: inserted, error: insertErr } = await supabase
      .from('checkout_leads')
      .insert({
        email,
        first_name: firstName,
        funnel,
        include_bump: includeBump,
        amount_cents: amountCents,
        status: 'created',
        ip_address: ip,
        user_agent: userAgent,
        referrer,
      })
      .select('id')
      .single();

    if (insertErr) throw insertErr;
    return NextResponse.json({ ok: true, leadId: inserted.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[checkout/lead]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
