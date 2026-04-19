/**
 * GET /api/admin/orders
 *
 * List all orders with filter + pagination support.
 * Query params:
 *   status: 'all' | 'paid' | 'pending' | 'refunded' | 'failed'  (default 'all')
 *   product: 'all' | 'book' | 'briefing' | 'playbooks' | 'vault'  (default 'all')
 *   search: email substring (optional)
 *   from, to: ISO date strings (optional)
 *   limit: max 500 (default 100)
 *   offset: pagination (default 0)
 *
 * Returns: { orders: [...], total, totalRevenueCents, funnel }
 *
 * Each order includes a `member` field — the subscription row for the
 * buyer's email if one exists (i.e. "this buyer became a SaaS member").
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type OrderRow = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  items: unknown;
  amount_cents: number;
  currency: string;
  status: string;
  delivered_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type SubRow = {
  email: string | null;
  stripe_customer_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const product = url.searchParams.get('product') || 'all';
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);
    const offset = Number(url.searchParams.get('offset') || 0);

    // Build base query
    let query = supabase.from('orders').select('*', { count: 'exact' });
    if (status !== 'all') query = query.eq('status', status);
    if (product !== 'all') query = query.contains('items', [product]);
    if (search) query = query.ilike('email', `%${search}%`);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: orders, count, error } = await query;
    if (error) throw error;

    // Collect emails to join against subscriptions for "member?" indication
    const emails = Array.from(new Set((orders ?? []).map((o) => o.email).filter(Boolean)));
    let subsByEmail = new Map<string, SubRow>();
    let subsByCustomerId = new Map<string, SubRow>();

    if (emails.length > 0) {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('email, stripe_customer_id, plan, status, current_period_end')
        .in('email', emails);
      for (const s of (subs ?? []) as SubRow[]) {
        if (s.email) subsByEmail.set(s.email.toLowerCase(), s);
        if (s.stripe_customer_id) subsByCustomerId.set(s.stripe_customer_id, s);
      }
    }

    // Also catch subs that don't have email set (new ones from upsell-app flow
    // before link). We look them up by stripe_customer_id.
    const customerIds = Array.from(
      new Set((orders ?? []).map((o) => o.stripe_customer_id).filter(Boolean))
    ) as string[];
    if (customerIds.length > 0) {
      const { data: subs2 } = await supabase
        .from('subscriptions')
        .select('email, stripe_customer_id, plan, status, current_period_end')
        .in('stripe_customer_id', customerIds);
      for (const s of (subs2 ?? []) as SubRow[]) {
        if (s.stripe_customer_id && !subsByCustomerId.has(s.stripe_customer_id)) {
          subsByCustomerId.set(s.stripe_customer_id, s);
        }
      }
    }

    // Aggregate revenue across currently-visible order set for top-of-page stat
    let totalRevenueCents = 0;
    for (const o of (orders ?? []) as OrderRow[]) {
      if (o.status === 'paid') totalRevenueCents += o.amount_cents;
    }

    // Decorate each order with member sub info
    const decorated = (orders ?? []).map((o: OrderRow) => {
      const sub =
        subsByEmail.get(o.email?.toLowerCase() ?? '') ||
        (o.stripe_customer_id && subsByCustomerId.get(o.stripe_customer_id)) ||
        null;
      return {
        ...o,
        member: sub
          ? {
              plan: sub.plan,
              status: sub.status,
              current_period_end: sub.current_period_end,
            }
          : null,
      };
    });

    // Funnel summary (for "conversion rate" at top of page).
    // Looks across ALL orders, not just the currently filtered ones.
    const { data: allForFunnel } = await supabase
      .from('orders')
      .select('email, items, status');
    const allOrders = (allForFunnel ?? []) as Pick<OrderRow, 'email' | 'items' | 'status'>[];

    const bookPaid = new Set<string>();
    const bumpPaid = new Set<string>();
    const upsell1Paid = new Set<string>();

    for (const o of allOrders) {
      if (o.status !== 'paid') continue;
      const items = (o.items as string[]) || [];
      const email = (o.email || '').toLowerCase();
      if (!email) continue;
      if (items.includes('book')) bookPaid.add(email);
      if (items.includes('briefing')) bumpPaid.add(email);
      if (items.includes('playbooks') || items.includes('vault')) upsell1Paid.add(email);
    }

    // Subs that came from book-funnel buyers (upsell_app takers)
    let upsell2Count = 0;
    if (bookPaid.size > 0) {
      const { data: bookBuyerSubs } = await supabase
        .from('subscriptions')
        .select('email')
        .in('email', Array.from(bookPaid));
      upsell2Count = (bookBuyerSubs ?? []).length;
    }

    return NextResponse.json({
      orders: decorated,
      total: count ?? decorated.length,
      totalRevenueCents,
      funnel: {
        bookBuyers: bookPaid.size,
        bumpTakers: bumpPaid.size,
        upsell1Takers: upsell1Paid.size,
        upsell2Takers: upsell2Count,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/orders GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
