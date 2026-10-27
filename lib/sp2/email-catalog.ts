/**
 * Every email the current site sends, for the admin Emails page (/app/admin/emails): what it is,
 * when it goes out, its send-log key, and a preview built by the same code that sends it.
 */

import { CART_RECOVERY_EMAILS } from './cart-recovery-emails';
import {
  SEQUENCE_LENGTH,
  getSequenceEmail,
  renderAppAccessReminder,
  renderCartRecoveryEmail,
  renderOrderLinksEmail,
  renderSequenceEmail,
  renderSp2DeliveryEmail,
  renderSp2ShippedEmail,
} from './server';
import { SP2_SITE_URL } from './config';

export type CatalogEntry = { key: string; group: string; name: string; when: string; subject: string };

const SAMPLE_TO = 'reader@example.com';
const SAMPLE_ORDER = `${SP2_SITE_URL}/order/pi_sample.preview`;
const SAMPLE_LINKS = [
  { name: 'Shadow Persuasion: The Hidden Rules of Power (digital edition)', url: '#' },
  { name: 'The 21-Day Power Reset Journal', url: '#' },
  { name: 'The Tactic Spotter', url: '#' },
];

function previews() {
  const list: (CatalogEntry & { render: () => { subject: string; html: string } | null })[] = [];
  list.push({
    key: 'sp2_delivery', group: 'After purchase', name: 'Downloads (book order)', when: 'Right after a book is paid for',
    subject: '', render: () => renderSp2DeliveryEmail({ to: SAMPLE_TO, items: ['sp2_book', 'sp2_scripts'], links: SAMPLE_LINKS, orderUrl: SAMPLE_ORDER }),
  });
  list.push({
    key: 'sp2_delivery_upsell', group: 'After purchase', name: 'Downloads (Playbook Library add-on)', when: 'Right after the $27 add-on is paid for',
    subject: '', render: () => renderSp2DeliveryEmail({ to: SAMPLE_TO, items: ['sp2_upsell'], links: [{ name: 'The Applied Power Playbook Library', url: '#' }] }),
  });
  list.push({
    key: 'sp2_shipped', group: 'After purchase', name: 'Book shipped, with tracking', when: 'When Lulu marks the book shipped',
    subject: '', render: () => renderSp2ShippedEmail({ to: SAMPLE_TO, name: 'Alex Reader', trackingUrl: '#', carrier: 'USPS', orderUrl: SAMPLE_ORDER }),
  });
  list.push({
    key: 'sp2_order_links', group: 'After purchase', name: 'Order page link (find my order)', when: 'When someone asks on /order',
    subject: '', render: () => renderOrderLinksEmail({ to: SAMPLE_TO, orders: [{ date: 'October 27, 2026', description: 'Shadow Persuasion, paperback', url: SAMPLE_ORDER }] }),
  });
  list.push({
    key: 'app_access_10d', group: 'App', name: 'App access: 10 days left', when: '10 days before the 60 days end',
    subject: '', render: () => renderAppAccessReminder({ to: SAMPLE_TO, daysLeft: 10, endsOn: 'December 26, 2026' }),
  });
  list.push({
    key: 'app_access_2d', group: 'App', name: 'App access: 2 days left', when: '2 days before the 60 days end',
    subject: '', render: () => renderAppAccessReminder({ to: SAMPLE_TO, daysLeft: 2, endsOn: 'December 26, 2026' }),
  });
  for (const e of CART_RECOVERY_EMAILS) {
    list.push({
      key: `sp2_cart_${e.step}`, group: 'Checkout reminders', name: `Reminder ${e.step}`, when: `${e.afterHours === 1 ? '1 hour' : e.afterHours === 24 ? '1 day' : '3 days'} after they typed their email, if they haven't bought`,
      subject: '', render: () => renderCartRecoveryEmail(e.step, { to: SAMPLE_TO }),
    });
  }
  for (let n = 1; n <= SEQUENCE_LENGTH; n++) {
    const e = getSequenceEmail(n);
    list.push({
      key: `sp2_email_${n}`, group: 'Free chapter series', name: `Email ${n}`, when: e?.day === 0 ? 'Right after signup' : `Day ${e?.day} after signup`,
      subject: '', render: () => renderSequenceEmail(n, SAMPLE_TO),
    });
  }
  return list;
}

export function emailCatalog(): CatalogEntry[] {
  return previews().map(({ render, ...entry }) => ({ ...entry, subject: render()?.subject ?? '' }));
}

export function emailPreview(key: string) {
  return previews().find((e) => e.key === key)?.render() ?? null;
}
