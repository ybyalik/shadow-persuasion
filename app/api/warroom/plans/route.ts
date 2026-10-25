import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';

/**
 * Saved conversation plans.
 * GET    /api/warroom/plans          -> { plans: [...] } (newest first, max 30)
 * POST   /api/warroom/plans          { counterpart, situation, goal, fear, personId, plan } -> { plan }
 * DELETE /api/warroom/plans?id=<id>  -> { ok: true }
 */

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const { data, error } = await db
      .from('conversation_plans')
      .select('id, person_id, counterpart, situation, goal, fear, plan, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return apiError("Couldn't load your saved plans.", 500, '[plans:get]', error);
    return NextResponse.json({ plans: data ?? [] });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't load your saved plans.", 500, '[plans:get]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
    const situation = clip(body?.situation, 1500);
    const goal = clip(body?.goal, 800);
    const plan = body?.plan;
    if (!situation || !goal || !plan || typeof plan !== 'object' || JSON.stringify(plan).length > 30000) {
      return NextResponse.json({ error: 'There was nothing to save yet.' }, { status: 400 });
    }
    const personId = typeof body?.personId === 'string' && UUID.test(body.personId) ? body.personId : null;
    const { data, error } = await db
      .from('conversation_plans')
      .insert({
        user_id: uid,
        person_id: personId,
        counterpart: clip(body?.counterpart, 200) || null,
        situation,
        goal,
        fear: clip(body?.fear, 800) || null,
        plan,
      })
      .select('id, person_id, counterpart, situation, goal, fear, plan, created_at')
      .single();
    if (error) return apiError("Couldn't save your plan. Please try again.", 500, '[plans:post]', error);
    return NextResponse.json({ plan: data });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't save your plan. Please try again.", 500, '[plans:post]', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!UUID.test(id)) return NextResponse.json({ error: 'That plan was not found.' }, { status: 400 });
    const { error } = await db.from('conversation_plans').delete().eq('id', id).eq('user_id', uid);
    if (error) return apiError("Couldn't remove that plan. Please try again.", 500, '[plans:delete]', error);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Couldn't remove that plan. Please try again.", 500, '[plans:delete]', err);
  }
}
