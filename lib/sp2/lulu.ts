/**
 * Lulu Print API client for the v2 paperback.
 *
 * Env: LULU_CLIENT_KEY, LULU_CLIENT_SECRET (from the Lulu developer portal),
 *      LULU_API_BASE (default https://api.lulu.com; https://api.sandbox.lulu.com for the test site),
 *      LULU_ORDERS_ENABLED=true to actually send print jobs (otherwise orders are saved as dry runs),
 *      LULU_CONTACT_EMAIL (Lulu's contact for order problems; defaults to RESEND_FROM).
 *
 * Lulu's firewall rejects some default HTTP clients, so every request sends its own User-Agent.
 */

import crypto from 'crypto';

const BASE = process.env.LULU_API_BASE || 'https://api.lulu.com';
const UA = 'ShadowPersuasion/1.0';

/** 6x9, black & white standard, 60# cream, matte. Paperback = perfect bound; hardcover = casewrap. */
export const LULU_FORMATS = {
  paperback: { podPackageId: '0600X0900.BW.STD.PB.060UC444.MXX', coverPath: 'sp2/print/cover.pdf' },
  hardcover: { podPackageId: '0600X0900.BW.STD.CW.060UC444.MXX', coverPath: 'sp2/print/cover-hardcover.pdf' },
} as const;
export type BookFormat = keyof typeof LULU_FORMATS;
export const isBookFormat = (v: unknown): v is BookFormat => v === 'paperback' || v === 'hardcover';
export const LULU_POD_PACKAGE_ID = LULU_FORMATS.paperback.podPackageId;
export const LULU_PAGE_COUNT = 346;

/** The shipping speeds offered at checkout (US only). */
export const LULU_SHIPPING_LEVELS = [
  { level: 'MAIL', label: 'Standard mail', estimate: '12 to 15 business days' },
  { level: 'PRIORITY_MAIL', label: 'Priority', estimate: '10 to 13 business days' },
  { level: 'EXPRESS', label: 'Express', estimate: '6 to 9 business days' },
] as const;
export type LuluShippingLevel = (typeof LULU_SHIPPING_LEVELS)[number]['level'];
export const isLuluShippingLevel = (v: string): v is LuluShippingLevel => LULU_SHIPPING_LEVELS.some((s) => s.level === v);

export type LuluAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state_code: string;
  postcode: string;
  country_code: 'US';
  phone_number: string;
};

export const ordersEnabled = () => process.env.LULU_ORDERS_ENABLED === 'true';

/* ───────────── Auth ───────────── */

let cached: { token: string; expiresAt: number } | null = null;

async function token(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
  const key = process.env.LULU_CLIENT_KEY;
  const secret = process.env.LULU_CLIENT_SECRET;
  if (!key || !secret) throw new Error('Lulu API keys are not configured');
  const res = await fetch(`${BASE}/auth/realms/glasstree/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Lulu auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function lulu<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${await token()}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Lulu ${init.method || 'GET'} ${path} failed (${res.status}): ${text.slice(0, 500)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

/* ───────────── Quotes ───────────── */

type CostCalc = {
  shipping_cost: { total_cost_excl_tax: string };
  total_cost_excl_tax: string;
  total_cost_incl_tax: string;
  warnings?: unknown;
};

/** Shipping price (in cents, before tax) Lulu charges for one book to this address at this speed. */
export async function quoteShippingCents(address: LuluAddress, level: LuluShippingLevel, format: BookFormat = 'paperback', quantity = 1): Promise<number> {
  const calc = await lulu<CostCalc>('/print-job-cost-calculations/', {
    method: 'POST',
    body: {
      line_items: [{ page_count: LULU_PAGE_COUNT, pod_package_id: LULU_FORMATS[format].podPackageId, quantity }],
      shipping_address: address,
      shipping_option: level,
    },
  });
  return Math.round(parseFloat(calc.shipping_cost.total_cost_excl_tax) * 100);
}

/**
 * What the customer pays for shipping, in cents. Standard mail is free (it is
 * built into the book price); faster speeds cost only the difference.
 */
export async function chargedShippingCents(address: LuluAddress, level: LuluShippingLevel, format: BookFormat = 'paperback'): Promise<number> {
  if (level === 'MAIL') return 0;
  const [mail, chosen] = await Promise.all([quoteShippingCents(address, 'MAIL', format), quoteShippingCents(address, level, format)]);
  return Math.max(0, chosen - mail);
}

/* ───────────── Print jobs ───────────── */

export type LuluPrintJob = {
  id: number;
  status: { name: string; message?: string };
  costs?: unknown;
  line_items?: { tracking_id?: string | null; tracking_urls?: string[] | null; carrier_name?: string | null; printable_id?: string }[];
};

export async function createPrintJob(opts: {
  externalId: string;
  address: LuluAddress;
  level: LuluShippingLevel;
  interiorUrl: string;
  coverUrl: string;
  format?: BookFormat;
  quantity?: number;
}): Promise<LuluPrintJob> {
  return lulu<LuluPrintJob>('/print-jobs/', {
    method: 'POST',
    body: {
      external_id: opts.externalId,
      contact_email: process.env.LULU_CONTACT_EMAIL || 'contact@shadowpersuasion.com',
      shipping_level: opts.level,
      shipping_address: opts.address,
      production_delay: 60, // minutes during which the job can still be canceled
      line_items: [
        {
          external_id: opts.externalId,
          title: 'Shadow Persuasion',
          quantity: opts.quantity ?? 1,
          printable_normalization: {
            pod_package_id: LULU_FORMATS[opts.format ?? 'paperback'].podPackageId,
            interior: { source_url: opts.interiorUrl },
            cover: { source_url: opts.coverUrl },
          },
        },
      ],
    },
  });
}

export const getPrintJob = (id: number) => lulu<LuluPrintJob>(`/print-jobs/${id}/`);

/** Tracking details from a job (the first line item that has them). */
export function trackingOf(job: LuluPrintJob) {
  const li = (job.line_items || []).find((l) => l.tracking_id || (l.tracking_urls && l.tracking_urls.length));
  return {
    tracking_id: li?.tracking_id ?? null,
    tracking_urls: li?.tracking_urls ?? null,
    carrier_name: li?.carrier_name ?? null,
  };
}

/* ───────────── Webhooks ───────────── */

/**
 * Lulu signs each webhook body with HMAC-SHA256 using our API secret. The docs don't say
 * whether the header is hex or base64, so accept either. Must be checked against the raw body.
 */
export function verifyLuluSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.LULU_CLIENT_SECRET;
  if (!secret || !header) return false;
  const mac = crypto.createHmac('sha256', Buffer.from(secret, 'utf8')).update(Buffer.from(rawBody, 'utf8')).digest();
  const given = header.trim();
  for (const expected of [mac.toString('hex'), mac.toString('base64')]) {
    const a = Buffer.from(expected);
    const b = Buffer.from(given);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}

/* ───────────── Address checks ───────────── */

const US_STATES = new Set(
  'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR'.split(' ')
);

/** Validates and normalizes a US address to Lulu's limits. Returns an error message for the customer, or the address. */
export function normalizeUsAddress(input: Record<string, unknown>): { ok: true; address: LuluAddress } | { ok: false; error: string } {
  const s = (k: string) => String(input?.[k] ?? '').trim();
  const address: LuluAddress = {
    name: s('name'),
    street1: s('street1'),
    street2: s('street2') || undefined,
    city: s('city'),
    state_code: s('state_code').toUpperCase(),
    postcode: s('postcode'),
    country_code: 'US',
    phone_number: s('phone_number'),
  };
  if (!address.name || address.name.length > 35) return { ok: false, error: 'Please enter your full name (up to 35 characters).' };
  if (!address.street1 || address.street1.length > 30) return { ok: false, error: 'Please enter your street address (up to 30 characters per line).' };
  if (address.street2 && address.street2.length > 30) return { ok: false, error: 'The second address line can be up to 30 characters.' };
  if (!address.city || address.city.length > 30) return { ok: false, error: 'Please enter your city.' };
  if (!US_STATES.has(address.state_code)) return { ok: false, error: 'Please choose your state.' };
  if (!/^\d{5}(-\d{4})?$/.test(address.postcode)) return { ok: false, error: 'Please enter a valid ZIP code.' };
  if (!/^\+?[\d\s\-.\/()]{8,20}$/.test(address.phone_number)) return { ok: false, error: 'Please enter a phone number. The courier may need it for delivery.' };
  return { ok: true, address };
}
