/**
 * Paperback print orders: paid order -> Lulu print job -> tracking email.
 *
 * Row lifecycle in sp2_print_jobs (see migration 022). Every step is safe to
 * repeat: the row is unique per Stripe payment, and a job is only sent to Lulu
 * once (lulu_print_job_id set).
 */

import type Stripe from 'stripe';
import { SP2_IS_TEST } from './config';
import { LULU_FORMATS, createPrintJob, getPrintJob, isBookFormat, ordersEnabled, trackingOf, type BookFormat, type LuluAddress, type LuluPrintJob, type LuluShippingLevel } from './lulu';
import { sp2FormatOf } from './config';
import { sendSp2ShippedEmail, sp2db } from './server';

const INTERIOR_PATH = 'sp2/print/interior.pdf'; // same interior for both formats; the cover differs
const PRINT_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // Lulu downloads the files within minutes; a week leaves room for retries
const MAX_ATTEMPTS = 5;

/** Lulu statuses after which nothing more will change. */
export const FINAL_STATUSES = new Set(['SHIPPED', 'DELIVERED', 'REJECTED', 'CANCELED']);

function addressFromIntent(intent: Stripe.PaymentIntent): LuluAddress | null {
  const s = intent.shipping;
  if (!s?.address?.line1 || !s.name) return null;
  return {
    name: s.name,
    street1: s.address.line1,
    street2: s.address.line2 || undefined,
    city: s.address.city || '',
    state_code: s.address.state || '',
    postcode: s.address.postal_code || '',
    country_code: 'US',
    phone_number: s.phone || '',
  };
}

async function signedPrintUrls(format: BookFormat) {
  const sign = async (path: string) => {
    const { data, error } = await sp2db.storage.from('paid-downloads').createSignedUrl(path, PRINT_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) throw new Error(`could not sign ${path}: ${error?.message}`);
    return data.signedUrl;
  };
  return { interiorUrl: await sign(INTERIOR_PATH), coverUrl: await sign(LULU_FORMATS[format].coverPath) };
}

/** Saves the print order for a paid book payment and sends it to Lulu (if orders are switched on). */
export async function startPrintJob(intent: Stripe.PaymentIntent, orderId: string | null, email: string) {
  const address = addressFromIntent(intent);
  const level = (intent.metadata?.shipping_level || 'MAIL') as LuluShippingLevel;
  const format: BookFormat = sp2FormatOf((intent.metadata?.items || '').split(',')) ?? 'paperback';
  if (!address) {
    console.error('[sp2/print] paid book order has no shipping address', intent.id);
    return;
  }

  await sp2db.from('sp2_print_jobs').upsert(
    {
      order_id: orderId,
      stripe_payment_intent_id: intent.id,
      email,
      shipping_level: level,
      format,
      shipping_address: address,
      shipping_charged_cents: Number(intent.metadata?.shipping_cents) || null,
      is_test: SP2_IS_TEST,
    },
    { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
  );
  await sendToLulu(intent.id);
}

/** Sends one saved print order to Lulu. Claims the row first so two callers can't both send it. */
export async function sendToLulu(paymentIntentId: string) {
  const { data: row } = await sp2db
    .from('sp2_print_jobs')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (!row || row.lulu_print_job_id || row.attempts >= MAX_ATTEMPTS) return;

  // Test orders (local/dev) never go to Lulu unless explicitly allowed, so switching
  // real orders on later can't print old test purchases.
  if (!ordersEnabled() || (row.is_test && process.env.LULU_SEND_TEST_ORDERS !== 'true')) {
    await sp2db.from('sp2_print_jobs').update({ status: 'dry_run' }).eq('id', row.id).in('status', ['pending', 'dry_run']);
    return;
  }

  const { data: claimed } = await sp2db
    .from('sp2_print_jobs')
    .update({ status: 'sending', attempts: row.attempts + 1 })
    .eq('id', row.id)
    .in('status', ['pending', 'dry_run', 'send_failed'])
    .select('id');
  if (!claimed?.length) return;

  try {
    const format: BookFormat = isBookFormat(row.format) ? row.format : 'paperback';
    const urls = await signedPrintUrls(format);
    const job = await createPrintJob({
      externalId: paymentIntentId,
      address: row.shipping_address as LuluAddress,
      level: row.shipping_level as LuluShippingLevel,
      quantity: row.quantity,
      format,
      ...urls,
    });
    await applyJob(row.id, job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[sp2/print] send to Lulu failed', paymentIntentId, msg);
    await sp2db.from('sp2_print_jobs').update({ status: 'send_failed', error: msg.slice(0, 2000) }).eq('id', row.id);
  }
}

/** Saves a job's latest state from Lulu and emails tracking once it ships. */
export async function applyJob(rowId: string, job: LuluPrintJob) {
  const tracking = trackingOf(job);
  await sp2db
    .from('sp2_print_jobs')
    .update({
      lulu_print_job_id: job.id,
      status: job.status?.name || 'CREATED',
      lulu_costs: job.costs ?? null,
      error: job.status?.name === 'REJECTED' ? (job.status?.message || 'Rejected by Lulu').slice(0, 2000) : null,
      ...(tracking.tracking_id || tracking.tracking_urls ? tracking : {}),
    })
    .eq('id', rowId);
  if (job.status?.name === 'SHIPPED' || job.status?.name === 'DELIVERED') await maybeSendShippedEmail(rowId);
}

async function maybeSendShippedEmail(rowId: string) {
  const { data: claimed } = await sp2db
    .from('sp2_print_jobs')
    .update({ shipped_email_sent_at: new Date().toISOString() })
    .eq('id', rowId)
    .is('shipped_email_sent_at', null)
    .select('email, shipping_address, tracking_urls, carrier_name');
  const row = claimed?.[0];
  if (!row) return;
  const sent = await sendSp2ShippedEmail({
    to: row.email,
    name: (row.shipping_address as LuluAddress)?.name,
    trackingUrl: Array.isArray(row.tracking_urls) ? row.tracking_urls[0] : null,
    carrier: row.carrier_name,
  });
  if (!sent.ok) await sp2db.from('sp2_print_jobs').update({ shipped_email_sent_at: null }).eq('id', rowId);
}

/** Refreshes one job from Lulu (used by the daily check). */
export async function refreshJob(rowId: string, luluId: number) {
  const job = await getPrintJob(luluId);
  await applyJob(rowId, job);
  return job.status?.name;
}
