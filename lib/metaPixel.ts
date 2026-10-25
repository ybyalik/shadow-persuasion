/**
 * Meta (Facebook) pixel, dormant until NEXT_PUBLIC_META_PIXEL_ID is set (in Vercel, then redeploy).
 * With no ID every function here does nothing and no Meta script is loaded.
 *
 * Events: PageView on funnel pages (FunnelTracker), InitiateCheckout on /v2/checkout,
 * Purchase (value + currency) on /v2/thank-you. Each event carries the landing variant
 * (lib/variant.ts) as a custom parameter, so ads can be compared by page.
 */

import { currentVariant } from './variant';

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/** Loads the pixel once (Meta's standard snippet, written out). Returns false when the pixel is off. */
function ensurePixel(): boolean {
  if (!META_PIXEL_ID || typeof window === 'undefined') return false;
  if (window.fbq) return true;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  // We send PageView ourselves on each route change; stop the pixel adding its own on history changes.
  fbq.disablePushState = true;
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  fbq('init', META_PIXEL_ID);
  return true;
}

/** Send a standard pixel event with the variant added. eventID lets Meta drop duplicates. */
export function trackPixel(event: 'PageView' | 'InitiateCheckout' | 'Purchase', params: Record<string, unknown> = {}, eventID?: string): void {
  try {
    if (!ensurePixel() || !window.fbq) return;
    const data = { ...params, variant: currentVariant() };
    if (eventID) window.fbq('track', event, data, { eventID });
    else window.fbq('track', event, data);
  } catch {
    // Tracking must never break the page.
  }
}
