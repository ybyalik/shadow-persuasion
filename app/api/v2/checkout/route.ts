/**
 * POST /api/v2/checkout
 *
 * Starts a Stripe PaymentIntent for the v2 book (paperback $67 or hardcover $97,
 * digital book and bonuses included), optionally with the 100 Ready-to-Use Replies
 * add-on ($17). Standard US shipping is free; faster speeds add the difference,
 * re-quoted from Lulu here so the price can't be tampered with. Saves the card for the one-click upsell. Fulfillment (downloads + the
 * Lulu print order) happens in lib/sp2/fulfill.ts.
 *
 * Called when the buyer presses pay (card) or confirms in the Apple Pay / Google Pay / Link sheet. The page uses
 * Stripe Elements in deferred mode, so these settings must match its Elements options
 * (setup_future_usage off_session, capture_method automatic, automatic payment methods).
 *
 * Body: { email, includeBump?, format?: 'paperback' | 'hardcover', address: {...}, shippingLevel, method?: 'card' | 'express',
 *         confirmationTokenId?, attribution?: { variant?, utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term? } }
 * attribution (lib/variant.ts) records which sales page the buyer landed on. It is cleaned here and saved on the
 * PaymentIntent metadata and in orders.metadata (as `variant` and `attribution`).
 * With confirmationTokenId (made in the browser by stripe.createConfirmationToken) the payment is also
 * confirmed here, and the reply includes `status` (the page finishes 3D Secure with handleNextAction).
 * Returns: { clientSecret, paymentIntentId, amount, items, shippingCents, status? }
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { SP2_FUNNEL, SP2_IS_TEST, sp2Describe, sp2Items, sp2TotalCents } from '@/lib/sp2/config';
import { chargedShippingCents, isBookFormat, isLuluShippingLevel, normalizeUsAddress } from '@/lib/sp2/lulu';
import { sp2db } from '@/lib/sp2/server';
import { sanitizeAttribution } from '@/lib/variant';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const checked = normalizeUsAddress(body?.address || {});
    if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
    const address = checked.address;
    const level = String(body?.shippingLevel || '');
    if (!isLuluShippingLevel(level)) {
      return NextResponse.json({ error: 'Please choose a shipping speed.' }, { status: 400 });
    }

    const format = isBookFormat(body?.format) ? body.format : 'paperback';
    let shippingCents: number;
    try {
      shippingCents = await chargedShippingCents(address, level, format);
    } catch (err) {
      console.error('[v2/checkout] shipping quote failed:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "We couldn't calculate shipping for that address. Please check it and try again." }, { status: 502 });
    }

    const attribution = sanitizeAttribution(body?.attribution);
    const items = sp2Items(Boolean(body?.includeBump), format);
    const amount = sp2TotalCents(items) + shippingCents;

    const found = await stripe.customers.list({ email, limit: 1 });
    const customerId =
      found.data[0]?.id ??
      (await stripe.customers.create({ email, name: address.name, phone: address.phone_number, metadata: { source: SP2_FUNNEL } })).id;

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      // Must match the Elements options on the checkout page, or Stripe refuses the confirm.
      setup_future_usage: 'off_session',
      capture_method: 'automatic',
      automatic_payment_methods: { enabled: true },
      description: `${sp2Describe(items)} + shipping`,
      receipt_email: email,
      shipping: {
        name: address.name,
        phone: address.phone_number,
        address: {
          line1: address.street1,
          line2: address.street2 ?? undefined,
          city: address.city,
          state: address.state_code,
          postal_code: address.postcode,
          country: 'US',
        },
      },
      metadata: { funnel: SP2_FUNNEL, items: items.join(','), email, format, shipping_level: level, shipping_cents: String(shippingCents), ...attribution },
    });

    const { error } = await sp2db.from('orders').insert({
      email,
      stripe_customer_id: customerId,
      stripe_payment_intent_id: intent.id,
      items,
      amount_cents: amount,
      currency: 'usd',
      status: 'pending',
      is_test: SP2_IS_TEST,
      metadata: {
        funnel: SP2_FUNNEL,
        name: address.name,
        checkout_method: body?.method === 'express' ? 'express' : 'card',
        format,
        shipping_level: level,
        shipping_cents: shippingCents,
        shipping_address: address,
        variant: attribution.variant ?? null,
        attribution,
      },
    });
    if (error) console.error('[v2/checkout] order insert failed:', error.message);

    const base = { clientSecret: intent.client_secret, paymentIntentId: intent.id, amount, items, shippingCents };
    const confirmationToken = typeof body?.confirmationTokenId === 'string' ? body.confirmationTokenId : '';
    if (!confirmationToken) return NextResponse.json(base);

    // Confirm here with the secret key. Confirming in the browser fails because the browser
    // may not change the shipping address we set above (and that address must stay the checked one).
    try {
      const confirmed = await stripe.paymentIntents.confirm(intent.id, {
        confirmation_token: confirmationToken,
        return_url: `${new URL(req.url).origin}/v2/upsell`,
      });
      return NextResponse.json({ ...base, status: confirmed.status });
    } catch (err) {
      const e = err as { type?: string; code?: string; message?: string };
      console.error('[v2/checkout] confirm failed:', e.type, e.code, e.message);
      // Card errors are written for shoppers ("Your card was declined."); anything else gets a plain message.
      const friendly = e.type === 'StripeCardError' && e.message ? e.message : 'Your payment did not go through. Please try again, or use a different payment method.';
      return NextResponse.json({ error: friendly }, { status: 402 });
    }
  } catch (err) {
    console.error('[v2/checkout] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
