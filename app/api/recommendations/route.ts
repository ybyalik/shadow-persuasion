import { NextRequest, NextResponse } from 'next/server';
import { techniques } from '@/lib/techniques';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';

const SYSTEM_PROMPT = `You are an expert persuasion coach. Given a user's goal, their recently practiced techniques, and their weak areas, recommend 3-5 techniques they should focus on next.

You have access to a library of techniques and relevant knowledge from persuasion books.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "techniqueId": "technique-id-from-library",
      "techniqueName": "Technique Name",
      "reason": "Why this technique is recommended for their goal",
      "priority": "High" or "Medium",
      "relatedGoal": "How this connects to their stated goal"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "technique": "technique-id",
      "rationale": "Why learn this first/next"
    }
  ]
}

Only recommend techniques from the provided library. Prioritize techniques that address weak areas and align with the user's goal.`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userGoal, recentTechniques = [], weakAreas = [] } = await req.json();

    if (!userGoal) {
      return NextResponse.json({ error: 'No goal provided.' }, { status: 400 });
    }

    // Build technique library context
    const techniqueList = techniques
      .map((t) => `- ${t.id}: ${t.name} (${t.category}, difficulty ${t.difficulty}) - ${t.description}`)
      .join('\n');

    // RAG search
    const ragContext = await searchKnowledge(
      `${userGoal} persuasion techniques for ${weakAreas.join(', ')}`,
      { threshold: 0.35, count: 4 }
    );
    const knowledgeContext = ragContext || '';

    const userMessage = `USER GOAL: ${userGoal}

RECENTLY PRACTICED TECHNIQUES: ${recentTechniques.length > 0 ? recentTechniques.join(', ') : 'None yet'}

WEAK AREAS: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None identified yet'}

AVAILABLE TECHNIQUES:
${techniqueList}

${knowledgeContext ? `\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE EXCERPTS:\n${knowledgeContext}` : ''}

Based on the user's goal and current skill gaps, recommend 3-5 techniques and create a learning path.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RECOMMENDATIONS]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[RECOMMENDATIONS]', 'JSON parse error:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('[RECOMMENDATIONS]', error);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}
