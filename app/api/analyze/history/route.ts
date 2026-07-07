import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('person_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    let query = supabase
      .from('analysis_history')
      .select('id, input_text, input_type, threat_score, power_yours, power_theirs, tactics, person_id, created_at, full_result, overall_assessment, techniques_identified')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (personId) {
      query = query.eq('person_id', personId);
    }

    const { data, error } = await query;

    if (error) {
      return apiError('Failed to fetch history.', 500, '[ANALYZE_HISTORY]', error);
    }

    // Truncate input_text for preview, count tactics
    const items = (data || []).map((row: any) => ({
      id: row.id,
      input_text: row.input_text ? row.input_text.slice(0, 100) : '',
      input_type: row.input_type,
      threat_score: row.threat_score,
      power_yours: row.power_yours,
      power_theirs: row.power_theirs,
      tactics_count: Array.isArray(row.tactics) ? row.tactics.length : 0,
      person_id: row.person_id,
      created_at: row.created_at,
      full_result: row.full_result,
    }));

    return NextResponse.json({ analyses: items });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[ANALYZE_HISTORY]', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const body = await request.json();

    if (!body.input_text) {
      return apiError('Nothing to save.', 400);
    }

    const record = {
      user_id: userId,
      person_id: body.person_id || null,
      input_text: body.input_text,
      input_type: body.input_type || 'text',
      threat_score: body.threat_score,
      power_yours: body.power_yours,
      power_theirs: body.power_theirs,
      tactics: body.tactics || [],
      response_options: body.response_options || [],
      communication_style: body.communication_style || {},
      counter_script: body.counter_script || '',
      overall_assessment: body.overall_assessment || '',
      techniques_identified: body.techniques_identified || [],
      full_result: body.full_result || {},
    };

    const { data, error } = await supabase
      .from('analysis_history')
      .insert(record)
      .select()
      .single();

    if (error) {
      return apiError('Failed to save.', 500, '[ANALYZE_HISTORY]', error);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[ANALYZE_HISTORY]', err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const body = await request.json();
    const { id, person_id } = body;

    if (!id) {
      return apiError('Missing id.', 400);
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .update({ person_id })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return apiError('Failed to update.', 500, '[ANALYZE_HISTORY]', error);
    }

    return NextResponse.json(data);
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[ANALYZE_HISTORY]', err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Missing id parameter.', 400);
    }

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete.', 500, '[ANALYZE_HISTORY]', error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[ANALYZE_HISTORY]', err);
  }
}
