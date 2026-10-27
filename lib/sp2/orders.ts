/**
 * Book orders as people see them: the private order-status link (signed, no login), a
 * plain-English status built from the order + its Lulu print job, and one loader shared by
 * the customer page (/order/[token]) and the admin page (/app/admin/book-orders).
 */

import { sp2db } from './server';
import { SP2_FUNNEL, SP2_UPSELL_FUNNEL, sp2Describe, type Sp2Slug } from './config';

export { orderStatusUrl, orderToken, verifyOrderToken } from './order-link';

/* ───────────── Status ───────────── */

export type OrderStage = 'paid' | 'printing' | 'shipped' | 'delivered' | 'problem' | 'refunded' | 'digital';

export type PrintJob = {
  id: string;
  status: string;
  format: string | null;
  lulu_print_job_id: number | null;
  tracking_id: string | null;
  tracking_urls: string[] | null;
  carrier_name: string | null;
  shipped_email_sent_at: string | null;
  error: string | null;
  attempts: number;
  shipping_level: string | null;
  shipping_address: Record<string, string> | null;
  updated_at: string;
};

const PRINTING = ['sending', 'CREATED', 'UNPAID', 'PAYMENT_IN_PROGRESS', 'PRODUCTION_READY', 'IN_PRODUCTION', 'PRODUCTION_DELAYED'];

/** Where the order is, in words a customer understands. `admin` adds the detail only the owner needs. */
export function orderStage(order: { status: string }, job: PrintJob | null): { stage: OrderStage; label: string; admin: string } {
  if (order.status === 'refunded') return { stage: 'refunded', label: 'Refunded', admin: 'Refunded' };
  if (!job) return { stage: 'digital', label: 'Delivered by email', admin: 'Digital only' };
  const s = job.status;
  if (s === 'DELIVERED') return { stage: 'delivered', label: 'Delivered', admin: 'Delivered' };
  if (s === 'SHIPPED') return { stage: 'shipped', label: 'Shipped', admin: 'Shipped' };
  if (s === 'REJECTED' || s === 'CANCELED' || s === 'send_failed')
    return { stage: 'problem', label: 'Being printed', admin: s === 'send_failed' ? `Not sent to Lulu (try ${job.attempts} of 5)` : `Lulu: ${s.toLowerCase()}` };
  if (s === 'dry_run' || s === 'pending')
    return { stage: 'paid', label: 'Order received', admin: s === 'dry_run' ? 'Not sent: printing switched off (test mode)' : 'Waiting to send to Lulu' };
  if (PRINTING.includes(s)) return { stage: 'printing', label: 'Being printed', admin: `At Lulu: ${s.replace(/_/g, ' ').toLowerCase()}` };
  return { stage: 'printing', label: 'Being printed', admin: s };
}

/* ───────────── Loading ───────────── */

export type BookOrder = {
  id: string;
  paymentIntentId: string;
  email: string;
  name: string | null;
  items: Sp2Slug[];
  description: string;
  format: 'paperback' | 'hardcover' | null;
  amountCents: number;
  status: string;
  isTest: boolean;
  createdAt: string;
  refundedAt: string | null;
  deliveredAt: string | null;
  shippingAddress: Record<string, string> | null;
  upsell: { amountCents: number; status: string } | null;
  job: PrintJob | null;
  stage: ReturnType<typeof orderStage>;
  trackingUrl: string | null;
};

type OrderRow = {
  id: string;
  email: string;
  stripe_payment_intent_id: string;
  items: string[] | null;
  amount_cents: number;
  status: string;
  is_test: boolean | null;
  created_at: string;
  refunded_at: string | null;
  delivered_at: string | null;
  metadata: Record<string, unknown> | null;
};

const ORDER_FIELDS = 'id, email, stripe_payment_intent_id, items, amount_cents, status, is_test, created_at, refunded_at, delivered_at, metadata';
const JOB_FIELDS =
  'id, stripe_payment_intent_id, status, format, lulu_print_job_id, tracking_id, tracking_urls, carrier_name, shipped_email_sent_at, error, attempts, shipping_level, shipping_address, updated_at';

function build(o: OrderRow, job: PrintJob | null, upsell: OrderRow | undefined): BookOrder {
  const items = (o.items ?? []) as Sp2Slug[];
  const m = o.metadata ?? {};
  const address = (job?.shipping_address ?? (m.shipping_address as Record<string, string> | undefined)) || null;
  const format = items.includes('sp2_book_hc') ? 'hardcover' : items.includes('sp2_book') ? 'paperback' : null;
  return {
    id: o.id,
    paymentIntentId: o.stripe_payment_intent_id,
    email: o.email,
    name: (address?.name as string) || (m.name as string) || null,
    items,
    description: sp2Describe(items),
    format,
    amountCents: o.amount_cents,
    status: o.status,
    isTest: Boolean(o.is_test),
    createdAt: o.created_at,
    refundedAt: o.refunded_at,
    deliveredAt: o.delivered_at,
    shippingAddress: address,
    upsell: upsell ? { amountCents: upsell.amount_cents, status: upsell.status } : null,
    job,
    stage: orderStage(o, job),
    trackingUrl: Array.isArray(job?.tracking_urls) ? job!.tracking_urls[0] ?? null : null,
  };
}

/** Paid and refunded book orders, newest first (checkouts that were never paid are left out). */
export async function listBookOrders(opts: { includeTest?: boolean; limit?: number } = {}): Promise<BookOrder[]> {
  let q = sp2db
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('metadata->>funnel', SP2_FUNNEL)
    .in('status', ['paid', 'refunded'])
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 200);
  if (!opts.includeTest) q = q.or('is_test.is.null,is_test.eq.false');
  const { data: orders, error } = await q;
  if (error) throw new Error(error.message);
  const pis = (orders ?? []).map((o) => o.stripe_payment_intent_id);
  if (pis.length === 0) return [];
  const [{ data: jobs }, { data: upsells }] = await Promise.all([
    sp2db.from('sp2_print_jobs').select(JOB_FIELDS).in('stripe_payment_intent_id', pis),
    sp2db.from('orders').select(ORDER_FIELDS).eq('metadata->>funnel', SP2_UPSELL_FUNNEL).in('metadata->>original_pi', pis),
  ]);
  return (orders as OrderRow[]).map((o) =>
    build(
      o,
      ((jobs ?? []) as (PrintJob & { stripe_payment_intent_id: string })[]).find((j) => j.stripe_payment_intent_id === o.stripe_payment_intent_id) ?? null,
      ((upsells ?? []) as OrderRow[]).find((u) => u.metadata?.original_pi === o.stripe_payment_intent_id && u.status === 'paid'),
    ),
  );
}

/** One book order by its Stripe payment id, or null. */
export async function getBookOrder(paymentIntentId: string): Promise<BookOrder | null> {
  const { data: o } = await sp2db.from('orders').select(ORDER_FIELDS).eq('stripe_payment_intent_id', paymentIntentId).maybeSingle();
  if (!o || (o.metadata as Record<string, unknown> | null)?.funnel !== SP2_FUNNEL) return null;
  const [{ data: job }, { data: upsells }] = await Promise.all([
    sp2db.from('sp2_print_jobs').select(JOB_FIELDS).eq('stripe_payment_intent_id', paymentIntentId).maybeSingle(),
    sp2db.from('orders').select(ORDER_FIELDS).eq('metadata->>funnel', SP2_UPSELL_FUNNEL).eq('metadata->>original_pi', paymentIntentId),
  ]);
  return build(o as OrderRow, (job as PrintJob) ?? null, ((upsells ?? []) as OrderRow[]).find((u) => u.status === 'paid'));
}
