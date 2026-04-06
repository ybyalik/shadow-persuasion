import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';

const GENERATE_SYSTEM_PROMPT = `You are a sparring coach for influence and persuasion training. Generate realistic conversational challenges that test the user's ability to respond under pressure.

You MUST respond with valid JSON in this exact format:
{
  "rounds": [
    {
      "challenge": "The exact provocative statement or scenario the user must respond to",
      "context": "Brief context setting the scene (1 sentence)",
      "idealTechniques": ["technique1", "technique2"]
    }
  ]
}

Generate exactly 10 rounds. Each challenge should be a direct quote or situation that demands a tactical response. Make them progressively harder. Be specific and realistic.`;

const GRADE_SYSTEM_PROMPT = `You are a sparring judge for influence and persuasion training. Grade the user's response to a conversational challenge.

You MUST respond with valid JSON in this exact format:
{
  "score": 7,
  "feedback": "One concise sentence about what was strong or weak",
  "techniquesDetected": ["technique1", "technique2"]
}

Score from 1-10:
- 1-3: Weak, defensive, no technique used
- 4-5: Adequate but predictable
- 6-7: Good use of technique, could be sharper
- 8-9: Excellent tactical response
- 10: Masterful, textbook execution

Be honest and direct. If the response is empty or says TIME'S UP, score it 0.`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'generate') {
      const { sparringType, difficulty } = body;

      const typeDescriptions: Record<string, string> = {
        'Deflecting Manipulation': 'Someone is trying to manipulate the user using psychological tactics. The user must deflect without escalating.',
        'Objection Handling': 'A client, boss, or counterpart raises tough objections. The user must handle them tactically.',
        'Frame Wars': 'Two people competing for frame control. The user must assert or maintain their frame against strong opposition.',
        'Negotiation Pressure': 'High-pressure negotiation scenarios where someone is applying tactics against the user.',
        'Emotional Provocations': 'Someone is trying to provoke an emotional reaction. The user must stay composed and respond strategically.',
      };

      const ragContext = await searchKnowledge(
        `${sparringType} persuasion techniques tactical response`
      );
      const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT TECHNIQUE KNOWLEDGE:\n${ragContext}` : '';

      const timeLimit = difficulty === 'Advanced' ? 8 : 15;

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
          messages: [
            { role: 'system', content: GENERATE_SYSTEM_PROMPT + knowledgeContext },
            {
              role: 'user',
              content: `Generate 10 sparring rounds for: "${sparringType}"\n\nDescription: ${typeDescriptions[sparringType] || sparringType}\n\nDifficulty: ${difficulty} (${timeLimit}s per round). ${difficulty === 'Advanced' ? 'Make challenges especially tricky and layered.' : 'Keep challenges clear but still demanding.'}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', response.status, errorText);
        return NextResponse.json({ error: 'AI service error' }, { status: 502 });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
      }

      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    }

    if (action === 'grade') {
      const { challenge, userResponse, idealTechniques, timeUsed } = body;

      // RAG search for grading context
      const gradeRagContext = await searchKnowledge(
        `${challenge} ${idealTechniques?.join(' ') || ''} technique evaluation`
      );
      const gradeKnowledge = gradeRagContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT TECHNIQUE KNOWLEDGE FOR GRADING:\n${gradeRagContext}` : '';

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
          messages: [
            { role: 'system', content: GRADE_SYSTEM_PROMPT + gradeKnowledge },
            {
              role: 'user',
              content: `CHALLENGE: "${challenge}"\n\nUSER RESPONSE: "${userResponse || '[TIME EXPIRED - NO RESPONSE]'}"\n\nIDEAL TECHNIQUES: ${idealTechniques?.join(', ') || 'any'}\n\nTIME USED: ${timeUsed !== undefined ? `${timeUsed}s` : 'unknown'}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', response.status, errorText);
        return NextResponse.json({ error: 'AI service error' }, { status: 502 });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
      }

      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[SPARRING API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process sparring request.' },
      { status: 500 }
    );
  }
}
