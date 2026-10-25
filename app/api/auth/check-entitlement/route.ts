/**
 * POST /api/auth/check-entitlement
 *
 * Gates /login sign-up: only people with app access may create an account.
 * Access rules live in lib/access.ts (book buyers get 60 days, subscribers,
 * admins). Body: { email }. Returns: { entitled, reason?, until? }.
 */

import { NextResponse } from 'next/server';
import { getAccess } from '@/lib/access';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ entitled: false, reason: 'missing_email' }, { status: 400 });
    const access = await getAccess(email);
    // Lapsed buyers may still make an account; the app then offers to keep access.
    if (access.ok || access.kind === 'expired') return NextResponse.json({ entitled: true, reason: access.kind, until: access.until });
    return NextResponse.json({ entitled: false, reason: 'no_subscription' });
  } catch (err) {
    console.error('[auth/check-entitlement]', err);
    // Fail closed, and never show the raw error.
    return NextResponse.json({ entitled: false, reason: 'error' }, { status: 500 });
  }
}
