/**
 * Plain progress for "Today" and "My Progress".
 * Reads other areas' tables only (never writes them):
 *   reset_progress     -> reset steps done, streak
 *   analysis_history   -> messages decoded
 *   practice_results   -> practice scenes (type 'scenario'), rehearsals
 *                         (type 'rehearsal' / 'spar' / 'sparring'), Spot the Tactic
 *                         rounds ('spot-tactic'), and "held your ground" when a
 *                         debrief records feedback.heldGround = true
 *   conversation_plans -> conversations planned
 * GET ?tz=<browser getTimezoneOffset()>
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { loadReset } from '@/app/api/missions/reset-data';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const REHEARSAL_TYPES = new Set(['rehearsal', 'rehearse', 'spar', 'sparring']);

type Practice = { type: string | null; reference_id: string | null; score: number | null; feedback: Record<string, unknown> | null; created_at: string };
type Decode = { id: string; input_text: string | null; tactics: { tactic?: string }[] | null; created_at: string };

function heldGround(p: Practice) {
  const f = p.feedback || {};
  return f.heldGround === true || f.held_ground === true;
}

function snippet(s: string | null | undefined, n = 70) {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}

async function count(table: string, uid: string) {
  const { count: c } = await db.from(table).select('id', { count: 'exact', head: true }).eq('user_id', uid);
  return c ?? 0;
}

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const tz = parseInt(req.nextUrl.searchParams.get('tz') || '0', 10) || 0;

    const [reset, decodesCount, plansCount, decodesRes, practiceRes] = await Promise.all([
      loadReset(uid, tz),
      count('analysis_history', uid),
      count('conversation_plans', uid),
      db.from('analysis_history').select('id, input_text, tactics, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(5),
      db.from('practice_results').select('type, reference_id, score, feedback, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(1000),
    ]);

    const practice = (practiceRes.data ?? []) as Practice[];
    const scenes = practice.filter((p) => p.type === 'scenario');
    const rehearsals = practice.filter((p) => REHEARSAL_TYPES.has(p.type || ''));
    const spots = practice.filter((p) => p.type === 'spot-tactic');

    const current = reset.currentDay ? reset.days.find((d) => d.day_number === reset.currentDay) : null;

    // "Recently": latest decodes and practice, newest first.
    const recent: { kind: 'decode' | 'scene' | 'rehearsal' | 'reset'; label: string; detail: string; date: string; href: string }[] = [];
    for (const d of (decodesRes.data ?? []) as Decode[]) {
      const tactic = Array.isArray(d.tactics) && d.tactics[0]?.tactic ? d.tactics[0].tactic : '';
      recent.push({ kind: 'decode', label: 'Decoded a message', detail: tactic || snippet(d.input_text), date: d.created_at, href: '/app/analyze' });
    }
    for (const p of [...scenes, ...rehearsals].slice(0, 5)) {
      const isScene = p.type === 'scenario';
      recent.push({
        kind: isScene ? 'scene' : 'rehearsal',
        label: isScene ? 'Practiced a scene' : 'Rehearsed a conversation',
        detail: heldGround(p) ? 'You held your ground' : '',
        date: p.created_at,
        href: isScene ? '/app/training' : '/app/spar',
      });
    }
    const titleOf = new Map(reset.days.map((d) => [d.day_number, d.title]));
    for (const e of [...reset.entries].sort((a, b) => b.completed_at.localeCompare(a.completed_at)).slice(0, 3)) {
      recent.push({ kind: 'reset', label: 'Finished a reset step', detail: titleOf.get(e.day_number) || '', date: e.completed_at, href: '/app/field-ops' });
    }
    recent.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      reset: {
        doneCount: reset.doneCount,
        total: reset.total,
        streak: reset.streak,
        level: reset.level,
        currentDay: current
          ? { day_number: current.day_number, label: current.label, title: current.title, drill: current.drill, phase: current.phase, chapter: current.chapter, chapter_title: current.chapter_title }
          : null,
        doneToday: reset.entries.some((e) => new Date(new Date(e.completed_at).getTime() - tz * 60_000).toISOString().slice(0, 10) === new Date(Date.now() - tz * 60_000).toISOString().slice(0, 10)),
      },
      stats: {
        decoded: decodesCount,
        rehearsals: rehearsals.length,
        scenes: scenes.length,
        heldGround: practice.filter(heldGround).length,
        spotRounds: spots.length,
        spotRight: spots.filter((p) => (p.score ?? 0) > 0).length,
        plans: plansCount,
      },
      recent: recent.slice(0, 6),
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load your progress just now. Please try again.', 500, '[progress]', err);
  }
}
