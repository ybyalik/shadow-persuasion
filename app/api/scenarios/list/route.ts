import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Logged-in only: keeps the shared scenario library (and its ids) from
    // being enumerated by anonymous callers.
    await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('scenarios')
      .select('*')
      .order('category')
      .order('difficulty');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SCENARIOS/LIST]', 'Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch scenarios.' }, { status: 500 });
    }

    const scenarios = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      difficulty: row.difficulty,
      description: row.description,
      objective: row.objective,
      techniques: row.techniques || [],
      is_generated: row.is_generated || false,
      source_books: row.source_books || [],
    }));

    return NextResponse.json({ scenarios });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Failed to fetch scenarios.', 500, '[SCENARIOS/LIST]', err);
  }
}
