/**
 * Variant tracking: which sales page a buyer first landed on (e.g. "v3", "a/parent").
 *
 * On the first funnel page of a browser tab, the landing path and any UTM tags are saved to
 * sessionStorage (first touch: later pages never overwrite it). The checkout page sends this
 * with the checkout request; the server stores it on the Stripe PaymentIntent metadata and in
 * the order's `metadata` column. The Meta pixel adds the variant to every event it sends.
 *
 * sessionStorage, like lib/utm.ts: it belongs to this visit and clears when the tab closes.
 */

import { getUtms, type Utms } from './utm';

const KEY = 'sp_landing';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type Landing = { variant: string; utms: Utms; landedAt: string };

/** What the checkout request carries. Every field is optional and checked again on the server. */
export type Attribution = Partial<Record<'variant' | (typeof UTM_KEYS)[number], string>>;

/** "/a/parent/" becomes "a/parent", "/" becomes "home". Only letters, digits, "/", "-" and "_" survive. */
export function variantFromPath(pathname: string): string {
  const clean = pathname
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9/_-]/g, '')
    .slice(0, 60);
  return clean || 'home';
}

/** Save the landing page once per tab. Call on every funnel page; only the first call counts. */
export function captureLanding(): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utms: Utms = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) utms[k] = v.slice(0, 200);
    }
    const landing: Landing = { variant: variantFromPath(window.location.pathname), utms, landedAt: new Date().toISOString() };
    sessionStorage.setItem(KEY, JSON.stringify(landing));
  } catch {
    // sessionStorage can be blocked (private mode); tracking is optional, so carry on.
  }
}

export function getLanding(): Landing | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Landing) : null;
  } catch {
    return null;
  }
}

/** The variant for this visit: the saved landing page, or the current page if nothing was saved. */
export function currentVariant(): string {
  if (typeof window === 'undefined') return '';
  return getLanding()?.variant ?? variantFromPath(window.location.pathname);
}

/** Variant plus UTM tags for the checkout request. UTMs: the latest ones seen (lib/utm.ts), else those from landing. */
export function getAttribution(): Attribution {
  const landing = getLanding();
  const utms: Utms = { ...(landing?.utms ?? {}), ...getUtms() };
  const out: Attribution = {};
  const variant = landing?.variant;
  if (variant) out.variant = variant;
  for (const k of UTM_KEYS) if (utms[k]) out[k] = utms[k];
  return out;
}

/**
 * Server side: keep only known keys with short, plain values (Stripe metadata values must be
 * strings under 500 characters). Anything unexpected is dropped, never an error.
 */
export function sanitizeAttribution(input: unknown): Attribution {
  const out: Attribution = {};
  if (!input || typeof input !== 'object') return out;
  const src = input as Record<string, unknown>;
  if (typeof src.variant === 'string') {
    const v = variantFromPath(src.variant);
    if (v) out.variant = v;
  }
  for (const k of UTM_KEYS) {
    const v = src[k];
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return out;
}
