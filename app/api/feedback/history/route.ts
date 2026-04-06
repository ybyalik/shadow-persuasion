import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'user_feedback';

// GET: List all feedback for the user
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
      console.error('[FEEDBACK_HISTORY]', 'Error fetching feedback:', error);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback: data || [] });
  } catch (error) {
    console.error('[FEEDBACK_HISTORY]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save feedback record
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
      console.error('[FEEDBACK_HISTORY]', 'Error saving feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error('[FEEDBACK_HISTORY]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
