import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all books with chunk counts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('book_title, author');

    if (error) throw error;

    // Group by book
    const bookMap: Record<string, { title: string; author: string; chunks: number }> = {};
    for (const row of data || []) {
      const key = row.book_title;
      if (!bookMap[key]) {
        bookMap[key] = { title: row.book_title, author: row.author, chunks: 0 };
      }
      bookMap[key].chunks++;
    }

    return NextResponse.json(Object.values(bookMap));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
