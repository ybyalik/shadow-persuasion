/**
 * GET /api/admin/dashboard
 *
 * Returns top-level metrics for the admin dashboard:
 *   - Orders: total / paid / refunded / last 24h
 *   - Revenue: all-time / last 24h
 *   - Members: total / active
 *   - Knowledge base: books / chunks
 *
 * (Admin-gated by client-side useAdmin check; API itself is not currently
 * locked down — we trust the browser redirect for non-admins. Fix later
 * with a server-side admin token if needed.)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Orders aggregate
    const { data: ordersAll } = await supabase
      .from('orders')
      .select('amount_cents, status, created_at');

    const orders = ordersAll ?? [];
    const paidOrders = orders.filter((o) => o.status === 'paid');
    const refundedOrders = orders.filter((o) => o.status === 'refunded');
    const recentOrders = orders.filter(
      (o) => o.created_at && o.created_at >= yesterday && o.status === 'paid'
    );

    const revenueCents = paidOrders.reduce((sum, o) => sum + (o.amount_cents ?? 0), 0);
    const last24hRevenueCents = recentOrders.reduce(
      (sum, o) => sum + (o.amount_cents ?? 0),
      0
    );

    // Members / subscriptions
    const { count: membersTotal } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: membersActive } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Knowledge base: count distinct books via SQL RPC would be best, but a
    // simple select+dedup gets us there without migration.
    const { data: chunksAll } = await supabase
      .from('knowledge_chunks')
      .select('book_title');

    const chunks = chunksAll ?? [];
    const uniqueBooks = new Set(chunks.map((c) => c.book_title).filter(Boolean)).size;

    return NextResponse.json({
      stats: {
        ordersTotal: orders.length,
        ordersPaid: paidOrders.length,
        ordersRefunded: refundedOrders.length,
        revenueCents,
        last24hOrders: recentOrders.length,
        last24hRevenueCents,
        membersTotal: membersTotal ?? 0,
        membersActive: membersActive ?? 0,
        booksTotal: uniqueBooks,
        chunksTotal: chunks.length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/dashboard]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
