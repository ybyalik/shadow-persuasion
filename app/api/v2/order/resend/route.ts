/**
 * POST /api/v2/order/resend  { token }
 *
 * "Email me my downloads again" on the private order page (/order/[token]). Sends the
 * download email to the address on the order (never anywhere else), at most once every 10 minutes.
 */

import { NextResponse } from 'next/server';
import { getBookOrder, orderStatusUrl, verifyOrderToken } from '@/lib/sp2/orders';
import { sendSp2DeliveryEmail, sp2DownloadLinks, sp2db } from '@/lib/sp2/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const pi = verifyOrderToken(String(body?.token || ''));
    const order = pi ? await getBookOrder(pi) : null;
    if (!pi || !order || order.status !== 'paid') return NextResponse.json({ error: 'We could not find that order.' }, { status: 404 });

    const { data: recent } = await sp2db
      .from('email_sends')
      .select('id')
      .eq('template_key', 'sp2_delivery')
      .ilike('to_email', order.email)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(1);
    if (recent?.length) return NextResponse.json({ ok: true, message: 'We just sent it. Check your inbox (and spam folder).' });

    const links = await sp2DownloadLinks(order.items);
    const sent = await sendSp2DeliveryEmail({ to: order.email, items: order.items, links, orderUrl: orderStatusUrl(pi) });
    if (!sent.ok) return NextResponse.json({ error: 'The email did not go out. Please reply to any of our emails and we will help.' }, { status: 502 });
    return NextResponse.json({ ok: true, message: 'Sent. Check your inbox (and spam folder).' });
  } catch (err) {
    console.error('[v2/order/resend]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
