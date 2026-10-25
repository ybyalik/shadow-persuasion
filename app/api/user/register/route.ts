/**
 * POST /api/user/register
 *
 * Called from auth-context on every Firebase auth-state change to upsert
 * a row in the `users` table. This is also the server-side backstop for
 * the entitlement gate on /login — even if the UI gate is bypassed, we
 * refuse to register a Supabase user row without a paid subscription.
 *
 * On a successful first register, we also RECONCILE: if there's a
 * subscription row with `user_id = stripe_<customer_id>` whose email
 * matches the new Firebase user, we rebind it to the firebase_uid so
 * the admin view and downstream app-entitlement logic see a single
 * user, not two.
 *
 * Returns:
 *   200 { success: true }                 — registered (or already existed)
 *   403 { error: 'not_entitled' }         — no paid subscription for email
 *   500 { error: <message> }              — unexpected failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/auth-api';
import { passthroughAuthError } from '@/lib/api-error';
import { escapeLike } from '@/lib/db-utils';
import { getAccess } from '@/lib/access';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(req: NextRequest) {
  try {
    // Verified identity from the Firebase token — never trust the body email
    // for the entitlement gate, or a non-payer could pass a payer's address.
    const { uid: userId, email: verifiedEmail } = await requireUser(req);

    const { displayName } = await req.json().catch(() => ({}));
    const emailLower = verifiedEmail ? verifiedEmail.toLowerCase() : null;

    // If a row already exists for this firebase_uid, they've registered
    // before. We still re-check entitlement below so lapsed/cancelled
    // members are booted, not grandfathered in forever.
    const { data: existing } = await supabase
      .from('users')
      .select('firebase_uid')
      .eq('firebase_uid', userId)
      .maybeSingle();

    const isFirstRegistration = !existing;

    // Enforce the entitlement gate on EVERY login, not just the first, so a
    // customer who cancels stops getting in. Admins always pass.
    if (!emailLower) {
      return NextResponse.json(
        { error: 'not_entitled', reason: 'missing_email' },
        { status: 403 }
      );
    }
    // Expired users may still sign in: the app shows them the Keep access page
    // instead of the tools (every tool route checks access on the server).
    const access = await getAccess(emailLower);
    if (!access.ok && access.kind !== 'expired') {
      return NextResponse.json({ error: 'not_entitled', reason: 'no_subscription' }, { status: 403 });
    }

    // Upsert the users row.
    const { error: userErr } = await supabase
      .from('users')
      .upsert(
        {
          firebase_uid: userId,
          email: verifiedEmail || null,
          display_name: displayName || null,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'firebase_uid' }
      );
    if (userErr) throw userErr;

    // On first registration, reconcile any guest-checkout subscription
    // that was parked under `user_id = stripe_<customer>` with the new
    // firebase_uid so the admin + app see a single account.
    if (isFirstRegistration && emailLower) {
      const { data: guestSubs } = await supabase
        .from('subscriptions')
        .select('user_id')
        .ilike('email', escapeLike(emailLower))
        .like('user_id', 'stripe_%');

      for (const s of guestSubs ?? []) {
        const { error: relinkErr } = await supabase
          .from('subscriptions')
          .update({ user_id: userId, updated_at: new Date().toISOString() })
          .eq('user_id', s.user_id);
        if (relinkErr) {
          // Likely a unique-constraint collision because a row for this
          // firebase_uid already exists. Safe to ignore — the valid row
          // wins, and the stale stripe_* row can be cleaned up manually.
          console.warn('[USER_REGISTER] relink subscription failed:', relinkErr.message);
        }
      }
    }

    await supabase.from('app_access').update({ user_id: userId }).ilike('email', escapeLike(emailLower)).is('user_id', null);

    return NextResponse.json({ success: true, access });
  } catch (error: unknown) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    console.error('[USER_REGISTER]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
