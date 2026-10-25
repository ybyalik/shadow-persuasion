/**
 * POST /api/app/keep-checkout
 *
 * Starts the $9.99/month subscription that keeps the app after the book's
 * 60 days. Signed-in users only; the buyer opts in here (we never convert the
 * free period into a paid plan without their say-so). The Stripe webhook's
 * checkout.session.completed handler stores the subscription by user id.
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { requireUser } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const APP_MONTHLY = { plan: 'app_monthly', amount: 999, name: 'Shadow Persuasion app, monthly' };

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const origin = req.headers.get('origin') || 'https://shadowpersuasion.com';
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'subscription',
      client_reference_id: user.uid,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: APP_MONTHLY.name },
            unit_amount: APP_MONTHLY.amount,
            recurring: { interval: 'month', interval_count: 1 },
          },
          quantity: 1,
        },
      ],
      return_url: `${origin}/app/keep?done=1`,
      subscription_data: { metadata: { plan: APP_MONTHLY.plan, userId: user.uid } },
      metadata: { plan: APP_MONTHLY.plan, userId: user.uid },
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Could not start checkout. Please try again.', 500, '[app/keep-checkout]', err);
  }
}
