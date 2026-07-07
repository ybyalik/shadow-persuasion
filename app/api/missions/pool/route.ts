import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchKnowledge } from '@/lib/rag';
import { requireAuth, requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

// Mapping from mission category to taxonomy category IDs
const CATEGORY_TO_TAXONOMY: Record<string, string[]> = {
  Negotiation: ['career', 'business', 'finance'],
  Rapport: ['dating', 'relationships', 'parenting'],
  Influence: ['business', 'influence', 'career', 'leadership'],
  Framing: ['career', 'leadership', 'personal_power'],
  Defense: ['defense', 'relationships'],
};

// Reverse: given taxonomy IDs, which mission categories match?
function getMissionCategoriesForTaxonomy(taxonomyIds: string[]): Set<string> {
  const result = new Set<string>();
  for (const [missionCat, taxIds] of Object.entries(CATEGORY_TO_TAXONOMY)) {
    if (taxIds.some((t) => taxonomyIds.includes(t))) {
      result.add(missionCat);
    }
  }
  return result;
}

// GET: Returns all missions from the missions table
// Optional query param: ?categories=career,dating,defense (taxonomy category IDs)
export async function GET(req: NextRequest) {
  try {
    // Missions are an app feature behind login.
    await requireAuth(req);

    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return apiError('Failed to fetch missions.', 500, '[MISSIONS_POOL]', error);
    }

    // Map DB columns to camelCase for frontend compatibility
    let missions = (data || []).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      technique: m.technique,
      category: m.category,
      difficulty: m.difficulty,
      xpReward: m.xp_reward,
      type: m.type,
      isGenerated: m.is_generated,
      sourceBooks: m.source_books,
    }));

    // Filter by taxonomy categories if provided
    const categoriesParam = req.nextUrl.searchParams.get('categories');
    if (categoriesParam) {
      const taxonomyIds = categoriesParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (taxonomyIds.length > 0) {
        const allowedCategories = getMissionCategoriesForTaxonomy(taxonomyIds);
        if (allowedCategories.size > 0) {
          missions = missions.filter((m) => allowedCategories.has(m.category));
        }
      }
    }

    return NextResponse.json({ missions });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MISSIONS_POOL]', error);
  }
}

// POST: Generate new missions from knowledge base
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Admin-only: generating missions costs money and writes into the shared
    // missions table that every user sees.
    await requireAdmin(req);

    const { count: rawCount } = await req.json().catch(() => ({}));
    // Clamp count to a safe integer range before it reaches the LLM prompt.
    const count = Math.min(Math.max(parseInt(String(rawCount ?? 5), 10) || 5, 1), 20);

    // Search knowledge chunks for techniques
    const knowledgeContext = await searchKnowledge(
      'influence techniques persuasion tactics negotiation strategies rapport building framing',
      { count: 15, threshold: 0.2 }
    );

    if (!knowledgeContext) {
      return apiError('No knowledge base content found. Upload books first.', 400);
    }

    // Get existing mission titles to avoid duplicates
    const { data: existing } = await supabase
      .from('missions')
      .select('title');
    const existingTitles = new Set((existing || []).map((m) => m.title.toLowerCase()));

    const prompt = `Based on the following knowledge base excerpts from psychology and influence books, generate ${count} new practical missions for users to practice these techniques in real life.

KNOWLEDGE BASE EXCERPTS:
${knowledgeContext}

EXISTING MISSIONS TO AVOID DUPLICATING:
${Array.from(existingTitles).slice(0, 20).join(', ')}

Generate missions in this exact JSON format:
{
  "missions": [
    {
      "title": "Short mission title (3-5 words)",
      "description": "Detailed description of what the user should do. Be specific and actionable. 1-3 sentences.",
      "technique": "Name of the technique being practiced",
      "category": "One of: Influence, Negotiation, Rapport, Framing, Defense",
      "difficulty": "One of: Beginner, Intermediate, Advanced",
      "xp_reward": 30-200 based on difficulty,
      "type": "One of: observer, beginner, intermediate, advanced",
      "source_books": ["Book Title by Author"]
    }
  ]
}

Rules:
- Each mission should practice a specific technique from the knowledge base
- Missions should be practical, doable in everyday life
- Include a mix of difficulties
- Reference the actual books and techniques from the excerpts
- Observer missions (just notice/track) should be Beginner with 30 XP
- Beginner action missions: 50 XP
- Intermediate: 80-100 XP
- Advanced: 120-200 XP`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a mission designer for a persuasion training app. Generate practical, real-world missions based on psychology book content. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return apiError('Failed to generate missions. Please try again.', 502, '[MISSIONS_POOL]', `OpenRouter ${response.status}: ${errText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      return apiError('Failed to generate missions. Please try again.', 502, '[MISSIONS_POOL]');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      return apiError('AI returned an invalid response. Please try again.', 502, '[MISSIONS_POOL]', content?.slice?.(0, 200) ?? parseErr);
    }
    const newMissions = parsed.missions || [];

    // Filter out duplicates
    const uniqueMissions = newMissions.filter(
      (m: any) => !existingTitles.has(m.title.toLowerCase())
    );

    if (uniqueMissions.length === 0) {
      return apiError('All generated missions were duplicates. Try again.', 409);
    }

    // Insert into database
    const rows = uniqueMissions.map((m: any) => ({
      title: m.title,
      description: m.description,
      technique: m.technique,
      category: m.category || 'Influence',
      difficulty: m.difficulty || 'Beginner',
      xp_reward: m.xp_reward || 50,
      type: m.type || 'beginner',
      is_generated: true,
      source_books: m.source_books || [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('missions')
      .insert(rows)
      .select();

    if (insertError) {
      return apiError('Failed to save generated missions.', 500, '[MISSIONS_POOL]', insertError);
    }

    return NextResponse.json({
      generated: (inserted || []).map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        technique: m.technique,
        category: m.category,
        difficulty: m.difficulty,
        xpReward: m.xp_reward,
        type: m.type,
        isGenerated: m.is_generated,
        sourceBooks: m.source_books,
      })),
    });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MISSIONS_POOL]', error);
  }
}
