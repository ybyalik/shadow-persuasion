/**
 * GET /api/admin/dashboard
 *
 * Returns top-level metrics for the admin dashboard:
 *   - Orders: total / paid / refunded / last 24h
 *   - Revenue: all-time / last 24h
 *   - Members: total / active
 *   - Knowledge base: books / chunks
 *
 * Server-gated by requireAdmin (verified Firebase token + admin email
 * check). The client-side useAdmin redirect is defense-in-depth only.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supabase returns at most 1000 rows per request. Page through with
// .range() so aggregate metrics stay correct past 1000 rows instead of
// silently capping (which would understate revenue / counts as sales grow).
const PAGE_SIZE = 1000;

async function fetchAllOrders() {
  const rows: Array<{ email: string | null; amount_cents: number | null; status: string; created_at: string }> = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('orders')
      .select('email, amount_cents, status, created_at')
      .eq('is_test', false)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function fetchAllBookTitles() {
  const titles: string[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('book_title')
      .order('book_title', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const c of data) titles.push(c.book_title);
    if (data.length < PAGE_SIZE) break;
  }
  return titles;
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Orders aggregate — group by email so one "order" = one customer session.
    // Test orders (is_test = true) are filtered out so dashboard metrics
    // reflect real revenue / conversions only. The admin can still see
    // test orders individually in /app/admin/orders with the "Include
    // test orders" toggle. Paged so totals don't cap at 1000 rows.
    const rawOrders = await fetchAllOrders();

    // Bucket by email for customer-session semantics
    const sessionsByEmail = new Map<string, {
      firstAt: string;
      hasPaid: boolean;
      hasPending: boolean;
      hasRefunded: boolean;
      totalPaidCents: number;
      paidInLast24h: boolean;
    }>();

    for (const o of rawOrders) {
      const email = (o.email || '').toLowerCase();
      if (!email) continue;
      const bucket = sessionsByEmail.get(email) || {
        firstAt: o.created_at,
        hasPaid: false,
        hasPending: false,
        hasRefunded: false,
        totalPaidCents: 0,
        paidInLast24h: false,
      };
      if (o.status === 'paid') {
        bucket.hasPaid = true;
        bucket.totalPaidCents += o.amount_cents ?? 0;
        if (o.created_at >= yesterday) bucket.paidInLast24h = true;
      } else if (o.status === 'pending') bucket.hasPending = true;
      else if (o.status === 'refunded') bucket.hasRefunded = true;
      if (o.created_at < bucket.firstAt) bucket.firstAt = o.created_at;
      sessionsByEmail.set(email, bucket);
    }

    const sessions = Array.from(sessionsByEmail.values());
    const paidSessions = sessions.filter((s) => s.hasPaid && !s.hasRefunded);
    const refundedSessions = sessions.filter((s) => s.hasRefunded);
    const recentSessions = sessions.filter((s) => s.paidInLast24h);

    const revenueCents = paidSessions.reduce((sum, s) => sum + s.totalPaidCents, 0);
    const last24hRevenueCents = recentSessions.reduce(
      (sum, s) => sum + s.totalPaidCents,
      0
    );

    // Members / subscriptions — exclude test subscriptions from dashboard counts
    const { count: membersTotal } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_test', false);

    const { count: membersActive } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing'])
      .eq('is_test', false);

    // Knowledge base: total chunk count via an exact head count (not capped
    // at 1000), and distinct book titles by paging through all rows.
    const { count: chunksCount } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });

    const bookTitles = await fetchAllBookTitles();
    const uniqueBooks = new Set(bookTitles.filter(Boolean)).size;
    const chunksTotal = chunksCount ?? bookTitles.length;

    return NextResponse.json({
      stats: {
        // "ordersTotal" now = customer sessions (one per email), not raw Stripe
        // charges. A single funnel completion that hits book+bump+upsell = 1.
        ordersTotal: sessions.length,
        ordersPaid: paidSessions.length,
        ordersRefunded: refundedSessions.length,
        rawChargesTotal: rawOrders.length,
        revenueCents,
        last24hOrders: recentSessions.length,
        last24hRevenueCents,
        membersTotal: membersTotal ?? 0,
        membersActive: membersActive ?? 0,
        booksTotal: uniqueBooks,
        chunksTotal,
      },
    });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[admin/dashboard]', err);
  }
}
