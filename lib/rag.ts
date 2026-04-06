import { createClient } from '@supabase/supabase-js';

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

export async function searchKnowledge(query: string, options?: { threshold?: number; count?: number }): Promise<string> {
  const threshold = options?.threshold ?? 0.3;
  const count = options?.count ?? 5;

  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: count,
    });

    if (error || !data || data.length === 0) return '';

    return data.map((chunk: any) =>
      `[${chunk.book_title} by ${chunk.author} — ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');
  } catch (e) {
    console.error('RAG search error:', e);
    return '';
  }
}
