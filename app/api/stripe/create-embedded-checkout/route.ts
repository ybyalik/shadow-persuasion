import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const PLAN_CONFIG = {
  weekly: { name: 'Weekly', amount: 995, interval: 'week' as const, label: '$9.95/week' },
  monthly: { name: 'Monthly', amount: 3495, interval: 'month' as const, label: '$34.95/month' },
  yearly: { name: 'Yearly', amount: 19595, interval: 'year' as const, label: '$195.95/year' },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
    if (!config) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check for existing Stripe customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    }

    const origin = req.headers.get('origin') || 'https://shadowpersuasion.com';

    const sessionParams: any = {
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Shadow Persuasion - ${config.name}` },
          unit_amount: config.amount,
          recurring: { interval: config.interval, interval_count: 1 },
        },
        quantity: 1,
      }],
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      subscription_data: { metadata: { userId, plan } },
      metadata: { userId, plan },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.error('[STRIPE EMBEDDED-CHECKOUT]', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Failed to create checkout' }, { status: 500 });
  }
}
