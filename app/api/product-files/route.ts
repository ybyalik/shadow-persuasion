/**
 * GET /api/product-files?items=book,briefing&pi=<payment_intent_id>
 *
 * Returns the download file list for a buyer's thank-you page. The caller
 * must pass the PaymentIntent id (`pi`) from their purchase. We only return
 * files for products that actually appear on a real order tied to that PI,
 * so a non-buyer can no longer enumerate every product's download links by
 * calling this endpoint with a guessed items list.
 *
 * NOTE: the returned URLs are still public URLs. To fully protect paid files
 * they should be moved to a PRIVATE Supabase Storage bucket and served as
 * short-lived signed URLs. That is a storage-config change tracked separately.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchProductFiles, type ProductSlug } from '@/lib/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED: ProductSlug[] = ['book', 'briefing', 'playbooks', 'vault'];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get('items') || '';
    const pi = (url.searchParams.get('pi') || '').trim();

    const requested = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is ProductSlug => ALLOWED.includes(s as ProductSlug));

    if (requested.length === 0 || !pi) {
      return NextResponse.json({ files: [] });
    }

    // Collect the items actually purchased under this PaymentIntent: the
    // primary order plus any upsell orders whose metadata.original_pi points
    // at it. Possession of a valid order PI is what authorizes the download.
    const purchased = new Set<string>();
    const { data: primary } = await supabase
      .from('orders')
      .select('items')
      .eq('stripe_payment_intent_id', pi)
      .maybeSingle();
    for (const it of (primary?.items as string[] | undefined) ?? []) purchased.add(it);

    const { data: related } = await supabase
      .from('orders')
      .select('items, status')
      .contains('metadata', { original_pi: pi });
    for (const row of related ?? []) {
      if (row.status === 'paid') {
        for (const it of (row.items as string[] | undefined) ?? []) purchased.add(it);
      }
    }

    // Only serve files for products this buyer actually paid for.
    const allowed = requested.filter((s) => purchased.has(s));
    if (allowed.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const files = await fetchProductFiles(allowed);
    return NextResponse.json({ files });
  } catch (err) {
    console.error('[product-files GET]', err);
    return NextResponse.json(
      { error: 'Could not load your files. Please refresh.' },
      { status: 500 }
    );
  }
}
