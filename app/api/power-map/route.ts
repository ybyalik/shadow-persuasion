import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';

/**
 * Saved Power Maps (the Power Map builder, /app/power-map).
 * GET    /api/power-map          -> { maps: [...], available: boolean }  (newest first, max 30)
 * POST   /api/power-map          { id?, decision, map } -> { map }        (id updates an existing map)
 * DELETE /api/power-map?id=<id>  -> { ok: true }
 *
 * Uses the power_maps table (supabase/migrations/034_power_maps.sql). Until that
 * migration is applied, GET answers { maps: [], available: false } and saving
 * answers a friendly 503, so the page keeps working (fill in and print).
 */

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLS = 'id, decision, map, created_at, updated_at';
const NOT_YET = "Saving maps isn't switched on yet. You can still fill this in and print it.";

/** True when the table hasn't been created yet. */
function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /power_maps/.test(error.message || '');
}

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const { data, error } = await db.from('power_maps').select(COLS).eq('user_id', uid).order('updated_at', { ascending: false }).limit(30);
    if (missingTable(error)) return NextResponse.json({ maps: [], available: false });
    if (error) return apiError("Couldn't load your saved maps.", 500, '[power-map:get]', error);
    return NextResponse.json({ maps: data ?? [], available: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't load your saved maps.", 500, '[power-map:get]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const decision = String(body?.decision ?? '').trim().slice(0, 500);
    const map = body?.map;
    if (!decision || !map || typeof map !== 'object' || JSON.stringify(map).length > 30000) {
      return NextResponse.json({ error: 'Name the decision first, then save.' }, { status: 400 });
    }
    const id = typeof body?.id === 'string' && UUID.test(body.id) ? body.id : null;
    const now = new Date().toISOString();
    const q = id
      ? db.from('power_maps').update({ decision, map, updated_at: now }).eq('id', id).eq('user_id', uid).select(COLS).single()
      : db.from('power_maps').insert({ user_id: uid, decision, map }).select(COLS).single();
    const { data, error } = await q;
    if (missingTable(error)) return NextResponse.json({ error: NOT_YET, unavailable: true }, { status: 503 });
    if (error) return apiError("Couldn't save your map. Please try again.", 500, '[power-map:post]', error);
    return NextResponse.json({ map: data });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't save your map. Please try again.", 500, '[power-map:post]', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!UUID.test(id)) return NextResponse.json({ error: 'That map was not found.' }, { status: 400 });
    const { error } = await db.from('power_maps').delete().eq('id', id).eq('user_id', uid);
    if (missingTable(error)) return NextResponse.json({ error: NOT_YET, unavailable: true }, { status: 503 });
    if (error) return apiError("Couldn't remove that map. Please try again.", 500, '[power-map:delete]', error);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't remove that map. Please try again.", 500, '[power-map:delete]', err);
  }
}
