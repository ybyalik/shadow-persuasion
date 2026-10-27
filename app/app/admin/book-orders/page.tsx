'use client';

/**
 * Book orders: every paid book order with its print status at Lulu and tracking, plus the
 * actions the owner needs (refresh from Lulu, retry sending, resend emails, set tracking).
 * Data: /api/admin/book-orders (lib/sp2/orders.ts). The older /app/admin/orders page keeps
 * the funnel-wide revenue view.
 */

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type Order = {
  paymentIntentId: string;
  email: string;
  name: string | null;
  items: string[];
  format: 'paperback' | 'hardcover' | null;
  amountCents: number;
  status: string;
  isTest: boolean;
  createdAt: string;
  shippingAddress: Record<string, string> | null;
  upsell: { amountCents: number } | null;
  job: {
    status: string;
    lulu_print_job_id: number | null;
    carrier_name: string | null;
    shipped_email_sent_at: string | null;
    error: string | null;
    shipping_level: string | null;
    updated_at: string;
  } | null;
  stage: { stage: string; label: string; admin: string };
  trackingUrl: string | null;
  orderUrl: string;
};

type Filter = 'all' | 'attention' | 'open' | 'shipped';

const STAGE_COLORS: Record<string, string> = {
  paid: 'bg-gray-200 text-gray-800 dark:bg-[#333] dark:text-[#F4ECD8]',
  printing: 'bg-blue-600 text-white',
  shipped: 'bg-emerald-600 text-white',
  delivered: 'bg-emerald-800 text-white',
  problem: 'bg-red-600 text-white',
  refunded: 'bg-gray-500 text-white',
  digital: 'bg-[#D4A017] text-black',
};

const DAY = 24 * 60 * 60 * 1000;

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const date = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function needsAttention(o: Order) {
  if (o.stage.stage === 'problem') return true;
  if (!o.isTest && o.job?.status === 'dry_run') return true; // a real order that never went to the printer
  const age = Date.now() - new Date(o.createdAt).getTime();
  return (o.stage.stage === 'paid' || o.stage.stage === 'printing') && age > 10 * DAY;
}

export default function BookOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeTest, setIncludeTest] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/book-orders${includeTest ? '?test=1' : ''}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not load orders.');
      setOrders(d.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, [includeTest]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(
    () =>
      orders.filter((o) =>
        filter === 'attention' ? needsAttention(o) : filter === 'open' ? ['paid', 'printing', 'problem'].includes(o.stage.stage) : filter === 'shipped' ? ['shipped', 'delivered'].includes(o.stage.stage) : true,
      ),
    [orders, filter],
  );
  const attention = orders.filter(needsAttention).length;

  const replace = (o: Order) => setOrders((list) => list.map((x) => (x.paymentIntentId === o.paymentIntentId ? o : x)));

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Book orders</h1>
          <p className="text-sm text-gray-500 dark:text-[#F4ECD8]/60 mt-1">Every paid book order, where it is at the printer, and its tracking.</p>
        </div>
        <button onClick={load} className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]">
          <RefreshCw className="h-3.5 w-3.5 inline mr-1.5" /> Reload
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(
          [
            ['all', `All (${orders.length})`],
            ['attention', `Needs attention (${attention})`],
            ['open', 'Not shipped yet'],
            ['shipped', 'Shipped'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border ${
              filter === key ? 'bg-[#D4A017] text-black border-[#D4A017] font-bold' : 'border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/80'
            } ${key === 'attention' && attention > 0 && filter !== key ? '!border-red-500 !text-red-600 dark:!text-red-400' : ''}`}
          >
            {label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70 ml-auto">
          <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} className="accent-[#D4A017]" />
          Include test orders
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              {['Date', 'Customer', 'Bought', 'Paid', 'Status', 'Tracking'].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono ${i === 3 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">Loading…</td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  {orders.length === 0 ? 'No book orders yet.' : 'No orders in this view.'}
                </td>
              </tr>
            ) : (
              shown.map((o) => (
                <Fragment key={o.paymentIntentId}>
                  <tr
                    onClick={() => setOpen(open === o.paymentIntentId ? null : o.paymentIntentId)}
                    className={`border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A] cursor-pointer ${o.isTest ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-[#F4ECD8]/70 font-mono whitespace-nowrap">{date(o.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-[#F4ECD8]">
                      <div className="flex items-center gap-2">
                        {o.name || '(no name)'}
                        {o.isTest && <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-purple-600 text-white font-bold">Test</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#F4ECD8]/50">{o.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-[#F4ECD8]/80">
                      {o.format === 'hardcover' ? 'Hardcover' : o.format === 'paperback' ? 'Paperback' : 'Digital'}
                      {o.items.includes('sp2_scripts') && ' + 100 Replies'}
                      {o.upsell && ' + Playbooks'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#D4A017] whitespace-nowrap">
                      {money(o.amountCents + (o.upsell?.amountCents ?? 0))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold ${STAGE_COLORS[o.stage.stage]}`}>{o.stage.label}</span>
                      <div className="text-[11px] text-gray-500 dark:text-[#F4ECD8]/50 mt-1">{o.stage.admin}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.trackingUrl ? (
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#D4A017] underline">
                          {o.job?.carrier_name || 'Track'} <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-[#F4ECD8]/30">—</span>
                      )}
                    </td>
                  </tr>
                  {open === o.paymentIntentId && <OrderDetail order={o} onUpdate={replace} />}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDetail({ order: o, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const a = o.shippingAddress;
  const shipped = o.stage.stage === 'shipped' || o.stage.stage === 'delivered';

  async function act(action: string, done: string, extra: Record<string, string> = {}) {
    setBusy(action);
    setNote(null);
    try {
      const res = await apiFetch('/api/admin/book-orders/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: o.paymentIntentId, action, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'That action failed.');
      if (d.order) onUpdate(d.order);
      setNote({ ok: true, text: done });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : 'That action failed.' });
    } finally {
      setBusy(null);
    }
  }

  const btn = 'px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-gray-300 dark:border-[#D4A017]/30 text-gray-800 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-40';

  return (
    <tr className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20">
      <td colSpan={6} className="px-4 py-5">
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-800 dark:text-[#F4ECD8]/85">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono mb-1">Ship to</p>
            {a ? (
              <p className="leading-relaxed">
                {a.name}
                <br />
                {a.street1}
                {a.street2 ? <><br />{a.street2}</> : null}
                <br />
                {a.city}, {a.state_code} {a.postcode}
                {a.phone_number ? <><br />{a.phone_number}</> : null}
              </p>
            ) : (
              <p className="text-gray-500">No printed book on this order.</p>
            )}
            {o.job?.shipping_level && <p className="text-xs text-gray-500 mt-2">Shipping: {o.job.shipping_level.toLowerCase()}</p>}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono mb-1">Printer (Lulu)</p>
            <p>{o.stage.admin}</p>
            {o.job?.lulu_print_job_id && <p className="text-xs text-gray-500 mt-1">Lulu job #{o.job.lulu_print_job_id}</p>}
            {o.job?.updated_at && <p className="text-xs text-gray-500">Last update {date(o.job.updated_at)}</p>}
            {o.job?.shipped_email_sent_at && <p className="text-xs text-gray-500">Tracking email sent {date(o.job.shipped_email_sent_at)}</p>}
            {o.job?.error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{o.job.error}</p>}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono mb-1">Customer&apos;s order page</p>
            <a href={o.orderUrl} target="_blank" rel="noreferrer" className="text-[#D4A017] underline text-xs break-all">
              Open the page they see <ExternalLink className="h-3 w-3 inline" />
            </a>
            <button className="block text-xs underline text-gray-600 dark:text-[#F4ECD8]/60 mt-1" onClick={() => navigator.clipboard?.writeText(o.orderUrl).then(() => setNote({ ok: true, text: 'Link copied.' }))}>
              Copy link
            </button>
            <p className="text-xs text-gray-500 mt-2">Stripe payment {o.paymentIntentId}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {o.job?.lulu_print_job_id && (
            <button className={btn} disabled={!!busy} onClick={() => act('refresh', 'Updated from Lulu.')}>
              {busy === 'refresh' ? 'Checking…' : 'Check status with Lulu'}
            </button>
          )}
          {o.job && !o.job.lulu_print_job_id && (o.stage.stage === 'problem' || o.job.status === 'dry_run' || o.job.status === 'pending') && (
            <button className={btn} disabled={!!busy} onClick={() => act('send_to_lulu', 'Sent to Lulu (or left as a test if printing is switched off).')}>
              {busy === 'send_to_lulu' ? 'Sending…' : 'Send to Lulu again'}
            </button>
          )}
          <button className={btn} disabled={!!busy} onClick={() => act('resend_downloads', `Download email sent to ${o.email}.`)}>
            {busy === 'resend_downloads' ? 'Sending…' : 'Email download links again'}
          </button>
          {shipped && (
            <button className={btn} disabled={!!busy} onClick={() => act('resend_tracking', `Tracking email sent to ${o.email}.`)}>
              {busy === 'resend_tracking' ? 'Sending…' : 'Email tracking again'}
            </button>
          )}
        </div>

        {o.job && (
          <div className="flex flex-wrap items-end gap-2 mt-4">
            <label className="text-xs text-gray-600 dark:text-[#F4ECD8]/60">
              Tracking link (only if Lulu didn&apos;t send one)
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="https://…" className="block mt-1 w-72 px-2 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm" />
            </label>
            <label className="text-xs text-gray-600 dark:text-[#F4ECD8]/60">
              Carrier
              <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="USPS" className="block mt-1 w-32 px-2 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-sm" />
            </label>
            <button className={btn} disabled={!!busy || !tracking} onClick={() => act('set_tracking', 'Tracking link saved.', { trackingUrl: tracking, carrier })}>
              Save tracking
            </button>
          </div>
        )}

        {note && <p className={`mt-3 text-sm ${note.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{note.text}</p>}
      </td>
    </tr>
  );
}
