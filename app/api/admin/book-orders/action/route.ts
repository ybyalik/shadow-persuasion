/**
 * POST /api/admin/book-orders/action
 *
 * One admin action on a book order. Body: { paymentIntentId, action, trackingUrl?, carrier? }
 *   refresh          ask Lulu for the latest status (and email tracking if it just shipped)
 *   send_to_lulu     retry an order that didn't reach Lulu (only when printing is switched on)
 *   resend_downloads email the download links again
 *   resend_tracking  email the "on its way" message again
 *   set_tracking     save a tracking link by hand (e.g. a reprint Lulu sent outside the API)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getBookOrder, orderStatusUrl } from '@/lib/sp2/orders';
import { refreshJob, resendShippedEmail, retrySendToLulu } from '@/lib/sp2/print';
import { sendSp2DeliveryEmail, sp2DownloadLinks, sp2db } from '@/lib/sp2/server';

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const pi = String(body?.paymentIntentId || '');
    const order = pi ? await getBookOrder(pi) : null;
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const job = order.job;

    switch (body?.action) {
      case 'refresh': {
        if (!job?.lulu_print_job_id) return NextResponse.json({ error: 'This order has not reached Lulu yet.' }, { status: 400 });
        await refreshJob(job.id, job.lulu_print_job_id);
        break;
      }
      case 'send_to_lulu': {
        if (!job) return NextResponse.json({ error: 'This order has no printed book.' }, { status: 400 });
        if (job.lulu_print_job_id) return NextResponse.json({ error: 'Already at Lulu.' }, { status: 400 });
        await retrySendToLulu(pi);
        break;
      }
      case 'resend_downloads': {
        const links = await sp2DownloadLinks(order.items);
        const sent = await sendSp2DeliveryEmail({ to: order.email, items: order.items, links, orderUrl: orderStatusUrl(pi) });
        if (!sent.ok) return NextResponse.json({ error: 'The email did not send. Check the email log.' }, { status: 502 });
        break;
      }
      case 'resend_tracking': {
        if (!job || !(job.status === 'SHIPPED' || job.status === 'DELIVERED'))
          return NextResponse.json({ error: 'Only shipped orders have a tracking email.' }, { status: 400 });
        if (!(await resendShippedEmail(job.id))) return NextResponse.json({ error: 'The email did not send. Check the email log.' }, { status: 502 });
        break;
      }
      case 'set_tracking': {
        const url = String(body?.trackingUrl || '').trim();
        if (!job || !/^https?:\/\//.test(url)) return NextResponse.json({ error: 'Enter a full tracking link starting with https://' }, { status: 400 });
        await sp2db
          .from('sp2_print_jobs')
          .update({ tracking_urls: [url], carrier_name: String(body?.carrier || '').trim() || job.carrier_name })
          .eq('id', job.id);
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }

    const updated = await getBookOrder(pi);
    return NextResponse.json({ ok: true, order: updated ? { ...updated, orderUrl: orderStatusUrl(pi) } : null });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('That action failed.', 500, '[admin/book-orders/action]', err);
  }
}
