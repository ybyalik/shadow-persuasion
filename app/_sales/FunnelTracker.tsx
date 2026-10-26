'use client';

/**
 * Mounted once in the funnel layouts (the homepage and the checkout steps, and /b/[slug]).
 * Saves the landing page and UTM tags for this visit, then sends a pixel PageView on every
 * route change. Renders nothing. The pixel part is dormant unless NEXT_PUBLIC_META_PIXEL_ID is set.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureUtms } from '@/lib/utm';
import { captureLanding } from '@/lib/variant';
import { trackPixel } from '@/lib/metaPixel';

export function FunnelTracker() {
  const pathname = usePathname();
  // Runs before the PageView effect below, so the first event already knows the variant.
  useEffect(() => {
    captureUtms();
    captureLanding();
  }, []);
  useEffect(() => {
    trackPixel('PageView');
  }, [pathname]);
  return null;
}
