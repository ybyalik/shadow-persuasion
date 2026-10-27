/** The private order-status link (/order/[token]): the Stripe payment id plus a signature, so no login is needed. */

import { createHmac, timingSafeEqual } from 'crypto';
import { SP2_SITE_URL } from './config';

// The service key never changes with Stripe or Lulu key rotations, so old links keep working.
const LINK_SECRET = process.env.ORDER_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function sign(paymentIntentId: string) {
  return createHmac('sha256', LINK_SECRET).update(`order:${paymentIntentId}`).digest('base64url').slice(0, 24);
}

export function orderToken(paymentIntentId: string) {
  return `${paymentIntentId}.${sign(paymentIntentId)}`;
}

export function orderStatusUrl(paymentIntentId: string) {
  return `${SP2_SITE_URL}/order/${orderToken(paymentIntentId)}`;
}

/** The payment intent id inside a valid token, or null. */
export function verifyOrderToken(token: string): string | null {
  const [pi, sig] = decodeURIComponent(token || '').split('.');
  if (!pi?.startsWith('pi_') || !sig || !LINK_SECRET) return null;
  const want = Buffer.from(sign(pi));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? pi : null;
}

