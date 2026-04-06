import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'saved_stacks';

// GET: List saved stacks for the user
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[STACKING SAVED GET] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch saved stacks' }, { status: 500 });
    }

    return NextResponse.json({ stacks: data || [] });
  } catch (error) {
    console.error('[STACKING SAVED GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save a new stack
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('[STACKING SAVED POST] Error:', error);
      return NextResponse.json({ error: 'Failed to save stack' }, { status: 500 });
    }

    return NextResponse.json({ stack: data });
  } catch (error) {
    console.error('[STACKING SAVED POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a stack (by ?id=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    let query = supabase.from(TABLE).delete().eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { error } = await query;

    if (error) {
      console.error('[STACKING SAVED DELETE] Error:', error);
      return NextResponse.json({ error: 'Failed to delete stack' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STACKING SAVED DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
