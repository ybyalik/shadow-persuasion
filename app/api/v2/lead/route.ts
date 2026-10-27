/**
 * POST /api/v2/lead
 *
 * Saves the email someone types at /checkout before they pay, so the cart-recovery cron
 * (app/api/cron/sp2-cart-recovery) can send up to three reminders if they leave. One row per
 * email in checkout_leads (funnel 'sp2'); a revisit updates the cart but never restarts the
 * reminders. Buyers are marked converted in lib/sp2/fulfill.ts.
 *
 * Body: { email, format?, includeBump?, attribution? }
 */

import { NextResponse } from 'next/server';
import { SP2_IS_TEST, SP2_LEAD_FUNNEL, SP2_PRODUCTS } from '@/lib/sp2/config';
import { sp2db } from '@/lib/sp2/server';


export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    const format = body?.format === 'hardcover' ? 'hardcover' : 'paperback';
    const includeBump = Boolean(body?.includeBump);
    const amountCents =
      SP2_PRODUCTS[format === 'hardcover' ? 'sp2_book_hc' : 'sp2_book'].priceCents + (includeBump ? SP2_PRODUCTS.sp2_scripts.priceCents : 0);
    const a = (body?.attribution ?? {}) as Record<string, unknown>;
    const utm = (k: string) => (typeof a[k] === 'string' ? String(a[k]).slice(0, 200) : null);

    const { data: existing } = await sp2db
      .from('checkout_leads')
      .select('id, metadata')
      .ilike('email', email)
      .eq('funnel', SP2_LEAD_FUNNEL)
      .maybeSingle();

    const cart = { include_bump: includeBump, amount_cents: amountCents };
    if (existing) {
      const metadata = { ...((existing.metadata as Record<string, unknown>) ?? {}), format };
      const { error } = await sp2db.from('checkout_leads').update({ ...cart, metadata }).eq('id', existing.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    const { error } = await sp2db.from('checkout_leads').insert({
      email,
      funnel: SP2_LEAD_FUNNEL,
      status: 'created',
      ...cart,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: req.headers.get('user-agent') || null,
      referrer: req.headers.get('referer') || null,
      utm_source: utm('utm_source'),
      utm_medium: utm('utm_medium'),
      utm_campaign: utm('utm_campaign'),
      metadata: { format, is_test: SP2_IS_TEST, variant: utm('variant'), utm_content: utm('utm_content') },
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[v2/lead]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
