/**
 * GET /api/admin/dashboard
 *
 * Top-level numbers for the admin dashboard, current site only (test orders excluded):
 *   - Book orders: paid / refunded / last 24h, and how many are still waiting to ship
 *   - Revenue: all-time / last 24h (book orders + upsell, as charged, including shipping)
 *   - App: people with active access, and how many kept it at $9.99/mo
 *   - Free chapter: signups / still receiving the email series
 *   - Knowledge base the app answers from: books / chunks
 *
 * Server-gated by requireAdmin (verified Firebase token + admin email
 * check). The client-side useAdmin redirect is defense-in-depth only.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { SP2_FUNNEL, SP2_UPSELL_FUNNEL } from '@/lib/sp2/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supabase returns at most 1000 rows per request. Page through with
// .range() so aggregate metrics stay correct past 1000 rows instead of
// silently capping (which would understate revenue / counts as sales grow).
const PAGE_SIZE = 1000;

/** Paid and refunded orders from the current site (book checkout + upsell), test orders excluded. */
async function fetchSiteOrders() {
  const rows: Array<{ email: string | null; amount_cents: number | null; status: string; created_at: string; metadata: Record<string, unknown> | null }> = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('orders')
      .select('email, amount_cents, status, created_at, metadata')
      .eq('is_test', false)
      .in('status', ['paid', 'refunded'])
      .in('metadata->>funnel', [SP2_FUNNEL, SP2_UPSELL_FUNNEL])
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
    const orders = await fetchSiteOrders();
    const book = orders.filter((o) => o.metadata?.funnel === SP2_FUNNEL);
    const paidBook = book.filter((o) => o.status === 'paid');
    const paid = orders.filter((o) => o.status === 'paid');
    const recent = paid.filter((o) => o.created_at >= yesterday);
    const revenueCents = paid.reduce((sum, o) => sum + (o.amount_cents ?? 0), 0);
    const last24hRevenueCents = recent.reduce((sum, o) => sum + (o.amount_cents ?? 0), 0);

    const nowIso = now.toISOString();
    const [{ count: appActive }, { count: appKept }, { count: signups }, { count: signupsActive }, { data: openJobs }] = await Promise.all([
      supabase.from('app_access').select('*', { count: 'exact', head: true }).gt('access_until', nowIso).or('is_test.is.null,is_test.eq.false'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'app_monthly').in('status', ['active', 'trialing']).eq('is_test', false),
      supabase.from('sp2_subscribers').select('*', { count: 'exact', head: true }).or('is_test.is.null,is_test.eq.false'),
      supabase.from('sp2_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active').or('is_test.is.null,is_test.eq.false'),
      supabase.from('sp2_print_jobs').select('status').eq('is_test', false).not('status', 'in', '(SHIPPED,DELIVERED,CANCELED)'),
    ]);

    const { count: chunksCount } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });

    const bookTitles = await fetchAllBookTitles();
    const uniqueBooks = new Set(bookTitles.filter(Boolean)).size;
    const chunksTotal = chunksCount ?? bookTitles.length;

    return NextResponse.json({
      stats: {
        ordersPaid: paidBook.length,
        ordersRefunded: book.filter((o) => o.status === 'refunded').length,
        last24hOrders: recent.filter((o) => o.metadata?.funnel === SP2_FUNNEL).length,
        revenueCents,
        last24hRevenueCents,
        awaitingShipment: (openJobs ?? []).length,
        appActive: appActive ?? 0,
        appKept: appKept ?? 0,
        signups: signups ?? 0,
        signupsActive: signupsActive ?? 0,
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
