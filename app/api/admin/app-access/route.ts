/**
 * Admin: book buyers' app access and what the AI costs per person.
 * GET  -> { rows: [{ email, source, access_until, is_test, user_id, cost30d, costAll, calls30d }], totals }
 * POST { email, days } -> extends that person's access by `days` from today or their current end, whichever is later.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-api';
import { grantAccess } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const includeTest = new URL(req.url).searchParams.get('includeTest') === '1';
    let q = db.from('app_access').select('email, source, access_until, is_test, user_id, created_at').order('created_at', { ascending: false }).limit(1000);
    if (!includeTest) q = q.eq('is_test', false);
    const { data: rows, error } = await q;
    if (error) throw error;

    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data: usage } = await db.from('ai_usage').select('user_id, feature, cost_usd, created_at').limit(50000);
    const per = new Map<string, { all: number; d30: number; calls30: number }>();
    const byFeature = new Map<string, number>();
    for (const u of usage ?? []) {
      const p = per.get(u.user_id) ?? { all: 0, d30: 0, calls30: 0 };
      const c = Number(u.cost_usd || 0);
      p.all += c;
      if (u.created_at >= since) {
        p.d30 += c;
        p.calls30 += 1;
        const f = String(u.feature).split(':')[0];
        byFeature.set(f, (byFeature.get(f) ?? 0) + c);
      }
      per.set(u.user_id, p);
    }
    const out = (rows ?? []).map((r) => {
      const p = (r.user_id && per.get(r.user_id)) || { all: 0, d30: 0, calls30: 0 };
      return { ...r, costAll: p.all, cost30d: p.d30, calls30d: p.calls30 };
    });
    const total30 = [...per.values()].reduce((s, p) => s + p.d30, 0);
    return NextResponse.json({
      rows: out,
      totals: { cost30d: total30, byFeature30d: Object.fromEntries([...byFeature.entries()].sort((a, b) => b[1] - a[1])) },
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Could not load app access.', 500, '[admin/app-access]', err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const { email, days } = await req.json();
    const n = Math.min(365, Math.max(1, Number(days) || 30));
    if (!email || typeof email !== 'string') return apiError('Email is required.', 400);
    const { data: row } = await db.from('app_access').select('access_until').ilike('email', email).maybeSingle();
    const base = row && new Date(row.access_until) > new Date() ? new Date(row.access_until) : new Date();
    await grantAccess({ email, days: n, source: 'admin', from: base });
    return NextResponse.json({ success: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Could not extend access.', 500, '[admin/app-access]', err);
  }
}
