/**
 * GET /api/admin/book-orders?test=1
 *
 * Paid and refunded book orders with their print status and tracking (lib/sp2/orders.ts),
 * for /app/admin/book-orders. Test orders are left out unless ?test=1.
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { listBookOrders, orderStatusUrl } from '@/lib/sp2/orders';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const includeTest = new URL(req.url).searchParams.get('test') === '1';
    const orders = await listBookOrders({ includeTest });
    return NextResponse.json({ orders: orders.map((o) => ({ ...o, orderUrl: orderStatusUrl(o.paymentIntentId) })) });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Could not load orders.', 500, '[admin/book-orders]', err);
  }
}
