import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List chunks for a book, with optional category filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookTitle = searchParams.get('book');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('knowledge_chunks')
      .select('id, book_title, author, technique_name, technique_id, category, chunk_type, difficulty, use_cases, risk_level, content, token_count, created_at', { count: 'exact' });

    if (bookTitle) query = query.eq('book_title', bookTitle);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      chunks: data, 
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
