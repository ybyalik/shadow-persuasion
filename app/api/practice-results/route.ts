import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List the signed-in user's practice results, filterable by type and date range
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('practice_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (from) {
      query = query.gte('created_at', from);
    }

    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query;

    if (error) {
      return apiError('Failed to fetch practice results.', 500, '[PRACTICE_RESULTS]', error);
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PRACTICE_RESULTS]', error);
  }
}

// POST: Save a practice result for the signed-in user
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { type, reference_id, score, xp_earned, techniques_used, feedback } = await req.json();

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('practice_results')
      .insert({
        type,
        reference_id: reference_id || null,
        score: score ?? null,
        xp_earned: xp_earned ?? 0,
        techniques_used: techniques_used || [],
        feedback: feedback || {},
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return apiError('Failed to save practice result.', 500, '[PRACTICE_RESULTS]', error);
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[PRACTICE_RESULTS]', error);
  }
}
