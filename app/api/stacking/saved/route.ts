import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'saved_stacks';

// GET: List the signed-in user's saved stacks
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError('Failed to fetch saved stacks.', 500, '[STACKING_SAVED]', error);
    }

    return NextResponse.json({ stacks: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[STACKING_SAVED]', error);
  }
}

// POST: Save a new stack for the signed-in user
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    // Never let the client pick which user owns the row; always derive it
    // from the verified token.
    const { user_id: _ignored, ...safeBody } = body || {};
    void _ignored;

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...safeBody, user_id: userId })
      .select()
      .single();

    if (error) {
      return apiError('Failed to save stack.', 500, '[STACKING_SAVED]', error);
    }

    return NextResponse.json({ stack: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[STACKING_SAVED]', error);
  }
}

// DELETE: Delete one of the signed-in user's stacks (by ?id=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return apiError('Failed to delete stack.', 500, '[STACKING_SAVED]', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[STACKING_SAVED]', error);
  }
}
