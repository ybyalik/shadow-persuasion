import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import {
  mapDecode,
  mapInteraction,
  mapSummary,
  matchTactic,
  normalizeRelationship,
  soundsUnsafe,
  tallyTactics,
  type Decode,
} from '@/lib/prompts/your-life';

/**
 * My People: the people in the reader's life.
 *   GET            list (with top tactics and counts)
 *   GET ?id=       one person, with timeline (logged interactions + decodes saved to them)
 *   POST           add a person { name, relationshipType, notes? }
 *   PUT            edit { id, name?, relationshipType?, notes? }
 *                  or record a decode { id, addDecode: { tactics: string[] } }
 *   DELETE ?id=    remove a person
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const TABLE = 'user_profiles_people';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPerson(row: any, decodes: Decode[] = []) {
  const interactions = (Array.isArray(row.interactions) ? row.interactions : []).map(mapInteraction);
  interactions.sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));
  const tactics = tallyTactics(interactions, decodes, row.tactics);
  const lastDates = [interactions[0]?.date, decodes[0]?.date].filter(Boolean) as string[];
  return {
    id: row.id,
    name: row.name,
    relationshipType: normalizeRelationship(row.relationship_type),
    notes: row.notes || '',
    tactics,
    whatWorked: Array.isArray(row.what_worked) ? row.what_worked : [],
    summary: mapSummary(row.playbook),
    nextStep: row.next_recommended_action || null,
    interactions,
    decodes,
    interactionCount: interactions.length + decodes.length,
    lastSeen: lastDates.sort().pop() || null,
    unsafe: interactions.some((i: { unsafe?: boolean; whatHappened: string; whatTheySaid?: string }) => i.unsafe || soundsUnsafe(i.whatHappened, i.whatTheySaid)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function decodesFor(userId: string, personIds: string[]) {
  const byPerson: Record<string, Decode[]> = {};
  if (personIds.length === 0) return byPerson;
  const { data, error } = await supabase
    .from('analysis_history')
    .select('id, person_id, input_text, tactics, overall_assessment, full_result, created_at')
    .eq('user_id', userId)
    .in('person_id', personIds)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[people] decodes lookup failed', error.message);
    return byPerson;
  }
  for (const r of data || []) (byPerson[r.person_id] ||= []).push(mapDecode(r));
  return byPerson;
}

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = new URL(req.url).searchParams.get('id');

    if (id) {
      const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).eq('user_id', uid).maybeSingle();
      if (error) return apiError('Could not load this person. Please try again.', 500, '[people GET one]', error);
      if (!data) return NextResponse.json({ error: 'We could not find that person.' }, { status: 404 });
      const decodes = await decodesFor(uid, [id]);
      return NextResponse.json({ profile: mapPerson(data, decodes[id] || []) });
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', uid).order('updated_at', { ascending: false });
    if (error) return apiError('Could not load your people. Please try again.', 500, '[people GET]', error);
    const rows = data || [];
    const decodes = await decodesFor(
      uid,
      rows.map((r) => r.id)
    );
    // The list stays light: no full timelines.
    const profiles = rows.map((r) => {
      const p = mapPerson(r, decodes[r.id] || []);
      return { ...p, interactions: [], decodes: [], tactics: p.tactics.slice(0, 4) };
    });
    return NextResponse.json({ profiles });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[people GET]', err);
  }
}

/** Tactic names from a legacy Decode save ({ traits: { triggers: { defensive: [...] } } }). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tacticsFromBody(body: any): string[] {
  const fromDecode = Array.isArray(body?.addDecode?.tactics) ? body.addDecode.tactics : [];
  return fromDecode.map((t: unknown) => String(t || '').trim().slice(0, 80)).filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeStoredTactics(stored: any, names: string[]) {
  const list: { name: string; chapter: number | null; count: number; lastSeen: string }[] = Array.isArray(stored) ? [...stored] : [];
  const now = new Date().toISOString();
  for (const raw of names) {
    const t = matchTactic(raw);
    const name = t ? t.name : raw;
    const found = list.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (found) {
      found.count = (Number(found.count) || 0) + 1;
      found.lastSeen = now;
    } else list.push({ name, chapter: t?.chapter ?? null, count: 1, lastSeen: now });
  }
  return list;
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || '').trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: 'Please add a name (a first name or nickname is fine).' }, { status: 400 });

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: uid,
        name,
        relationship_type: normalizeRelationship(body?.relationshipType),
        notes: String(body?.notes || '').trim().slice(0, 2000) || null,
        traits: {},
        interactions: [],
        tactics: mergeStoredTactics([], tacticsFromBody(body)),
      })
      .select()
      .single();
    if (error) return apiError('Could not save this person. Please try again.', 500, '[people POST]', error);
    return NextResponse.json({ profile: mapPerson(data) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[people POST]', err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'Which person is this about?' }, { status: 400 });

    const { data: row } = await supabase.from(TABLE).select('*').eq('id', id).eq('user_id', uid).maybeSingle();
    if (!row) return NextResponse.json({ error: 'We could not find that person.' }, { status: 404 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 80);
    if (body.relationshipType !== undefined || body.relationship_type !== undefined) {
      updates.relationship_type = normalizeRelationship(body.relationshipType ?? body.relationship_type);
    }
    if (typeof body.notes === 'string') updates.notes = body.notes.trim().slice(0, 2000) || null;
    const decodeTactics = tacticsFromBody(body);
    if (decodeTactics.length) updates.tactics = mergeStoredTactics(row.tactics, decodeTactics);
    if (Array.isArray(body.whatWorked)) {
      updates.what_worked = body.whatWorked
        .filter((w: { text?: unknown }) => typeof w?.text === 'string')
        .slice(0, 50)
        .map((w: { id?: string; date?: string; text: string; interactionId?: string }) => ({
          id: String(w.id || Date.now()),
          date: String(w.date || new Date().toISOString()),
          text: w.text.slice(0, 600),
          interactionId: w.interactionId || null,
        }));
    }
    // Older Decode saves send { traits }. Decodes linked to the person are read from
    // analysis_history, so the old personality data is simply not stored any more.

    const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).eq('user_id', uid).select().single();
    if (error) return apiError('Could not save your changes. Please try again.', 500, '[people PUT]', error);
    const decodes = await decodesFor(uid, [id]);
    return NextResponse.json({ profile: mapPerson(data, decodes[id] || []) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[people PUT]', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Which person is this about?' }, { status: 400 });
    const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', uid);
    if (error) return apiError('Could not remove this person. Please try again.', 500, '[people DELETE]', error);
    return NextResponse.json({ success: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[people DELETE]', err);
  }
}
