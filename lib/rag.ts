import { createClient } from '@supabase/supabase-js';
import { byEdition } from '@/lib/edition';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.[0]?.embedding || [];
  } catch (e) {
    console.error('Embedding error:', e);
    return [];
  }
}

/**
 * Our own book and its free bonuses: the only sources the app answers from.
 * `db` is the book_title in knowledge_chunks; `label` is what readers and the AI see.
 * The edition flag (lib/edition.ts, NEXT_PUBLIC_BOOK_EDITION) picks the set:
 *   v2 (default): rows loaded by funnel-v2/app-knowledge/ingest_book.py
 *   v3:           rows loaded by funnel-v2/app-knowledge/ingest_book_v3.py (titles must match it)
 * The two sets use different titles, so loading v3 never changes what v2 users see.
 */
export const BOOK_SOURCES: { db: string; label: string; main: boolean }[] = byEdition({
  v2: [
    { db: 'Shadow Persuasion', label: 'Shadow Persuasion', main: true },
    { db: 'The Tactic Spotter', label: 'The Tactic Spotter', main: false },
    { db: 'Stop Shrinking', label: 'Stop Shrinking', main: false },
    { db: 'The Hard Conversation Planner', label: 'The Hard Conversation Planner', main: false },
  ],
  v3: [
    { db: 'Shadow Persuasion: The Hidden Rules of Power', label: 'Shadow Persuasion', main: true },
    { db: 'The 21-Day Power Reset Journal', label: 'The 21-Day Power Reset Journal', main: false },
    { db: 'The Tactic Spotter (Hidden Rules of Power)', label: 'The Tactic Spotter', main: false },
    { db: 'The Conversation Planner', label: 'The Conversation Planner', main: false },
    { db: 'The Power Map and Decision Cards', label: 'The Power Map and Decision Cards', main: false },
  ],
});

export const BOOK_TITLES = BOOK_SOURCES.map((s) => s.db);

const LABEL_OF = new Map(BOOK_SOURCES.map((s) => [s.db, s.label]));
const MAIN_LABEL = BOOK_SOURCES.find((s) => s.main)!.label;

/** True for passages from the book itself (not a bonus guide). */
export function isMainBook(book: string) {
  return book === MAIN_LABEL;
}

/** How a passage is labelled for the AI and on screen: the chapter, or "Bonus guide: <name>". */
export function passageLabel(p: { book: string; chapter: string }) {
  return isMainBook(p.book) ? p.chapter : `Bonus guide: ${p.book}`;
}

export type BookPassage = { chapter: string; section: string | null; content: string; similarity: number; book: string };

/** Passages from the book most related to `query`. */
export async function searchBook(query: string, options?: { threshold?: number; count?: number }): Promise<BookPassage[]> {
  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return [];
    const { data, error } = await supabase.rpc('match_book_chunks', {
      query_embedding: embedding,
      match_threshold: options?.threshold ?? 0.25,
      match_count: options?.count ?? 5,
      titles: BOOK_TITLES,
    });
    if (error || !data) return [];
    return (data as { chapter: string; technique_name: string | null; content: string; similarity: number; book_title: string }[]).map((c) => ({ chapter: c.chapter, section: c.technique_name, content: c.content, similarity: c.similarity, book: LABEL_OF.get(c.book_title) ?? c.book_title }));
  } catch (e) {
    console.error('Book search error:', e);
    return [];
  }
}

/** The same passages as one block of text for a prompt, each labelled with its chapter. */
export async function searchKnowledge(query: string, options?: { threshold?: number; count?: number }): Promise<string> {
  const passages = await searchBook(query, options);
  return passages.map((p) => `[${passageLabel(p)}]\n${p.content}`).join('\n\n---\n\n');
}
