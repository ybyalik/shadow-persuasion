/**
 * POST /api/v2/upsell
 *
 * One-click upsell for the v2 funnel: charges the card saved at checkout for
 * The Applied Power Playbook Library ($47), then delivers it (lib/sp2/fulfill.ts).
 * Replaces the old Playbooks + Vault upsell for v2 buyers.
 *
 * Body: { paymentIntentId }  (the original book payment)
 * Returns: { success, upsellPaymentIntentId }
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { SP2_FUNNEL, SP2_IS_TEST, SP2_PRODUCTS, SP2_UPSELL_FUNNEL } from '@/lib/sp2/config';
import { fulfillSp2Order } from '@/lib/sp2/fulfill';
import { sp2db } from '@/lib/sp2/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const originalId = String(body?.paymentIntentId || '').trim();
    if (!originalId.startsWith('pi_')) {
      return NextResponse.json({ error: 'Missing order reference.' }, { status: 400 });
    }

    const original = await stripe.paymentIntents.retrieve(originalId);
    if (original.metadata?.funnel !== SP2_FUNNEL || original.status !== 'succeeded') {
      return NextResponse.json({ error: 'Original order not found.' }, { status: 400 });
    }
    const customerId = typeof original.customer === 'string' ? original.customer : original.customer?.id;
    const paymentMethodId = typeof original.payment_method === 'string' ? original.payment_method : original.payment_method?.id;
    const email = (original.receipt_email || original.metadata?.email || '').toLowerCase();
    if (!customerId || !paymentMethodId || !email) {
      return NextResponse.json({ error: 'Saved payment details not found.' }, { status: 400 });
    }

    // Back button, retries and double clicks must never charge twice.
    const { data: existing } = await sp2db
      .from('orders')
      .select('stripe_payment_intent_id, status')
      .filter('metadata->>original_pi', 'eq', originalId)
      .filter('metadata->>funnel', 'eq', SP2_UPSELL_FUNNEL)
      .maybeSingle();
    if (existing?.stripe_payment_intent_id) {
      return NextResponse.json({ success: existing.status === 'paid', upsellPaymentIntentId: existing.stripe_payment_intent_id });
    }

    const product = SP2_PRODUCTS.sp2_upsell;
    // Carry the landing page (variant) over from the original order, so upsells can be compared by page too.
    const variant = typeof original.metadata?.variant === 'string' ? original.metadata.variant : '';
    const intent = await stripe.paymentIntents.create(
      {
        amount: product.priceCents,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: product.name,
        receipt_email: email,
        metadata: { funnel: SP2_UPSELL_FUNNEL, items: 'sp2_upsell', email, original_pi: originalId, ...(variant ? { variant } : {}) },
      },
      { idempotencyKey: `sp2-upsell-${originalId}` }
    );

    await sp2db.from('orders').upsert(
      {
        email,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: intent.id,
        stripe_payment_method_id: paymentMethodId,
        items: ['sp2_upsell'],
        amount_cents: product.priceCents,
        currency: 'usd',
        status: intent.status === 'succeeded' ? 'paid' : 'pending',
        is_test: SP2_IS_TEST,
        metadata: { funnel: SP2_UPSELL_FUNNEL, original_pi: originalId, variant: variant || null },
      },
      { onConflict: 'stripe_payment_intent_id' }
    );

    if (intent.status !== 'succeeded') {
      return NextResponse.json({ success: false, error: 'Payment was not completed.' }, { status: 402 });
    }
    await fulfillSp2Order(intent.id);
    return NextResponse.json({ success: true, upsellPaymentIntentId: intent.id });
  } catch (err) {
    console.error('[v2/upsell] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: 'We could not add this to your order.' }, { status: 500 });
  }
}
