import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

// GET: Analyze duplicates and return proposed merges
// POST: Execute merges
export async function GET() {
  try {
    // Get all unique technique names
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('technique_name, technique_id');

    if (error) throw error;

    // Count occurrences
    const counts: Record<string, { count: number; id: string }> = {};
    for (const row of data || []) {
      const name = row.technique_name;
      if (!counts[name]) counts[name] = { count: 0, id: row.technique_id };
      counts[name].count++;
    }

    const uniqueNames = Object.keys(counts).sort();

    // Send to AI in batches to group similar techniques
    const BATCH_SIZE = 150;
    const allMerges: { canonical: string; canonicalId: string; variants: string[] }[] = [];

    for (let i = 0; i < uniqueNames.length; i += BATCH_SIZE) {
      const batch = uniqueNames.slice(i, i + BATCH_SIZE);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are a STRICT deduplication expert for a psychology/influence technique database. Given a list of technique names, group ONLY exact duplicates or trivially different names for the SAME technique.

## STRICT RULES — READ CAREFULLY

ONLY merge when the names are literally the same technique with slightly different wording:
- "Anchoring" + "Anchoring Effect" + "Anchoring Technique" = SAME technique, merge to "Anchoring"
- "Gaslighting" + "Gaslighting Tactics" = SAME technique, merge to "Gaslighting"
- "Love Bombing" + "Love-Bombing" = SAME technique (just hyphen difference), merge

NEVER merge when the names describe DIFFERENT techniques, applications, or subtypes, even if they share a word:
- "Gaslighting" vs "Gaslighting Defense" = DIFFERENT (one is the attack, one is the defense)
- "Smoke Screen Manipulation" vs "Victim Mentality Manipulation" = COMPLETELY DIFFERENT techniques
- "Covert Manipulation" vs "Covert Hypnosis" vs "Covert Persuasion" = THREE DIFFERENT techniques
- "Emotional Manipulation" vs "Emotional Intelligence" = DIFFERENT
- "Dark Triad" vs "Dark Psychology" vs "Dark NLP" = THREE DIFFERENT concepts
- "Body Language Reading" vs "Body Language Manipulation" = DIFFERENT (reading vs using)
- "Brainwashing" vs "Brainwashing Through Isolation" vs "Brainwashing through Music" = DIFFERENT (different methods)
- "Building Rapport" vs "Building Defenses Against Manipulation" = COMPLETELY DIFFERENT
- "Frame Control" vs "Reframing" = DIFFERENT techniques (frame control = maintaining dominance, reframing = changing meaning)
- "Manipulation" vs "Smoke Screen Manipulation" = DIFFERENT (general vs specific type)
- "Setting Boundaries" vs "Building Defenses Against Manipulation" = DIFFERENT (specific skill vs broad concept)
- "Understanding Manipulation" vs "Refusal to Be Manipulated" = DIFFERENT (knowledge vs action)
- "Love Bombing" vs "Love Flooding" = DIFFERENT (manipulation tactic vs therapy concept)

The test: Would a psychology professor put these in the EXACT SAME entry in a glossary? If there is ANY meaningful difference in what they describe, do NOT merge. Only merge when the names are interchangeable synonyms for the identical concept.

When in doubt, DO NOT MERGE. It is far better to keep two entries separate than to wrongly merge different techniques.

Choose the shortest, clearest name as the canonical version.
Generate a URL-safe slug as the canonical ID (lowercase, hyphens).
Only include groups that have 2+ names to merge. Don't include singletons.

Respond with JSON: { "merges": [{ "canonical": "Best Name", "canonicalId": "best-name", "variants": ["Variant 1", "Variant 2"] }] }`
            },
            {
              role: 'user',
              content: `Group these technique names:\n${batch.join('\n')}`
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!res.ok) continue;

      const aiData = await res.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (!content) continue;

      try {
        const parsed = JSON.parse(content);
        if (parsed.merges) allMerges.push(...parsed.merges);
      } catch {}
    }

    // Calculate stats
    const totalVariants = allMerges.reduce((sum, m) => sum + m.variants.length, 0);

    return NextResponse.json({
      totalTechniques: uniqueNames.length,
      mergeGroups: allMerges.length,
      variantsToMerge: totalVariants,
      estimatedAfter: uniqueNames.length - totalVariants,
      merges: allMerges,
    });
  } catch (error: any) {
    console.error('[DEDUP]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Execute the merges
export async function POST(req: NextRequest) {
  try {
    const { merges } = await req.json();

    if (!merges || !Array.isArray(merges)) {
      return NextResponse.json({ error: 'merges array required' }, { status: 400 });
    }

    let totalUpdated = 0;

    for (const merge of merges) {
      const { canonical, canonicalId, variants } = merge;
      if (!canonical || !canonicalId || !variants?.length) continue;

      for (const variant of variants) {
        if (variant === canonical) continue;

        const { error, count } = await supabase
          .from('knowledge_chunks')
          .update({ technique_name: canonical, technique_id: canonicalId })
          .eq('technique_name', variant);

        if (!error && count) totalUpdated += count;
      }
    }

    return NextResponse.json({ success: true, chunksUpdated: totalUpdated });
  } catch (error: any) {
    console.error('[DEDUP]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
