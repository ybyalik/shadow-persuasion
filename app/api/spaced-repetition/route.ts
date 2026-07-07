import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'spaced_repetition';

// GET: Get the signed-in user's SR cards (optionally ?due=true for only due cards)
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const dueOnly = searchParams.get('due') === 'true';

    let query = supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('next_review_at', { ascending: true });

    if (dueOnly) {
      query = query.lte('next_review_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return apiError('Failed to fetch SR cards.', 500, '[SPACED_REPETITION]', error);
    }

    return NextResponse.json({ cards: data || [] });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[SPACED_REPETITION]', error);
  }
}

// POST: Update a card after review (upsert on user_id + technique_id)
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json();

    const { technique_id, user_id: _ignored, ...cardData } = body;
    void _ignored;

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
      return apiError('Failed to update SR card.', 500, '[SPACED_REPETITION]', error);
    }

    return NextResponse.json({ card: data });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[SPACED_REPETITION]', error);
  }
}
