import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';

const PRACTICE_SYSTEM_PROMPT = `You are a psychology instructor creating interactive practice scenarios for influence techniques. Generate realistic practice scenarios that test understanding of specific psychological principles.

For each technique, create 3-4 multiple choice scenarios where:
- Each scenario presents a realistic situation
- User must choose the best application of the technique
- Options include common mistakes and optimal approaches
- Feedback explains WHY each choice works or fails
- Include specific psychology principle explanations

Respond in this exact JSON format:
{
  "scenarios": [
    {
      "id": "1",
      "situation": "Detailed scenario description setting up the context",
      "yourMessage": "Question asking how to apply the technique",
      "options": [
        {
          "text": "Option 1 text - what the user might say/do",
          "isCorrect": false,
          "explanation": "Why this doesn't work well",
          "techniqueApplication": "How this relates to the technique (poor/good/excellent application)"
        },
        {
          "text": "Option 2 text - optimal choice",
          "isCorrect": true,
          "explanation": "Why this works and what makes it effective",
          "techniqueApplication": "Specific technique principles being used correctly"
        },
        ... (3-4 options total per scenario)
      ]
    }
    ... (3-4 scenarios total)
  ]
}

Make scenarios:
- Realistic and relatable
- Cover different contexts (work, personal, sales, negotiation)
- Include subtle applications, not obvious manipulation
- Test both positive and defensive applications
- Reference specific psychology principles from your knowledge base`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { techniqueId, techniqueName, description } = await req.json();

    if (!techniqueName) {
      return NextResponse.json({ error: 'Technique name is required' }, { status: 400 });
    }

    // Search knowledge base for relevant content
    const ragContext = await searchKnowledge(
      `${techniqueName} technique examples application psychology practice scenarios`,
      { count: 3 }
    );
    const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${ragContext}` : '';
    const enhancedPrompt = PRACTICE_SYSTEM_PROMPT + knowledgeContext;

    console.log('[TECHNIQUE-PRACTICE API] Generating scenarios for:', techniqueName);

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
          { role: 'system', content: enhancedPrompt },
          {
            role: 'user',
            content: `Create interactive practice scenarios for the technique: "${techniqueName}"\n\nDescription: ${description}\n\nGenerate 3-4 realistic scenarios that test proper application of this technique in different contexts. Include common mistakes and optimal approaches with detailed explanations.`
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TECHNIQUE-PRACTICE API] OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    // Strip markdown code block wrappers if present
    const content = rawContent.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      console.log('[TECHNIQUE-PRACTICE API] Generated', result.scenarios?.length || 0, 'scenarios');
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[TECHNIQUE-PRACTICE API] Failed to parse AI response as JSON:', content);
      
      // Return fallback scenarios if parsing fails
      return NextResponse.json({
        scenarios: [
          {
            id: '1',
            situation: `You're in a situation where you need to apply ${techniqueName}. Consider the best approach based on the technique principles.`,
            yourMessage: `How would you best apply ${techniqueName} in this context?`,
            options: [
              {
                text: "Apply the technique directly and obviously",
                isCorrect: false,
                explanation: "Direct application might feel manipulative and create resistance.",
                techniqueApplication: "Poor application - too obvious and heavy-handed"
              },
              {
                text: "Use subtle, ethical application focused on mutual benefit",
                isCorrect: true,
                explanation: "Subtle application respects the other person while achieving your objective.",
                techniqueApplication: "Good application - ethical and effective"
              },
              {
                text: "Don't use the technique at all",
                isCorrect: false,
                explanation: "Missing an opportunity to apply legitimate influence principles.",
                techniqueApplication: "Missed opportunity - not utilizing available tools"
              }
            ]
          }
        ]
      });
    }

  } catch (error) {
    console.error('[TECHNIQUE-PRACTICE API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate practice scenarios.' }, { status: 500 });
  }
}