/**
 * Who may use the app, decided in one place.
 *
 * Access comes from any of:
 *   - being an admin
 *   - an app_access row that hasn't run out (the paperback includes 60 days)
 *   - a Stripe subscription that is live, or cancelled but paid up to a future date
 *   - a paid order containing an app product ('app' / 'lifetime')
 *
 * Used by the sign-up check, the register backstop, and every app API route.
 */

import { createClient } from '@supabase/supabase-js';
import { getAdminEmails, requireUser, type AuthedUser } from './auth-api';
import { escapeLike } from './db-utils';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const BOOK_ACCESS_DAYS = 60;

export type Access =
  | { ok: true; kind: 'admin' | 'book' | 'subscription' | 'order'; until: string | null }
  | { ok: false; kind: 'none' | 'expired'; until: string | null };

export async function getAccess(rawEmail: string | null | undefined): Promise<Access> {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) return { ok: false, kind: 'none', until: null };

  if ((await getAdminEmails()).includes(email)) return { ok: true, kind: 'admin', until: null };

  const now = Date.now();
  const pattern = escapeLike(email);

  const { data: subs } = await db.from('subscriptions').select('status, current_period_end').ilike('email', pattern);
  for (const s of subs ?? []) {
    const status = (s.status || '').toLowerCase();
    const end = s.current_period_end ? new Date(s.current_period_end).getTime() : null;
    if (status === 'active' || status === 'trialing' || status === 'past_due') {
      return { ok: true, kind: 'subscription', until: s.current_period_end ?? null };
    }
    if ((status === 'cancelled' || status === 'canceled') && end && end > now) {
      return { ok: true, kind: 'subscription', until: s.current_period_end };
    }
  }

  const { data: grant } = await db.from('app_access').select('access_until').ilike('email', pattern).maybeSingle();
  if (grant && new Date(grant.access_until).getTime() > now) return { ok: true, kind: 'book', until: grant.access_until };

  const { data: orders } = await db
    .from('orders')
    .select('items')
    .ilike('email', pattern)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5);
  if ((orders ?? []).some((o) => ((o.items as string[]) || []).some((i) => i === 'app' || i === 'lifetime'))) {
    return { ok: true, kind: 'order', until: null };
  }

  return { ok: false, kind: grant ? 'expired' : 'none', until: grant?.access_until ?? null };
}

/**
 * Gives (or extends) time-limited access. Never shortens existing access.
 * Safe to call repeatedly for the same order.
 */
export async function grantAccess(opts: {
  email: string;
  days: number;
  source: string;
  orderId?: string | null;
  isTest?: boolean;
  from?: Date;
}) {
  const email = opts.email.trim().toLowerCase();
  const target = new Date((opts.from ?? new Date()).getTime() + opts.days * 86400_000);
  const { data: existing } = await db
    .from('app_access')
    .select('id, access_until, order_id')
    .ilike('email', escapeLike(email))
    .maybeSingle();

  if (!existing) {
    await db.from('app_access').insert({
      email,
      source: opts.source,
      access_until: target.toISOString(),
      order_id: opts.orderId ?? null,
      is_test: Boolean(opts.isTest),
    });
    return;
  }
  // The same order granting twice (webhook + thank-you page) must not add time twice.
  if (opts.orderId && existing.order_id === opts.orderId) return;
  if (new Date(existing.access_until).getTime() >= target.getTime()) return;
  await db
    .from('app_access')
    .update({
      access_until: target.toISOString(),
      source: opts.source,
      order_id: opts.orderId ?? existing.order_id,
      reminder_50_sent_at: null,
      reminder_58_sent_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
}

/**
 * For app API routes: a signed-in user who currently has access.
 * Throws a 401 (not signed in) or 403 { error: 'no_access' } Response.
 */
export async function requireAppUser(request: Request): Promise<AuthedUser & { access: Access }> {
  const user = await requireUser(request);
  const access = await getAccess(user.email);
  if (!access.ok) {
    throw new Response(
      JSON.stringify({ error: 'no_access', message: 'Your access has ended. You can keep the app on the Keep access page.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return { ...user, access };
}
