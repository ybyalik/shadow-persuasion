import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const { data, error } = await supabase
      .from('quickfire_history')
      .select('id, situation, context, classification, technique, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return apiError('Failed to fetch history.', 500, '[QUICKFIRE_HISTORY]', error);
    }

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Failed to fetch history.', 500, '[QUICKFIRE_HISTORY]', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from('quickfire_history')
      .insert({
        user_id: userId,
        situation: body.situation,
        context: body.context || null,
        classification: body.classification || null,
        technique: body.technique || null,
        responses: body.responses || [],
        avoid: body.avoid || null,
        scenarios: body.scenarios || [],
        full_result: body.fullResult || {},
      })
      .select('id')
      .single();

    if (error) {
      return apiError('Failed to save.', 500, '[QUICKFIRE_HISTORY]', error);
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Failed to save.', 500, '[QUICKFIRE_HISTORY]', error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('quickfire_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete.', 500, '[QUICKFIRE_HISTORY]', error);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Failed to delete.', 500, '[QUICKFIRE_HISTORY]', error);
  }
}
