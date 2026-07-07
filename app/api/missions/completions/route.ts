import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'mission_completions';

function toLocalDateStr(date: Date, tzOffsetMin: number): string {
  const local = new Date(date.getTime() - tzOffsetMin * 60000);
  return local.toISOString().split('T')[0];
}

function calculateStreak(completions: any[], tzOffsetMin = 0): { current: number; longest: number } {
  if (completions.length === 0) return { current: 0, longest: 0 };

  // Get unique dates (YYYY-MM-DD) in user's local timezone, sorted descending
  const dates = Array.from(
    new Set(
      completions.map((c) => {
        const d = new Date(c.completed_at || c.created_at);
        return toLocalDateStr(d, tzOffsetMin);
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return { current: 0, longest: 0 };

  const now = new Date();
  const today = toLocalDateStr(now, tzOffsetMin);
  const yesterday = toLocalDateStr(new Date(now.getTime() - 86400000), tzOffsetMin);

  // Current streak: must include today or yesterday
  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

// GET: Get all completions for the user, calculates streak from data
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch completions.', 500, '[MISSION_COMPLETIONS]', error);
    }

    const completions = data || [];
    const tzParam = req.nextUrl.searchParams.get('tz');
    const tzOffsetMin = tzParam ? parseInt(tzParam, 10) || 0 : 0;
    const streak = calculateStreak(completions, tzOffsetMin);

    return NextResponse.json({ completions, streak });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MISSION_COMPLETIONS]', error);
  }
}

// POST: Save a mission completion
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    // Allow-list the fields a client may set. user_id comes from the verified
    // token, and server-managed columns (id, completed_at) are never taken from
    // the request body so a caller can't forge streaks/stats or overwrite rows.
    const record = {
      missionId: body.missionId,
      date: body.date,
      whatHappened: body.whatHappened,
      didItWork: body.didItWork,
      notes: body.notes,
      grade: body.grade,
      feedback: body.feedback,
      xpEarned: body.xpEarned,
      insight: body.insight,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(record)
      .select()
      .single();

    if (error) {
      return apiError('Failed to save completion.', 500, '[MISSION_COMPLETIONS]', error);
    }

    return NextResponse.json({ completion: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MISSION_COMPLETIONS]', error);
  }
}
