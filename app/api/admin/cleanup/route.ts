import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// One-off cleanup endpoint — delete duplicate Ryan Mace chunks
export async function POST() {
  try {
    const BOOK = 'Dark Psychology and Gaslighting Manipulation';
    const CUTOFF = '2026-04-18T07:00:00';

    const { error, count } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('book_title', BOOK)
      .gt('created_at', CUTOFF);

    if (error) throw error;

    return NextResponse.json({ deleted: count, book: BOOK, cutoff: CUTOFF });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
