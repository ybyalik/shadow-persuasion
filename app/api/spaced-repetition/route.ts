import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'spaced_repetition';

// GET: Get all SR cards for the user (optionally ?due=true to filter only due cards)
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const dueOnly = searchParams.get('due') === 'true';

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('next_review_at', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    if (dueOnly) {
      query = query.lte('next_review_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SPACED_REPETITION]', 'Error fetching SR cards:', error);
      return NextResponse.json({ error: 'Failed to fetch SR cards' }, { status: 500 });
    }

    return NextResponse.json({ cards: data || [] });
  } catch (error) {
    console.error('[SPACED_REPETITION]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Update a card after review (upsert on user_id + technique_id)
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();

    const { technique_id, ...cardData } = body;

    if (!technique_id) {
      return NextResponse.json({ error: 'technique_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        {
          ...cardData,
          technique_id,
          user_id: userId,
        },
        { onConflict: 'user_id,technique_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[SPACED_REPETITION]', 'Error updating SR card:', error);
      return NextResponse.json({ error: 'Failed to update SR card' }, { status: 500 });
    }

    return NextResponse.json({ card: data });
  } catch (error) {
    console.error('[SPACED_REPETITION]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
