import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Paid AI endpoint — require a logged-in user (cost abuse).
    await requireAuth(req);

    const body = await req.json();
    const { action } = body;

    if (action === 'grade') {
      return handleGrade(body);
    }

    return apiError('Unknown action.', 400);
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Something went wrong. Please try again.', 500, '[MISSIONS]', error);
  }
}

async function handleGrade(body: any) {
  const { mission, completion } = body;

  if (!mission || !completion) {
    return apiError('Mission and completion details are required.', 400);
  }

  // RAG search for the mission's technique
  const ragContext = await searchKnowledge(
    `${mission.technique} technique application execution examples`,
    { count: 4 }
  );

  const systemPrompt = `${HANDLER_VOICE}
You are an elite influence and persuasion coach grading a student's completion of a daily mission. Be encouraging but honest.

The mission was:
Title: ${mission.title}
Description: ${mission.description}
Technique: ${mission.technique}
Difficulty: ${mission.difficulty}
Max XP: ${mission.xpReward}

${ragContext ? `${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE — USE THIS TO EVALUATE TECHNIQUE EXECUTION:\n${ragContext}\n` : ''}

GRADING RUBRIC:
- A+/A: Used the technique correctly AND adapted it creatively. Shows deep understanding.
- B+/B: Used the technique correctly but mechanically. Textbook execution.
- C+/C: Attempted but with execution errors (wrong timing, too obvious, missed setup).
- D: Misidentified when/how to use the technique.
- F: Did not attempt or completely wrong approach.

Respond with a JSON object containing exactly these keys:
- "grade": A letter grade (A+/A/B+/B/C+/C/D/F)
- "feedback": 2-3 sentences of specific, tactical feedback on their execution. Reference specific concepts from the knowledge base.
- "xpEarned": A number between 0 and ${mission.xpReward} based on how well they did. A+ = full XP, F = 0. Factor in the self-reported outcome.
- "insight": One sentence of deeper insight or a tip for next time, citing a source from the knowledge base if applicable
- "techniqueAccuracy": "correct_and_creative" | "correct_but_mechanical" | "attempted_with_errors" | "misapplied" | "not_attempted"`;

  const userContent = `MISSION COMPLETION REPORT:
What happened: ${completion.whatHappened}
Did it work? ${completion.didItWork}
Notes: ${completion.notes || 'None'}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
      'X-Title': 'Shadow Persuasion',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return apiError('AI service is unavailable right now. Please try again.', 502, '[MISSIONS]', `OpenRouter ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch {
    return apiError('AI returned an invalid response. Please try again.', 502, '[MISSIONS]', content?.slice?.(0, 200));
  }
}
