/**
 * GET /api/unsubscribe?e=<base64email>&sig=<hmac>
 *
 * One-click unsubscribe endpoint for marketing emails. The link is
 * baked into every non-transactional send by lib/email.ts via the
 * {{unsubscribe_url}} variable.
 *
 * We verify the HMAC signature to make sure the request came from a
 * link we actually sent (otherwise anyone could unsubscribe anyone
 * by guessing email addresses).
 *
 * On success: record the opt-out in email_unsubscribes and redirect
 * to /unsubscribe (confirmation page). On invalid signature: redirect
 * to /unsubscribe?error=invalid so the user still sees a page rather
 * than a 400.
 */

import { NextResponse } from 'next/server';
import { recordUnsubscribe, verifyUnsubscribeSignature } from '@/lib/email-templates';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const e = url.searchParams.get('e') || '';
  const sig = url.searchParams.get('sig') || '';
  const templateKey = url.searchParams.get('tpl') || undefined;

  const email = verifyUnsubscribeSignature(e, sig);
  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', req.url));
  }

  const result = await recordUnsubscribe({
    email,
    source: 'link',
    templateKey,
    reason: 'one-click unsubscribe',
  });

  if (!result.ok) {
    console.error('[unsubscribe]', result.error);
    return NextResponse.redirect(
      new URL(`/unsubscribe?error=${encodeURIComponent(result.error ?? 'failed')}`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/unsubscribe?ok=1&email=${encodeURIComponent(email)}`, req.url)
  );
}
