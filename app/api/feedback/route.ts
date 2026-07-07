import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

const SYSTEM_PROMPT = `${HANDLER_VOICE}
You are an expert persuasion coach analyzing feedback on advice that was given to a user. Based on whether the advice worked, partially worked, or failed, provide actionable analysis.

ROOT-CAUSE ANALYSIS FRAMEWORK:
Before providing feedback, classify the failure mode:
1. WRONG_TECHNIQUE: The technique chosen was not appropriate for this situation type. Identify what technique would have been better and why.
2. POOR_EXECUTION: The right technique was chosen but executed poorly (bad timing, too obvious, wrong tone, missing setup steps). Identify the specific execution error.
3. CONTEXT_MISMATCH: The technique was sound but the context changed (audience shifted, new information emerged, emotional state was misjudged).
4. RESISTANCE_UNDERESTIMATED: The target's resistance or counter-technique was not anticipated.

Respond in this exact JSON format:
{
  "failureMode": "WRONG_TECHNIQUE | POOR_EXECUTION | CONTEXT_MISMATCH | RESISTANCE_UNDERESTIMATED | N/A (if it worked)",
  "analysis": "Brief overall analysis of what happened, citing knowledge base sources",
  "whatWorked": "What aspects of the approach were effective (even if overall it failed)",
  "whatToImprove": "Specific things to change or improve next time, grounded in book knowledge",
  "adjustedApproach": "A concrete revised approach for next time with specific technique names and scripts",
  "recommendedReading": "Which book/technique from the knowledge base to study for this situation type"
}

Be specific and tactical. Reference psychological principles and cite sources from the knowledge base.`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Paid AI endpoint — require a logged-in user (cost abuse + IDOR).
    await requireAuth(req);

    const { type, referenceId, originalAdvice, outcome, notes } = await req.json();

    if (!originalAdvice || !outcome) {
      return apiError('Missing required fields.', 400);
    }

    // Search for relevant knowledge to improve the advice
    const ragContext = await searchKnowledge(
      `${originalAdvice} ${outcome === 'failed' ? 'what went wrong' : 'improvement'}`,
      { threshold: 0.35, count: 3 }
    );

    const userMessage = `FEATURE TYPE: ${type || 'general'}
ORIGINAL ADVICE GIVEN: "${originalAdvice}"
OUTCOME: ${outcome}
${notes ? `USER NOTES: "${notes}"` : ''}
${ragContext ? `\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE:\n${ragContext}` : ''}

Analyze this outcome and provide specific improvement suggestions.`;

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
      return apiError('AI service is unavailable right now. Please try again.', 502, '[FEEDBACK]', `OpenRouter ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      // Return the feedback data so the client can save it
      return NextResponse.json({
        ...result,
        feedbackRecord: {
          id: crypto.randomUUID(),
          type,
          referenceId,
          originalAdvice,
          outcome,
          notes,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (parseError) {
      return apiError('AI returned an invalid response. Please try again.', 502, '[FEEDBACK]', parseError);
    }
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Failed to process feedback.', 500, '[FEEDBACK]', error);
  }
}
