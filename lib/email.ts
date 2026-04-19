/**
 * Resend email helper — post-purchase delivery of PDF products.
 *
 * Requires env: RESEND_API_KEY
 * Optional env: RESEND_FROM (default: "Nate Harlan <nate@shadowpersuasion.com>")
 *               NEXT_PUBLIC_SITE_URL (default: "https://shadowpersuasion.com")
 */

import { Resend } from 'resend';
import { PRODUCTS, describeOrder, flattenDownloads, type ProductSlug } from './pricing';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM || 'Nate Harlan <nate@shadowpersuasion.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowpersuasion.com';

function renderDownloadRows(items: ProductSlug[]): string {
  const files = flattenDownloads(items);
  return files
    .map((f) => {
      const url = `${SITE_URL}${f.path}`;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #5C3A1E22;">
            <div style="font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#1A1A1A;">
              ${f.name}
            </div>
            <a href="${url}"
               style="display:inline-block;margin-top:8px;padding:9px 20px;
                      background:#D4A017;color:#000;text-decoration:none;
                      font-family:'Courier New',monospace;font-size:12px;
                      font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
              DOWNLOAD &rarr;
            </a>
          </td>
        </tr>`;
    })
    .join('');
}

export async function sendDeliveryEmail(opts: {
  to: string;
  items: ProductSlug[];
  firstName?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send');
    return { ok: false, error: 'Resend not configured' };
  }

  const greeting = opts.firstName ? `${opts.firstName},` : 'Hey,';
  const subject = `Your Download: ${describeOrder(opts.items)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
            <tr><td style="padding:32px;">

              <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;
                          color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
                // SHADOW PERSUASION //
              </div>

              <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1A1A1A;margin:0 0 18px 0;">
                ${greeting}
              </h1>

              <p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">
                Thanks for grabbing the book. Here's your download${opts.items.length > 1 ? 's' : ''}:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
                ${renderDownloadRows(opts.items)}
              </table>

              <p style="font-size:14px;line-height:1.7;margin:24px 0 14px 0;">
                A few quick notes.
              </p>

              <ul style="font-size:14px;line-height:1.7;margin:0 0 14px 20px;padding:0;">
                <li>Download the files to your laptop, not just your phone. Easier to read that way.</li>
                <li>If a link expires or breaks, reply to this email and I'll re-send.</li>
                <li>When you hit the first "this is different" moment in the book, email me back and tell me which one. I read everything.</li>
              </ul>

              <p style="font-size:14px;line-height:1.7;margin:20px 0 6px 0;">
                Talk soon,
              </p>
              <p style="font-family:'Brush Script MT',cursive;font-size:24px;color:#1A1A1A;margin:0 0 24px 0;">
                Nate Harlan
              </p>

              <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>

              <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
                Shadow Persuasion — the counterintuitive approach to influence.<br/>
                Questions? Just reply to this email.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const text =
    `${greeting}\n\nThanks for grabbing the book. Here are your download links:\n\n` +
    flattenDownloads(opts.items)
      .map((f) => `${f.name}\n${SITE_URL}${f.path}\n`)
      .join('\n') +
    `\nTalk soon,\nNate Harlan`;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error('[email] Resend error:', result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] Send failed:', msg);
    return { ok: false, error: msg };
  }
}


/* ════════════════════════════════════════════════════════════
   Cart abandonment recovery sequence (3 emails over 72 hours)

   Step 1: ~1 hour after lead captured (gentle check-in)
   Step 2: ~24 hours (value reinforcement + social proof)
   Step 3: ~72 hours (final offer / walkaway)
   ════════════════════════════════════════════════════════════ */

const RECOVERY_URL = `${SITE_URL}/checkout/book`;

function renderShell(bodyHtml: string) {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
            <tr><td style="padding:32px;">
              <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
                // SHADOW PERSUASION //
              </div>
              ${bodyHtml}
              <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
              <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
                You&#x2019;re getting this because you started a checkout at shadowpersuasion.com. If that wasn&#x2019;t you, ignore this email. We don&#x2019;t send more than three of these.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
}

function renderCtaButton(url: string, label: string) {
  return `
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:#D4A017;color:#000;text-decoration:none;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
      ${label}
    </a>`;
}

type RecoveryStep = 1 | 2 | 3;

const RECOVERY_TEMPLATES: Record<RecoveryStep, { subject: (name: string | null) => string; html: (name: string | null) => string; text: (name: string | null) => string }> = {
  1: {
    subject: () => 'You left something behind',
    html: (name) => renderShell(`
      <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
        ${name ? `${name},` : 'Hey,'}
      </h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        Looks like you started grabbing the book a bit ago and didn&#x2019;t finish. No pitch here. Just flagging it in case you lost the tab or the wifi dropped.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 18px 0;">
        If you still want it, here&#x2019;s the page:
      </p>
      <p style="margin:0 0 24px 0;">
        ${renderCtaButton(RECOVERY_URL, 'Finish My Order → $7')}
      </p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
    `),
    text: (name) =>
      `${name ? `${name},` : 'Hey,'}\n\nLooks like you started grabbing the book and didn't finish. No pitch — just in case you lost the tab.\n\nIf you still want it: ${RECOVERY_URL}\n\nNate`,
  },
  2: {
    subject: () => 'The part I should have said up front',
    html: (name) => renderShell(`
      <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
        ${name ? `${name},` : 'Hey again,'}
      </h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        Most readers finish Chapter 1 and email me the same sentence: <em>&#x201C;wait, is this actually the problem with everything I&#x2019;ve tried?&#x201D;</em>
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        Yes. It is. It&#x2019;s the Persuasion Detector, and every book you&#x2019;ve read before this one triggers it. That&#x2019;s why the Cialdini anchoring move never actually worked on your boss, and why the Voss mirroring thing felt weird when you tried it. The other person saw you running the play.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 18px 0;">
        The 47 tactics in the book work because the other person doesn&#x2019;t see them running. That&#x2019;s the whole book, in one sentence.
      </p>
      <p style="margin:0 0 24px 0;">
        ${renderCtaButton(RECOVERY_URL, 'Grab The Book → $7')}
      </p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Still here if you want it,</p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
    `),
    text: (name) =>
      `${name ? `${name},` : 'Hey again,'}\n\nMost readers finish Chapter 1 and email me the same sentence: "wait, is this actually the problem with everything I've tried?" Yes.\n\nThe 47 tactics in the book work because the other person doesn't see them running. That's the whole thing, in one sentence.\n\n${RECOVERY_URL}\n\nNate`,
  },
  3: {
    subject: () => 'Last one from me',
    html: (name) => renderShell(`
      <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
        ${name ? `${name},` : 'Hey,'}
      </h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        This is the last email I&#x2019;ll send about this. Promise.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        If the book isn&#x2019;t for you, no hard feelings. Unsubscribe link is at the bottom of this email. I won&#x2019;t send another recovery sequence.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
        If it is for you and you just haven&#x2019;t gotten around to it: the offer&#x2019;s still $7, still backed by the 30-day guarantee. Read the first chapter tonight. If you don&#x2019;t have at least one &#x201C;that&#x2019;s what was happening&#x201D; moment by the last page, email me the word &#x201C;refund.&#x201D; I send the money back and you keep the files.
      </p>
      <p style="margin:0 0 24px 0;">
        ${renderCtaButton(RECOVERY_URL, 'Last Chance · $7')}
      </p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Either way, thanks for checking us out.</p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
    `),
    text: (name) =>
      `${name ? `${name},` : 'Hey,'}\n\nThis is the last email I'll send about this.\n\nIf the book isn't for you, no hard feelings. If it is: $7, 30-day guarantee, unsubscribe anytime.\n\n${RECOVERY_URL}\n\nNate`,
  },
};

export async function sendRecoveryEmail(opts: {
  to: string;
  firstName?: string | null;
  step: RecoveryStep;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping recovery send');
    return { ok: false, error: 'Resend not configured' };
  }
  const tpl = RECOVERY_TEMPLATES[opts.step];
  if (!tpl) return { ok: false, error: 'Invalid step' };

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: tpl.subject(opts.firstName ?? null),
      html: tpl.html(opts.firstName ?? null),
      text: tpl.text(opts.firstName ?? null),
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
