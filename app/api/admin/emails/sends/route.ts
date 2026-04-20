/**
 * GET /api/admin/emails/sends
 *
 * Filterable log of every email we've sent. Backs the admin sends
 * dashboard at /app/admin/emails/sends.
 *
 * Query params (all optional):
 *   template — filter by template_key (or 'all')
 *   status   — 'sent' | 'failed' | 'skipped' | 'all'
 *   search   — substring match on to_email
 *   from, to — ISO date boundaries
 *   limit    — max 500, default 200
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const template = url.searchParams.get('template') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search')?.trim() || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 200), 500);

    let q = supabase
      .from('email_sends')
      .select('id, template_key, to_email, subject, status, provider_id, error, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (template !== 'all') q = q.eq('template_key', template);
    if (status !== 'all') q = q.eq('status', status);
    if (search) q = q.ilike('to_email', `%${search}%`);
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lte('created_at', to);

    const { data: sends, error } = await q;
    if (error) throw error;

    // Aggregate stats for last 24h / 7d — cheap enough at our scale
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: sent24h } = await supabase
      .from('email_sends')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('created_at', dayAgo);
    const { count: failed24h } = await supabase
      .from('email_sends')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', dayAgo);
    const { count: sent7d } = await supabase
      .from('email_sends')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('created_at', weekAgo);
    const { count: failed7d } = await supabase
      .from('email_sends')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', weekAgo);

    // Distinct template keys for the filter dropdown
    const { data: templates } = await supabase
      .from('email_templates')
      .select('key, name')
      .order('name');

    return NextResponse.json({
      sends: sends ?? [],
      templates: templates ?? [],
      stats: {
        sent24h: sent24h ?? 0,
        failed24h: failed24h ?? 0,
        sent7d: sent7d ?? 0,
        failed7d: failed7d ?? 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails/sends]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
