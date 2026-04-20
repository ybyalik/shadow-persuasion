/**
 * GET    /api/admin/emails/unsubscribes        — list + search
 * POST   /api/admin/emails/unsubscribes        — manually unsubscribe an email
 *           body: { email, reason? }
 * DELETE /api/admin/emails/unsubscribes?email= — resubscribe (stamps resubscribed_at)
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
    const search = url.searchParams.get('search')?.trim() || '';
    const showAll = url.searchParams.get('showAll') === '1'; // include resubscribed rows

    let q = supabase
      .from('email_unsubscribes')
      .select('*')
      .order('unsubscribed_at', { ascending: false })
      .limit(500);

    if (!showAll) q = q.is('resubscribed_at', null);
    if (search) q = q.ilike('email', `%${search}%`);

    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ unsubscribes: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails/unsubscribes GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email || !/@/.test(email)) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 });
    }

    // If there's already an active unsubscribe row for this address, no-op.
    const { data: existing } = await supabase
      .from('email_unsubscribes')
      .select('id')
      .ilike('email', email)
      .is('resubscribed_at', null)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, alreadyUnsubscribed: true });
    }

    const { data, error } = await supabase
      .from('email_unsubscribes')
      .insert({
        email,
        source: 'admin',
        reason: body?.reason || 'added by admin',
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ unsubscribe: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails/unsubscribes POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Resubscribe by stamping resubscribed_at on any active row for that
 * email. We keep the row rather than deleting so we retain the audit
 * trail of when / why they unsubscribed.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'email query param required' }, { status: 400 });
    }
    const { error } = await supabase
      .from('email_unsubscribes')
      .update({ resubscribed_at: new Date().toISOString() })
      .ilike('email', email)
      .is('resubscribed_at', null);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails/unsubscribes DELETE]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
