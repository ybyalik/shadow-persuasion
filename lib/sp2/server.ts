import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildFromAddress, buildUnsubscribeUrl, isUnsubscribed, logSend } from '@/lib/email-templates';
import { SP2_EMAILS, type Sp2Email } from './content.generated';
import { SP2_EMAILS_V3 } from './emails-v3.generated';
import { byEdition } from '@/lib/edition';
import { SP2_PRODUCTS, SP2_SITE_URL, sp2Describe, type Sp2Slug } from './config';
import { CART_RECOVERY_EMAILS } from './cart-recovery-emails';

export const sp2db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_BUCKET = 'paid-downloads';
const LINK_TTL_SECONDS = 60 * 60 * 24 * 365;

/* ───────────── Email layout ───────────── */

function wrapHtml(bodyHtml: string, preview: string, footerHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f3ee;">
<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ee;"><tr><td align="center" style="padding:28px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;"><tr><td style="padding:32px 32px 24px;font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#1c1c1c;">
${bodyHtml
  .replace(/<blockquote>/g, '<blockquote style="margin:12px 0;padding:6px 14px;border-left:3px solid #8a6d3b;background:#f6f3ee;">')
  .replace(/<a href=/g, '<a style="color:#8a6d3b;" href=')}
${footerHtml}
</td></tr></table></td></tr></table></body></html>`;
}

/**
 * Fills {{name}} placeholders. Also fills the URL-encoded form %7B%7Bname%7D%7D: the build
 * step for the older email sequence (content.generated.ts) encoded the braces inside link
 * targets, so without this the "Read Chapter 1" and "Get the full book" links went nowhere.
 */
function fillPlaceholders(s: string, vars: Record<string, string>): string {
  return s.replace(/(?:\{\{|%7B%7B)(\w+)(?:\}\}|%7D%7D)/gi, (_, k: string) => vars[k] ?? '');
}

export function sp2Links() {
  return {
    chapter_link: `${SP2_SITE_URL}/read`,
    book_link: `${SP2_SITE_URL}/?utm_source=email&utm_medium=sp2_sequence`,
  };
}

/* ───────────── Sequence emails ───────────── */

/**
 * The free-chapter sequence for the current book edition (lib/edition.ts):
 * v2 from funnel-v2/emails/free-chapter-sequence.md (content.generated.ts),
 * v3 from funnel-v2/emails/free-chapter-sequence-v3.md (emails-v3.generated.ts).
 * Both have 20 emails on the same days, so people mid-sequence at launch just
 * get the new edition's next email.
 */
const SEQUENCE: Sp2Email[] = byEdition({ v2: SP2_EMAILS, v3: SP2_EMAILS_V3 });
export const SEQUENCE_LENGTH = SEQUENCE.length;

export function getSequenceEmail(number: number): Sp2Email | undefined {
  return SEQUENCE.find((e) => e.number === number);
}

/** When the email after `afterNumber` is due, counted from the signup time. */
export function nextSendAt(signupAt: Date, afterNumber: number): Date | null {
  const next = getSequenceEmail(afterNumber + 1);
  return next ? new Date(signupAt.getTime() + next.day * DAY_MS) : null;
}

export async function sendSequenceEmail(opts: {
  to: string;
  firstName?: string | null;
  number: number;
}): Promise<{ ok: boolean; error?: string }> {
  const email = getSequenceEmail(opts.number);
  const templateKey = `sp2_email_${opts.number}`;
  if (!email) return { ok: false, error: 'no such email' };
  if (!resend) return { ok: false, error: 'Resend not configured' };

  if (await isUnsubscribed(opts.to)) {
    await logSend({ template_key: templateKey, to: opts.to, subject: email.subject, status: 'skipped', error: 'recipient unsubscribed' });
    return { ok: false, error: 'unsubscribed' };
  }

  const unsubscribeUrl = buildUnsubscribeUrl(opts.to);
  const vars = { first_name: opts.firstName?.trim() || 'there', ...sp2Links() };
  const footerHtml = `<p style="margin-top:28px;padding-top:14px;border-top:1px solid #e6e0d5;font-size:12px;line-height:1.6;color:#8a7d68;">You're getting this because you downloaded the free chapter of Shadow Persuasion. <a href="${unsubscribeUrl}" style="color:#8a7d68;">Unsubscribe</a> anytime.</p>`;
  const html = wrapHtml(fillPlaceholders(email.html, vars), email.preview, footerHtml);
  const text = `${fillPlaceholders(email.text, vars)}\n\n---\nYou're getting this because you downloaded the free chapter of Shadow Persuasion.\nUnsubscribe: ${unsubscribeUrl}`;

  try {
    const res = await resend.emails.send({
      from: buildFromAddress(),
      to: opts.to,
      subject: email.subject,
      html,
      text,
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
    });
    if (res.error) throw new Error(res.error.message);
    await logSend({ template_key: templateKey, to: opts.to, subject: email.subject, status: 'sent', provider_id: res.data?.id ?? null });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logSend({ template_key: templateKey, to: opts.to, subject: email.subject, status: 'failed', error: msg });
    return { ok: false, error: msg };
  }
}

/* ───────────── Cart-recovery reminders ───────────── */

/** Renders one reminder (1, 2 or 3) for someone who typed their email at /checkout and left. */
export function renderCartRecoveryEmail(step: number, opts: { to: string; format?: string }) {
  const email = CART_RECOVERY_EMAILS.find((e) => e.step === step);
  if (!email) return null;
  const unsubscribeUrl = buildUnsubscribeUrl(opts.to);
  const format = opts.format === 'hardcover' ? '&format=hardcover' : '';
  const vars = {
    checkout_link: `${SP2_SITE_URL}/checkout?utm_source=email&utm_medium=recovery&utm_content=step_${step}${format}`,
    chapter_link: `${SP2_SITE_URL}/read?utm_source=email&utm_medium=recovery&utm_content=step_${step}`,
  };
  const why = 'You’re getting this because you started an order at shadowpersuasion.com.';
  const footerHtml = `<p style="margin-top:28px;padding-top:14px;border-top:1px solid #e6e0d5;font-size:12px;line-height:1.6;color:#8a7d68;">${why} <a href="${unsubscribeUrl}" style="color:#8a7d68;">Unsubscribe</a> anytime.</p>`;
  return {
    subject: email.subject,
    unsubscribeUrl,
    html: wrapHtml(fillPlaceholders(email.html, vars), email.preview, footerHtml),
    text: `${fillPlaceholders(email.text, vars)}\n\n---\n${why}\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

export async function sendCartRecoveryEmail(step: number, opts: { to: string; format?: string }): Promise<{ ok: boolean; id?: string | null; error?: string }> {
  const r = renderCartRecoveryEmail(step, opts);
  const templateKey = `sp2_cart_${step}`;
  if (!r) return { ok: false, error: 'no such email' };
  if (!resend) return { ok: false, error: 'Resend not configured' };
  if (await isUnsubscribed(opts.to)) {
    await logSend({ template_key: templateKey, to: opts.to, subject: r.subject, status: 'skipped', error: 'recipient unsubscribed' });
    return { ok: false, error: 'unsubscribed' };
  }
  try {
    const res = await resend.emails.send({
      from: buildFromAddress(),
      to: opts.to,
      subject: r.subject,
      html: r.html,
      text: r.text,
      headers: { 'List-Unsubscribe': `<${r.unsubscribeUrl}>` },
    });
    if (res.error) throw new Error(res.error.message);
    await logSend({ template_key: templateKey, to: opts.to, subject: r.subject, status: 'sent', provider_id: res.data?.id ?? null });
    return { ok: true, id: res.data?.id ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logSend({ template_key: templateKey, to: opts.to, subject: r.subject, status: 'failed', error: msg });
    return { ok: false, error: msg };
  }
}

/* ───────────── Downloads + delivery ───────────── */

export async function sp2DownloadLinks(items: Sp2Slug[]): Promise<{ name: string; url: string }[]> {
  const out: { name: string; url: string }[] = [];
  for (const slug of items) {
    for (const d of SP2_PRODUCTS[slug].downloads) {
      const { data, error } = await sp2db.storage.from(PAID_BUCKET).createSignedUrl(d.filePath, LINK_TTL_SECONDS);
      if (error || !data?.signedUrl) {
        console.error('[sp2] could not sign download', d.filePath, error?.message);
        continue;
      }
      out.push({ name: d.name, url: data.signedUrl });
    }
  }
  return out;
}

/**
 * Words in the delivery email that depend on the book edition (lib/edition.ts).
 * v2 is the text current customers get today, unchanged.
 */
function deliveryCopy(appUrl: string) {
  return byEdition({
    v2: {
      upsellSubject: 'Your Big Conversations Pack',
      upsellGuidance:
        '<p>When a big conversation is coming up, find its playbook, fill in your opening line, and read the "If they push back" replies the night before.</p>',
      bookGuidance: `<p>Your book is being printed now. We'll email you a tracking link as soon as it ships. In the meantime, everything below is yours to read right away.</p>
<p>Start with Chapter 1 if you haven't read it yet, then the 3-day quick start in Chapter 6. The journal is designed to be printed, but it works on screen too.</p>
<p><b>Your 60 days of the app start now.</b> The Decoder, conversation rehearsal and the 21-day reset are ready for you: <a href="${appUrl}" style="color:#8a6d3b;font-weight:bold;">open the app and create your login</a> (use this email address).</p>`,
    },
    v3: {
      upsellSubject: 'Your Applied Power Playbook Library',
      upsellGuidance:
        "<p>When a big conversation is coming up, find its playbook in the contents. Read what is known, what is uncertain and who decides, fill in the preparation sheet, and read the branches for a yes, a partial yes and a no the night before. Each playbook ends with a short follow-up message to confirm what you agreed.</p>",
      bookGuidance: `<p>Your book is being printed now. We'll email you a tracking link as soon as it ships. In the meantime, everything below is yours to read right away.</p>
<p>Start with Chapter 1, Power Is Having a Say. When you want to practice, the 21-Day Power Reset in Part VII begins with the Three-Day Quick Start in Chapter 31. The 21-Day Power Reset Journal has a page for every day. Print it or use it on screen, and keep it somewhere private.</p>
<p>The three bonuses are for when you need them: The Tactic Spotter when something someone says feels off, The Conversation Planner before a hard conversation, and The Power Map and Decision Cards as a quick reminder of the book's eight tools.</p>
<p><b>Your 60 days of the app start now.</b> Decode a Message, conversation rehearsal and the daily Power Reset are ready for you: <a href="${appUrl}" style="color:#8a6d3b;font-weight:bold;">open the app and create your login</a> (use this email address).</p>`,
    },
  });
}

type Rendered = { subject: string; html: string; text: string };

/** Sends one rendered email through Resend and logs it under `templateKey`. */
async function deliver(templateKey: string, to: string, r: Rendered): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: false, error: 'Resend not configured' };
  try {
    const res = await resend.emails.send({ from: buildFromAddress(), to, subject: r.subject, html: r.html, text: r.text });
    if (res.error) throw new Error(res.error.message);
    await logSend({ template_key: templateKey, to, subject: r.subject, status: 'sent', provider_id: res.data?.id ?? null });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logSend({ template_key: templateKey, to, subject: r.subject, status: 'failed', error: msg });
    return { ok: false, error: msg };
  }
}

type DeliveryOpts = {
  to: string;
  items: Sp2Slug[];
  links: { name: string; url: string }[];
  /** The private order-status page (book orders only). */
  orderUrl?: string | null;
};

export function renderSp2DeliveryEmail(opts: DeliveryOpts): Rendered {
  const isUpsell = opts.items.length === 1 && opts.items[0] === 'sp2_upsell';
  const appUrl = `${SP2_SITE_URL}/login?tab=signup&email=${encodeURIComponent(opts.to)}`;
  const copy = deliveryCopy(appUrl);
  const subject = isUpsell ? copy.upsellSubject : 'Your copy of Shadow Persuasion';
  const rows = opts.links
    .map((l) => `<p style="margin:10px 0;"><a href="${l.url}" style="color:#8a6d3b;font-weight:bold;">Download: ${l.name}</a></p>`)
    .join('');
  const guidance = isUpsell ? copy.upsellGuidance : copy.bookGuidance;
  const body = `<p>Hi,</p>
<p>Thank you for getting <i>${sp2Describe(opts.items)}</i>. Here are your downloads:</p>
${rows}
${guidance}
${opts.orderUrl ? `<p>You can check your order and shipping status any time here: <a href="${opts.orderUrl}" style="color:#8a6d3b;font-weight:bold;">your order page</a>. It's private to you, so keep this email.</p>` : ''}
<p>These links stay active for a year. If you have any trouble, just reply.</p>
<p>Nate</p>`;
  const text = `Thank you for getting ${sp2Describe(opts.items)}. Your downloads:\n\n${opts.links
    .map((l) => `${l.name}: ${l.url}`)
    .join('\n')}${isUpsell ? '' : `\n\nYour 60 days of the app start now. Create your login (use this email address): ${appUrl}`}${opts.orderUrl ? `\n\nYour order and shipping status: ${opts.orderUrl}` : ''}\n\nNate`;
  return { subject, html: wrapHtml(body, 'Your downloads are inside.', ''), text };
}

export function sendSp2DeliveryEmail(opts: DeliveryOpts) {
  return deliver('sp2_delivery', opts.to, renderSp2DeliveryEmail(opts));
}

type ShippedOpts = { to: string; name?: string | null; trackingUrl?: string | null; carrier?: string | null; orderUrl?: string | null };

/** "Your book is on its way" with the tracking link. */
export function renderSp2ShippedEmail(opts: ShippedOpts): Rendered {
  const subject = 'Your copy of Shadow Persuasion is on its way';
  const first = opts.name?.trim().split(/\s+/)[0] || 'there';
  const track = opts.trackingUrl
    ? `<p><a href="${opts.trackingUrl}" style="color:#8a6d3b;font-weight:bold;">Track your package${opts.carrier ? ` (${opts.carrier})` : ''}</a></p>`
    : '<p>Tracking details will follow from the carrier.</p>';
  const body = `<p>Hi ${first},</p>
<p>Your copy of <i>Shadow Persuasion</i> has been printed and shipped.</p>
${track}
${opts.orderUrl ? `<p>Your order page has the same details: <a href="${opts.orderUrl}" style="color:#8a6d3b;">view your order</a>.</p>` : ''}
<p>While you wait, your digital copy, the journal and the bonuses are all in your earlier download email.</p>
<p>Nate</p>`;
  const text = `Hi ${first},\n\nYour copy of Shadow Persuasion has been printed and shipped.\n${opts.trackingUrl ? `Track it here: ${opts.trackingUrl}\n` : ''}${opts.orderUrl ? `Your order page: ${opts.orderUrl}\n` : ''}\nNate`;
  return { subject, html: wrapHtml(body, 'Your book has shipped.', ''), text };
}

export function sendSp2ShippedEmail(opts: ShippedOpts) {
  return deliver('sp2_shipped', opts.to, renderSp2ShippedEmail(opts));
}

type OrderLinksOpts = { to: string; orders: { date: string; description: string; url: string }[] };

/** "Here are your order links": sent when someone looks up their order by email on /order. */
export function renderOrderLinksEmail(opts: OrderLinksOpts): Rendered {
  const subject = 'Your Shadow Persuasion order';
  const rows = opts.orders
    .map((o) => `<p style="margin:10px 0;"><a href="${o.url}" style="color:#8a6d3b;font-weight:bold;">View your order from ${o.date}</a><br><span style="color:#6b6257;font-size:14px;">${o.description}</span></p>`)
    .join('');
  const body = `<p>Hi,</p>
<p>Someone (hopefully you) asked for the order page for this email address. Here ${opts.orders.length > 1 ? 'are your orders' : 'is your order'}:</p>
${rows}
<p>Each page shows where your book is and its tracking, and lets you get your download links again. They're private to you.</p>
<p>If you didn't ask for this, you can ignore it.</p>
<p>Nate</p>`;
  const text = `Your order page${opts.orders.length > 1 ? 's' : ''}:\n\n${opts.orders.map((o) => `${o.date}: ${o.url}`).join('\n')}\n\nIf you didn't ask for this, you can ignore it.\n\nNate`;
  return { subject, html: wrapHtml(body, 'Your order page link.', ''), text };
}

export function sendOrderLinksEmail(opts: OrderLinksOpts) {
  return deliver('sp2_order_links', opts.to, renderOrderLinksEmail(opts));
}

type AppReminderOpts = { to: string; daysLeft: number; endsOn: string };

/** "Your app access ends in N days" with the opt-in link to keep it. */
export function renderAppAccessReminder(opts: AppReminderOpts): Rendered {
  const soon = opts.daysLeft <= 2;
  const subject = soon ? 'Your Shadow Persuasion app access ends in 2 days' : 'Ten days left on your Shadow Persuasion app';
  const keepUrl = `${SP2_SITE_URL}/app/keep`;
  const body = `<p>Hi,</p>
<p>The 60 days of the app that came with your book end on <b>${opts.endsOn}</b>.</p>
<p>${byEdition({ v2: 'If the Decoder, the rehearsals or the daily reset have been useful', v3: 'If Decode a Message, the rehearsals or the daily Power Reset have been useful' })}, you can keep everything for $9.99 a month, and cancel anytime. Nothing happens automatically: if you do nothing, your access simply ends and your history stays saved.</p>
<p><a href="${keepUrl}" style="color:#8a6d3b;font-weight:bold;">Keep the app</a></p>
<p>Either way, the book and everything you downloaded are yours to keep.</p>
<p>Nate</p>`;
  const text = `Hi,\n\nThe 60 days of the app that came with your book end on ${opts.endsOn}.\n\nTo keep it for $9.99 a month (cancel anytime): ${keepUrl}\nIf you do nothing, your access simply ends and your history stays saved.\n\nNate`;
  return { subject, html: wrapHtml(body, subject, ''), text };
}

export function sendAppAccessReminder(opts: AppReminderOpts) {
  return deliver(opts.daysLeft <= 2 ? 'app_access_2d' : 'app_access_10d', opts.to, renderAppAccessReminder(opts));
}

/** Free-chapter email `number` exactly as subscribers get it (admin preview). */
export function renderSequenceEmail(number: number, to = 'reader@example.com'): Rendered | null {
  const email = getSequenceEmail(number);
  if (!email) return null;
  const vars = { first_name: 'there', ...sp2Links() };
  const footer = `<p style="margin-top:28px;padding-top:14px;border-top:1px solid #e6e0d5;font-size:12px;line-height:1.6;color:#8a7d68;">You're getting this because you downloaded the free chapter of Shadow Persuasion. <a href="${buildUnsubscribeUrl(to)}" style="color:#8a7d68;">Unsubscribe</a> anytime.</p>`;
  return { subject: email.subject, html: wrapHtml(fillPlaceholders(email.html, vars), email.preview, footer), text: fillPlaceholders(email.text, vars) };
}
