/**
 * POST /api/v2/fulfill
 *
 * Called by the v2 thank-you page. Confirms the payment with Stripe, makes
 * sure the order is delivered (safe to repeat), and returns the download
 * links so the buyer can start reading straight away.
 *
 * Body: { paymentIntentId }
 */

import { NextResponse } from 'next/server';
import { fulfillSp2Order } from '@/lib/sp2/fulfill';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const paymentIntentId = String(body?.paymentIntentId || '').trim();
  if (!paymentIntentId.startsWith('pi_')) {
    return NextResponse.json({ error: 'Missing order reference.' }, { status: 400 });
  }

  const result = await fulfillSp2Order(paymentIntentId);
  if (!result.ok) {
    const status = result.reason === 'not_paid' ? 402 : result.reason === 'error' ? 500 : 404;
    return NextResponse.json({ error: 'We could not find a completed order. Check your email for your downloads.' }, { status });
  }
  return NextResponse.json({ email: result.email, items: result.items, links: result.links });
}
