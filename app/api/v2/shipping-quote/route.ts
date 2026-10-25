/**
 * POST /api/v2/shipping-quote
 *
 * What the customer pays for each shipping speed: standard mail is free, faster
 * speeds cost only the difference (live Lulu prices for the chosen format). The
 * checkout API re-quotes on the server, so these numbers are for display only.
 *
 * Body: { address: { name, street1, street2?, city, state_code, postcode, phone_number }, format?: 'paperback' | 'hardcover' }
 * Returns: { options: [{ level, label, estimate, cents }] }
 */

import { NextResponse } from 'next/server';
import { LULU_SHIPPING_LEVELS, isBookFormat, normalizeUsAddress, quoteShippingCents } from '@/lib/sp2/lulu';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const checked = normalizeUsAddress(body?.address || {});
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  try {
    const format = isBookFormat(body?.format) ? body.format : 'paperback';
    const quotes = await Promise.all(LULU_SHIPPING_LEVELS.map((s) => quoteShippingCents(checked.address, s.level, format)));
    const mail = quotes[0];
    const options = LULU_SHIPPING_LEVELS.map((s, i) => ({ ...s, cents: s.level === 'MAIL' ? 0 : Math.max(0, quotes[i] - mail) }));
    return NextResponse.json({ options });
  } catch (err) {
    console.error('[v2/shipping-quote] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We couldn't calculate shipping for that address. Please check it and try again." }, { status: 502 });
  }
}
