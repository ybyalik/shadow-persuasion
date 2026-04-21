/**
 * GET /api/product-covers
 *
 * Returns the active cover image URL for every product in a flat
 * dictionary: { book: 'https://...', briefing: 'https://...', ... }
 *
 * Consumed by the <ProductCover> React component. Public endpoint
 * (same reasoning as /api/product-files — the URLs are public
 * anyway, and every LP page needs to render these).
 *
 * Cached for 60s at the edge so every LP page visit doesn't hit
 * the DB; a new cover upload takes up to 60s to propagate, which
 * is fine.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('product_files')
      .select('product_slug, storage_url, sort_order')
      .eq('file_type', 'cover')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;

    const covers: Record<string, string> = {};
    for (const row of data ?? []) {
      // First match wins (lowest sort_order). Mirrors the
      // "only one active cover at a time" invariant the upload
      // endpoint enforces, but defensively respects sort_order
      // in case the DB ends up with duplicates.
      if (!covers[row.product_slug]) {
        covers[row.product_slug] = row.storage_url;
      }
    }

    return NextResponse.json(
      { covers },
      {
        headers: {
          // 60s public CDN cache so LP traffic doesn't hit the DB
          // on every page view; immediate admin updates still work
          // because the admin UI doesn't cache this endpoint.
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[product-covers GET]', msg);
    return NextResponse.json({ error: msg, covers: {} }, { status: 500 });
  }
}
