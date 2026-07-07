import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth-api';
import { passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    // Find the caller's OWN Stripe customer id — never trust one sent from
    // the browser, or anyone could open another customer's billing portal.
    let { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    // Fall back to matching by the user's email (guest checkout not yet
    // linked to the firebase uid).
    if (!sub?.stripe_customer_id) {
      const { data: userRow } = await supabase
        .from('users')
        .select('email')
        .eq('firebase_uid', userId)
        .maybeSingle();
      if (userRow?.email) {
        const { data: byEmail } = await supabase
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('email', userRow.email)
          .maybeSingle();
        sub = byEmail ?? sub;
      }
    }

    const customerId = sub?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing account found for your subscription.' },
        { status: 404 }
      );
    }

    const origin = req.headers.get('origin') || '';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[STRIPE PORTAL]', err);
    return NextResponse.json(
      { error: 'Could not open the billing page. Please try again.' },
      { status: 500 }
    );
  }
}
