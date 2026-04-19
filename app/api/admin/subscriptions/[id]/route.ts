/**
 * POST /api/admin/subscriptions/[id]
 *
 * Subscription admin actions.
 * Body:
 *   { action: 'cancel', when: 'immediately' | 'period_end' }
 *   { action: 'refund_last_invoice', reason?: string }
 *   { action: 'reactivate' }
 *
 * [id] is our internal subscriptions.id (Supabase PK).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ActionBody =
  | { action: 'cancel'; when: 'immediately' | 'period_end' }
  | { action: 'refund_last_invoice'; reason?: string }
  | { action: 'reactivate' };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as ActionBody;

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (!sub.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Subscription has no Stripe subscription ID' },
        { status: 400 }
      );
    }

    switch (body.action) {
      case 'cancel': {
        if (body.when === 'immediately') {
          const cancelled = await stripe.subscriptions.cancel(sub.stripe_subscription_id);
          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
          return NextResponse.json({ ok: true, subscription: cancelled });
        } else {
          const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: true,
          });
          await supabase
            .from('subscriptions')
            .update({
              status: updated.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
          return NextResponse.json({ ok: true, subscription: updated });
        }
      }

      case 'reactivate': {
        const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: false,
        });
        await supabase
          .from('subscriptions')
          .update({
            status: updated.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        return NextResponse.json({ ok: true, subscription: updated });
      }

      case 'refund_last_invoice': {
        // Find the latest charge on the customer for this subscription and refund it.
        if (!sub.stripe_customer_id) {
          return NextResponse.json(
            { error: 'No stripe_customer_id on subscription' },
            { status: 400 }
          );
        }
        const invoices = await stripe.invoices.list({
          customer: sub.stripe_customer_id,
          subscription: sub.stripe_subscription_id,
          limit: 1,
        });
        if (invoices.data.length === 0) {
          return NextResponse.json(
            { error: 'No invoices found' },
            { status: 400 }
          );
        }
        const invoice = invoices.data[0];
        // Modern Stripe (API 2026+) moved charge/payment_intent under various
        // invoice fields. We fall back through a few options to find one.
        const invoiceAny = invoice as unknown as {
          charge?: string | { id: string };
          payment_intent?: string | { id: string };
          payments?: { data?: Array<{ payment?: { payment_intent?: string | { id: string } } }> };
        };
        const chargeId =
          typeof invoiceAny.charge === 'string'
            ? invoiceAny.charge
            : invoiceAny.charge?.id;
        const piFromInvoice = invoiceAny.payment_intent;
        const piFromPayments = invoiceAny.payments?.data?.[0]?.payment?.payment_intent;
        const rawPi = piFromInvoice ?? piFromPayments;
        const piId = typeof rawPi === 'string' ? rawPi : rawPi?.id;

        if (!chargeId && !piId) {
          return NextResponse.json(
            { error: 'No charge or payment_intent on latest invoice' },
            { status: 400 }
          );
        }
        const refund = await stripe.refunds.create({
          ...(chargeId ? { charge: chargeId } : { payment_intent: piId! }),
          reason: 'requested_by_customer',
          metadata: {
            admin_note: body.reason || '',
            subscription_id: sub.stripe_subscription_id,
          },
        });
        return NextResponse.json({ ok: true, refund });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/subscriptions/:id POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
