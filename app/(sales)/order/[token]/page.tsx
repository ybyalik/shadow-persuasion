import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '../../../_sales/ui';
import { getBookOrder, verifyOrderToken, type OrderStage } from '@/lib/sp2/orders';
import { ResendDownloads } from '../OrderClient';

// The private order page linked from the order emails. The token is the Stripe payment id plus a
// signature (lib/sp2/order-link.ts), so it needs no login; it never shows card details.
export const metadata: Metadata = { title: 'Your order | Shadow Persuasion', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STEPS: { key: OrderStage; label: string; note: string }[] = [
  { key: 'paid', label: 'Order received', note: 'Your payment went through and your digital copy was emailed.' },
  { key: 'printing', label: 'Being printed', note: 'Your copy is printed for you, then packed. This usually takes a few business days.' },
  { key: 'shipped', label: 'Shipped', note: 'It’s on its way. Use the tracking link for the latest.' },
  { key: 'delivered', label: 'Delivered', note: 'The carrier marked it delivered.' },
];

const date = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pi = verifyOrderToken(token);
  const order = pi ? await getBookOrder(pi) : null;

  if (!order) {
    return (
      <Shell>
        <h1 className="sp2-display text-[40px] leading-[1.05]">We couldn&apos;t find that order</h1>
        <p className="text-[19px] leading-relaxed text-[color:var(--sp2-muted)] mt-4">
          The link may be incomplete. You can <Link href="/order" className="underline">get a fresh link by email</Link>, or reply to any of our emails and we&apos;ll help.
        </p>
      </Shell>
    );
  }

  const physical = Boolean(order.job);
  // A problem at the printer is ours to fix; the customer just sees "being printed".
  const stage: OrderStage = order.stage.stage === 'problem' ? 'printing' : order.stage.stage;
  const current = STEPS.findIndex((s) => s.key === stage);
  const a = order.shippingAddress;

  return (
    <Shell>
      <p className="sp2-kicker mb-3">Order from {date(order.createdAt)}</p>
      <h1 className="sp2-display text-[40px] sm:text-[52px] leading-[1.05]">
        {order.status === 'refunded' ? 'This order was refunded' : physical ? order.stage.label : 'Your order is complete'}
      </h1>
      <p className="text-[19px] leading-relaxed text-[color:var(--sp2-muted)] mt-3">
        {order.description}
        {order.upsell ? ', plus The Applied Power Playbook Library' : ''}. Paid {money(order.amountCents + (order.upsell?.amountCents ?? 0))}.
      </p>

      {physical && order.status !== 'refunded' && (
        <ol className="mt-10 space-y-0">
          {STEPS.map((s, i) => {
            const done = i <= current;
            return (
              <li key={s.key} className="relative pl-10 pb-8 last:pb-0">
                {i < STEPS.length - 1 && <span className={`absolute left-[11px] top-7 bottom-0 w-[2px] ${i < current ? 'bg-[color:var(--sp2-accent)]' : 'bg-[color:var(--sp2-line)]'}`} />}
                <span
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[13px] ${
                    done ? 'bg-[color:var(--sp2-accent)] border-[color:var(--sp2-accent)] text-white' : 'bg-white border-[color:var(--sp2-line)]'
                  }`}
                >
                  {done ? '✓' : ''}
                </span>
                <p className={`sp2-ui text-[18px] font-semibold ${done ? '' : 'text-[color:var(--sp2-muted)]'}`}>{s.label}</p>
                {i === current && <p className="text-[16px] leading-relaxed text-[color:var(--sp2-muted)] mt-1">{s.note}</p>}
                {s.key === 'shipped' && done && order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="sp2-btn inline-block mt-3 !py-2.5 !px-5">
                    Track your package{order.job?.carrier_name ? ` (${order.job.carrier_name})` : ''}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        {a && (
          <div className="rounded-[10px] border border-[color:var(--sp2-line)] bg-white p-6">
            <p className="sp2-kicker mb-2">Shipping to</p>
            <p className="text-[17px] leading-relaxed">
              {a.name}
              <br />
              {a.street1}
              {a.street2 ? <><br />{a.street2}</> : null}
              <br />
              {a.city}, {a.state_code} {a.postcode}
            </p>
            <p className="sp2-ui text-[15px] text-[color:var(--sp2-muted)] mt-3">Need to change the address? Reply to your order email as soon as you can, before it ships.</p>
          </div>
        )}
        {order.status === 'paid' && (
          <div className="rounded-[10px] border border-[color:var(--sp2-line)] bg-white p-6">
            <p className="sp2-kicker mb-2">Your digital copy and extras</p>
            <p className="text-[17px] leading-relaxed mb-4">
              We emailed your download links to <b>{order.email}</b>. Can&apos;t find them? We&apos;ll send them again to the same address.
            </p>
            <ResendDownloads token={token} />
            {order.format && (
              <p className="sp2-ui text-[15px] text-[color:var(--sp2-muted)] mt-4">
                Your 60 days of the app: <Link href={`/login?tab=signup&email=${encodeURIComponent(order.email)}`} className="underline">open the app</Link> and sign in with this same email.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="sp2-ui text-[15px] text-[color:var(--sp2-muted)] mt-12">Questions about your order? Reply to any of our emails and a real person will answer.</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[color:var(--sp2-paper)]">
      <header className="max-w-3xl mx-auto px-5 sm:px-8 pt-6">
        <Logo tone="light" />
      </header>
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-24">{children}</section>
    </main>
  );
}
