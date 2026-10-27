/**
 * Shadow Persuasion funnel settings (book: "Shadow Persuasion: The Hidden Rules of Power").
 *
 * Lives beside the original $7 funnel (lib/pricing.ts) without touching it.
 * Pages: / (the sales page), /b/[slug], /free-chapter (after signup), /read (the free chapter, linked only from email), /checkout, /upsell, /thank-you.
 * All amounts in cents.
 *
 * The product keys (sp2_book, sp2_book_hc, sp2_scripts, sp2_upsell) stay the same so old
 * orders, Stripe metadata and the admin pages keep working. Only names and files changed.
 */

import { BOOK_EDITION, type BookEdition } from '@/lib/edition';

export const SP2_FUNNEL = 'sp2_checkout';
export const SP2_UPSELL_FUNNEL = 'sp2_upsell';

export type Sp2Slug = 'sp2_book' | 'sp2_book_hc' | 'sp2_scripts' | 'sp2_upsell';

export type Sp2Download = {
  name: string;
  /** Path inside the private Supabase bucket "paid-downloads". */
  filePath: string;
};

/*
 * Download lists follow the book edition switch (lib/edition.ts), the same switch the
 * delivery email's wording uses, so an email never mixes old wording with new files.
 *   v2 (switch off): the files current customers get today.
 *   v3 (switch on):  the new-edition files under sp2/v3/. They must be uploaded to the
 *                    "paid-downloads" bucket before launch (list in book-v3/launch-checklist.md).
 * A file that is missing is skipped when download links are made, so buyers would get an
 * email without it.
 */
const DOWNLOADS: Record<BookEdition, Record<Sp2Slug, Sp2Download[]>> = {
  v2: {
    sp2_book: [
      { name: 'Shadow Persuasion: How to Stop Being Used and Take Your Power Back (the book)', filePath: 'sp2/shadow-persuasion-v2.pdf' },
      { name: 'The 21-Day Reset Journal', filePath: 'sp2/21-day-reset-journal.pdf' },
      { name: 'Bonus: The Tactic Spotter', filePath: 'sp2/the-tactic-spotter.pdf' },
      { name: 'Bonus: The Hard Conversation Planner', filePath: 'sp2/the-hard-conversation-planner.pdf' },
      { name: 'Bonus: Stop Shrinking', filePath: 'sp2/stop-shrinking.pdf' },
    ],
    sp2_book_hc: [],
    sp2_scripts: [{ name: 'The Calm Reply Scripts', filePath: 'sp2/calm-reply-scripts.pdf' }],
    sp2_upsell: [
      { name: 'The Big Conversation Playbooks', filePath: 'sp2/the-big-conversation-playbooks.pdf' },
      { name: 'The Raise and Pay Scripts', filePath: 'sp2/the-raise-and-pay-scripts.pdf' },
    ],
  },
  v3: {
    sp2_book: [
      { name: 'Shadow Persuasion: The Hidden Rules of Power (the book)', filePath: 'sp2/v3/shadow-persuasion-hidden-rules-of-power.pdf' },
      { name: 'The 21-Day Power Reset Journal', filePath: 'sp2/v3/21-day-power-reset-journal.pdf' },
      { name: 'Bonus: The Tactic Spotter', filePath: 'sp2/v3/the-tactic-spotter.pdf' },
      { name: 'Bonus: The Conversation Planner', filePath: 'sp2/v3/the-conversation-planner.pdf' },
      { name: 'Bonus: The Power Map and Decision Cards', filePath: 'sp2/v3/the-power-map-and-decision-cards.pdf' },
      // "Stop Shrinking" is retired in the new edition.
    ],
    sp2_book_hc: [],
    sp2_scripts: [{ name: '100 Ready-to-Use Replies', filePath: 'sp2/v3/100-ready-to-use-replies.pdf' }],
    sp2_upsell: [{ name: 'The Applied Power Playbook Library', filePath: 'sp2/v3/the-applied-power-playbook-library.pdf' }],
  },
};
// The hardcover comes with the same digital files as the paperback.
DOWNLOADS.v2.sp2_book_hc = DOWNLOADS.v2.sp2_book;
DOWNLOADS.v3.sp2_book_hc = DOWNLOADS.v3.sp2_book;

/** Downloads for a product in the current edition (or a given one). */
export function sp2Downloads(slug: Sp2Slug, edition: BookEdition = BOOK_EDITION): Sp2Download[] {
  return DOWNLOADS[edition][slug];
}

export const SP2_BOOK_TITLE = 'Shadow Persuasion';
export const SP2_BOOK_SUBTITLE = 'The Hidden Rules of Power';

export const SP2_PRODUCTS: Record<Sp2Slug, { name: string; description: string; priceCents: number; downloads: Sp2Download[] }> = {
  // The printed book is the product; the digital book, journal and bonuses come free with it.
  // Printed and shipped by Lulu (lib/sp2/lulu.ts). Standard US shipping is included in the price.
  sp2_book: {
    name: 'Shadow Persuasion: The Hidden Rules of Power, Paperback Edition',
    description: 'The paperback, shipped free in the US, plus the digital edition, The 21-Day Power Reset Journal, three bonuses and 60 days of the companion app.',
    priceCents: 6700,
    downloads: sp2Downloads('sp2_book'),
  },
  sp2_book_hc: {
    name: 'Shadow Persuasion: The Hidden Rules of Power, Hardcover Edition',
    description: 'The hardcover, shipped free in the US, plus the digital edition, The 21-Day Power Reset Journal, three bonuses and 60 days of the companion app.',
    priceCents: 9700,
    downloads: sp2Downloads('sp2_book_hc'),
  },
  // $17 add-on at checkout.
  sp2_scripts: {
    name: '100 Ready-to-Use Replies',
    description: '100 everyday situations, each with three ways to word your reply, indexed by situation and by task.',
    priceCents: 1700,
    downloads: sp2Downloads('sp2_scripts'),
  },
  // One-click upsell after checkout.
  sp2_upsell: {
    name: 'The Applied Power Playbook Library',
    description: '20 playbooks in four sections (work and pay, clients and money, relationships and family, endings and transitions), each taking one situation from preparation to follow-up.',
    priceCents: 2700,
    downloads: sp2Downloads('sp2_upsell'),
  },
};

export type Sp2Format = 'paperback' | 'hardcover';

export function sp2Items(includeBump: boolean, format: Sp2Format = 'paperback'): Sp2Slug[] {
  const book: Sp2Slug = format === 'hardcover' ? 'sp2_book_hc' : 'sp2_book';
  return includeBump ? [book, 'sp2_scripts'] : [book];
}

/** Which printed format an order contains (null if none). */
export function sp2FormatOf(items: string[]): Sp2Format | null {
  if (items.includes('sp2_book_hc')) return 'hardcover';
  if (items.includes('sp2_book')) return 'paperback';
  return null;
}

export function sp2TotalCents(items: Sp2Slug[]): number {
  return items.reduce((sum, slug) => sum + SP2_PRODUCTS[slug].priceCents, 0);
}

export function sp2Describe(items: Sp2Slug[]): string {
  return items.map((s) => SP2_PRODUCTS[s].name).join(' + ');
}

/** Items that are printed and shipped. */
export const SP2_PHYSICAL: Sp2Slug[] = ['sp2_book', 'sp2_book_hc'];

export function isSp2Slug(value: string): value is Sp2Slug {
  return value in SP2_PRODUCTS;
}

/**
 * Orders and subscribers created outside production are flagged as tests so
 * they never count in the admin numbers. Local dev talks to the live database,
 * so this matters.
 */
export const SP2_IS_TEST = process.env.NODE_ENV !== 'production';

export const SP2_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowpersuasion.com';
