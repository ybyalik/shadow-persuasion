import { stripe } from '@/lib/stripe';
import { SP2_FUNNEL, SP2_IS_TEST, SP2_LEAD_FUNNEL, SP2_PHYSICAL, SP2_UPSELL_FUNNEL, isSp2Slug, sp2TotalCents, type Sp2Slug } from './config';
import { startPrintJob } from './print';
import { BOOK_ACCESS_DAYS, grantAccess } from '@/lib/access';
import { sendSp2DeliveryEmail, sp2db, sp2DownloadLinks } from './server';

export type Sp2FulfillResult =
  | { ok: true; email: string; items: Sp2Slug[]; links: { name: string; url: string }[] }
  | { ok: false; reason: 'not_found' | 'not_paid' | 'not_sp2' | 'error' };

/**
 * Marks a v2 order paid, delivers the downloads by email (once), and stops the
 * free-chapter email sequence for that buyer.
 *
 * Called from the Stripe webhook and from the thank-you page, so it must be
 * safe to run more than once for the same payment: it only emails the
 * downloads if the order isn't already marked delivered.
 */
export async function fulfillSp2Order(paymentIntentId: string): Promise<Sp2FulfillResult> {
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const funnel = intent.metadata?.funnel;
    if (funnel !== SP2_FUNNEL && funnel !== SP2_UPSELL_FUNNEL) return { ok: false, reason: 'not_sp2' };
    if (intent.status !== 'succeeded') return { ok: false, reason: 'not_paid' };

    const items = (intent.metadata?.items || '').split(',').filter(isSp2Slug);
    const email = (intent.receipt_email || intent.metadata?.email || '').toLowerCase();
    if (!email || items.length === 0) return { ok: false, reason: 'not_found' };

    const { data: existing } = await sp2db
      .from('orders')
      .select('id, status, delivered_at, metadata')
      .eq('stripe_payment_intent_id', intent.id)
      .maybeSingle();

    let orderId = existing?.id as string | undefined;
    if (!existing || existing.status !== 'paid') {
      const { data: upserted, error } = await sp2db
        .from('orders')
        .upsert(
          {
            email,
            stripe_customer_id: typeof intent.customer === 'string' ? intent.customer : intent.customer?.id ?? null,
            stripe_payment_intent_id: intent.id,
            stripe_payment_method_id:
              typeof intent.payment_method === 'string' ? intent.payment_method : intent.payment_method?.id ?? null,
            items,
            amount_cents: intent.amount ?? sp2TotalCents(items),
            currency: intent.currency || 'usd',
            status: 'paid',
            is_test: SP2_IS_TEST,
            // Keep what checkout saved (shipping details, variant, attribution) instead of replacing it.
            metadata: {
              ...((existing?.metadata as Record<string, unknown> | null) ?? {}),
              funnel,
              ...(intent.metadata?.original_pi ? { original_pi: intent.metadata.original_pi } : {}),
              ...(intent.metadata?.variant ? { variant: intent.metadata.variant } : {}),
            },
          },
          { onConflict: 'stripe_payment_intent_id' }
        )
        .select('id')
        .single();
      if (error) console.error('[sp2/fulfill] order upsert failed:', error.message);
      orderId = upserted?.id ?? orderId;
    }

    // Stop the free-chapter sequence for this buyer.
    if (funnel === SP2_FUNNEL) {
      await sp2db
        .from('sp2_subscribers')
        .update({ status: 'converted', converted_at: new Date().toISOString(), next_send_at: null, order_id: orderId ?? null })
        .ilike('email', email)
        .neq('status', 'converted');
      // And the cart-recovery reminders (app/api/cron/sp2-cart-recovery).
      await sp2db
        .from('checkout_leads')
        .update({ status: 'converted', converted_at: new Date().toISOString(), order_id: orderId ?? null, stripe_payment_intent_id: intent.id })
        .ilike('email', email)
        .eq('funnel', SP2_LEAD_FUNNEL)
        .neq('status', 'converted');
    }

    // The paperback includes 60 days of the companion app, counted from purchase.
    if (items.includes('sp2_book') || items.includes('sp2_book_hc')) {
      try {
        await grantAccess({
          email,
          days: BOOK_ACCESS_DAYS,
          source: 'book',
          orderId: orderId ?? null,
          isTest: SP2_IS_TEST,
          from: new Date((intent.created ?? Math.floor(Date.now() / 1000)) * 1000),
        });
      } catch (err) {
        console.error('[sp2/fulfill] app access grant failed:', err instanceof Error ? err.message : err);
      }
    }

    const links = await sp2DownloadLinks(items);

    if (!existing?.delivered_at && links.length > 0) {
      // The webhook and the thank-you page can arrive at the same moment.
      // Claim the delivery atomically so only one of them sends the email;
      // release the claim if the send fails so a later call can retry.
      const { data: claimed } = await sp2db
        .from('orders')
        .update({ delivered_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', intent.id)
        .is('delivered_at', null)
        .select('id');
      if (claimed && claimed.length > 0) {
        const sent = await sendSp2DeliveryEmail({ to: email, items, links });
        if (!sent.ok) {
          await sp2db.from('orders').update({ delivered_at: null }).eq('stripe_payment_intent_id', intent.id);
        }
      }
    }

    // Paperback: send the print order to Lulu (safe to repeat; one job per payment).
    if (items.some((i) => SP2_PHYSICAL.includes(i))) {
      try {
        await startPrintJob(intent, orderId ?? null, email);
      } catch (err) {
        console.error('[sp2/fulfill] print job step failed:', err instanceof Error ? err.message : err);
      }
    }

    return { ok: true, email, items, links };
  } catch (err) {
    console.error('[sp2/fulfill] error:', err instanceof Error ? err.message : err);
    return { ok: false, reason: 'error' };
  }
}
