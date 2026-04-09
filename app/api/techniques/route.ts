import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // ── Single technique detail ──
    if (id) {
      const { data: chunks, error } = await supabase
        .from('knowledge_chunks')
        .select('*')
        .eq('technique_id', id);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to fetch technique.' }, { status: 500 });
      }

      if (!chunks || chunks.length === 0) {
        return NextResponse.json({ error: 'Technique not found.' }, { status: 404 });
      }

      const first = chunks[0];

      // Group chunks by chunk_type
      const grouped: Record<string, { id: string; content: string; bookTitle: string; author: string }[]> = {
        overview: [],
        application: [],
        example: [],
        framework: [],
        exercise: [],
      };

      const booksSet = new Map<string, { title: string; author: string }>();
      const relatedSet = new Set<string>();
      const useCasesSet = new Set<string>();
      let riskLevel = '';

      for (const chunk of chunks) {
        const type = chunk.chunk_type || 'overview';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push({
          id: chunk.id,
          content: chunk.content,
          bookTitle: chunk.book_title,
          author: chunk.author,
        });

        if (chunk.book_title) {
          booksSet.set(chunk.book_title, { title: chunk.book_title, author: chunk.author || '' });
        }

        if (chunk.related_techniques) {
          const related = Array.isArray(chunk.related_techniques)
            ? chunk.related_techniques
            : typeof chunk.related_techniques === 'string'
              ? chunk.related_techniques.split(',').map((s: string) => s.trim())
              : [];
          related.forEach((r: string) => { if (r) relatedSet.add(r); });
        }

        if (chunk.use_cases) {
          const cases = Array.isArray(chunk.use_cases)
            ? chunk.use_cases
            : typeof chunk.use_cases === 'string'
              ? chunk.use_cases.split(',').map((s: string) => s.trim())
              : [];
          cases.forEach((c: string) => { if (c) useCasesSet.add(c); });
        }

        if (chunk.risk_level && !riskLevel) {
          riskLevel = chunk.risk_level;
        }
      }

      return NextResponse.json({
        technique: {
          id: first.technique_id,
          name: first.technique_name,
          category: first.category || 'General',
          difficulty: first.difficulty || 1,
          chunks: grouped,
          books: Array.from(booksSet.values()),
          relatedTechniques: Array.from(relatedSet),
          useCases: Array.from(useCasesSet),
          riskLevel: riskLevel || 'unknown',
        },
      });
    }

    // ── List all techniques ──
    const { data, error } = await supabase.rpc('list_techniques');

    // If RPC doesn't exist, fall back to raw query
    if (error) {
      console.warn('RPC list_techniques not found, using direct query');

      const { data: rawData, error: rawError } = await supabase
        .from('knowledge_chunks')
        .select('technique_name, technique_id, category, difficulty')
        .not('technique_name', 'is', null)
        .neq('technique_name', '')
        .neq('technique_name', 'General');

      if (rawError) {
        console.error('Supabase error:', rawError);
        return NextResponse.json({ error: 'Failed to fetch techniques.' }, { status: 500 });
      }

      // Group manually
      const techMap = new Map<string, {
        id: string;
        name: string;
        category: string;
        difficulty: number;
        chunkCount: number;
      }>();

      for (const row of rawData || []) {
        const key = row.technique_id || row.technique_name;
        const existing = techMap.get(key);
        if (existing) {
          existing.chunkCount += 1;
        } else {
          techMap.set(key, {
            id: row.technique_id || row.technique_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: row.technique_name,
            category: row.category || 'General',
            difficulty: row.difficulty || 1,
            chunkCount: 1,
          });
        }
      }

      const techniques = Array.from(techMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({ techniques });
    }

    // RPC succeeded
    const techniques = (data || []).map((row: any) => ({
      id: row.technique_id,
      name: row.technique_name,
      category: row.category || 'General',
      difficulty: row.difficulty || 1,
      chunkCount: Number(row.chunk_count) || 0,
    }));

    return NextResponse.json({ techniques });
  } catch (err) {
    console.error('Techniques API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
