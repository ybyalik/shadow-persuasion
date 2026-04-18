// One-off script to delete duplicate Ryan Mace chunks
// Run with: npx tsx scripts/dedup-mace.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const BOOK = 'Dark Psychology and Gaslighting Manipulation';
  const CUTOFF = '2026-04-18T07:00:00'; // Originals end at 06:36, dupes start at 07:06

  const { data, error, count } = await supabase
    .from('knowledge_chunks')
    .delete()
    .eq('book_title', BOOK)
    .gt('created_at', CUTOFF)
    .select('id', { count: 'exact' });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Deleted ${data?.length || count || 0} duplicate chunks from "${BOOK}"`);
  }
}

main();
