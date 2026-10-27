/**
 * POST /api/v2/order/lookup  { email }
 *
 * "Find my order" on /order: emails the private order-page link for each paid book order on
 * that address. Always answers the same way, so the form never reveals who has bought.
 * At most one email per address every 10 minutes.
 */

import { NextResponse } from 'next/server';
import { SP2_FUNNEL } from '@/lib/sp2/config';
import { orderStatusUrl } from '@/lib/sp2/order-link';
import { sendOrderLinksEmail, sp2db } from '@/lib/sp2/server';

const ANSWER = { ok: true, message: 'If there is an order for that email, we have sent the link. Check your inbox (and spam folder).' };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });

    const { data: recent } = await sp2db
      .from('email_sends')
      .select('id')
      .eq('template_key', 'sp2_order_links')
      .ilike('to_email', email)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(1);
    if (recent?.length) return NextResponse.json(ANSWER);

    const { data: orders } = await sp2db
      .from('orders')
      .select('stripe_payment_intent_id, items, created_at')
      .ilike('email', email)
      .eq('metadata->>funnel', SP2_FUNNEL)
      .in('status', ['paid', 'refunded'])
      .order('created_at', { ascending: false })
      .limit(10);
    if (orders?.length) {
      await sendOrderLinksEmail({
        to: email,
        orders: orders.map((o) => ({
          date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          description: (o.items as string[]).includes('sp2_book_hc') ? 'Shadow Persuasion, hardcover' : 'Shadow Persuasion, paperback',
          url: orderStatusUrl(o.stripe_payment_intent_id),
        })),
      });
    }
    return NextResponse.json(ANSWER);
  } catch (err) {
    console.error('[v2/order/lookup]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
