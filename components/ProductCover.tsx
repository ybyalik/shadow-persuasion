'use client';

/**
 * Renders the current cover image for a product slug, with a
 * CSS-mockup fallback for when no image has been uploaded yet.
 *
 * Data loading: /api/product-covers returns every product's
 * cover in one call. We cache the result module-wide so the
 * second+ <ProductCover> on a page doesn't refetch.
 *
 * Usage:
 *   <ProductCover
 *     slug="book"
 *     alt="Shadow Persuasion book cover"
 *     className="w-72 h-96 rounded-lg shadow-xl"
 *     fallback={<OriginalCssMockup />}
 *   />
 *
 * The fallback is rendered whenever:
 *   - the fetch is still in flight
 *   - the fetch failed
 *   - no cover has been uploaded for this slug yet
 * so the page never shows a broken image state.
 */

import { useEffect, useState, type ReactNode } from 'react';

type CoversMap = Record<string, string | null | undefined>;

// Module-level cache so all <ProductCover>s on the same page share one fetch.
let cachedCovers: CoversMap | null = null;
let coversPromise: Promise<CoversMap> | null = null;

function ensureLoaded(): Promise<CoversMap> {
  if (cachedCovers) return Promise.resolve(cachedCovers);
  if (!coversPromise) {
    coversPromise = fetch('/api/product-covers')
      .then((r) => r.json())
      .then((d) => {
        cachedCovers = (d.covers as CoversMap) || {};
        return cachedCovers;
      })
      .catch(() => {
        cachedCovers = {};
        return cachedCovers;
      });
  }
  return coversPromise;
}

interface Props {
  slug: string;
  alt: string;
  /**
   * Tailwind / inline styles for the outer wrapper. Both the
   * uploaded image AND the fallback element should be styled to
   * fill this container so the layout doesn't shift when the
   * image replaces the fallback.
   */
  className?: string;
  /**
   * Rendered when no cover exists for this slug (or while the
   * cover is being fetched). Typically the original CSS mockup
   * so the page looks fine during both states.
   */
  fallback: ReactNode;
  /**
   * Optional object-fit value. 'cover' crops, 'contain' fits.
   * Defaults to 'contain' because product covers usually want
   * their whole face visible.
   */
  fit?: 'cover' | 'contain';
}

export function ProductCover({ slug, alt, className, fallback, fit = 'contain' }: Props) {
  const [covers, setCovers] = useState<CoversMap | null>(cachedCovers);

  useEffect(() => {
    if (covers) return;
    let cancelled = false;
    ensureLoaded().then((c) => {
      if (!cancelled) setCovers(c);
    });
    return () => {
      cancelled = true;
    };
  }, [covers]);

  const url = covers?.[slug];

  if (!url) return <>{fallback}</>;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{ objectFit: fit, width: '100%', height: '100%' }}
    />
  );
}
