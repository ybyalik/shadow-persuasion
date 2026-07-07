import { NextRequest } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getVoiceProfile } from '@/lib/voice-profile';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const voiceContext = await getVoiceProfile(userId);

    const { originalText, analysisResult, context, messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return apiError('Messages are required.', 400);
    }

    // Build analysis summary for system prompt
    const analysisSummary = [
      `Threat Score: ${analysisResult?.threatScore ?? 'N/A'}/10`,
      `Power Dynamics: You ${analysisResult?.powerDynamics?.yourPower}/10, They ${analysisResult?.powerDynamics?.theirPower}/10`,
      `Communication Style: ${analysisResult?.communicationStyle?.sensoryPreference}, Emotional State: ${analysisResult?.communicationStyle?.emotionalState}, Receptivity: ${analysisResult?.communicationStyle?.receptivity}%`,
      analysisResult?.tactics?.length > 0
        ? `Tactics Detected: ${analysisResult.tactics.map((t: any) => `${t.tactic} (${t.category})`).join(', ')}`
        : 'No manipulation tactics detected',
      analysisResult?.techniques_identified?.length > 0
        ? `Techniques: ${analysisResult.techniques_identified.join(', ')}`
        : '',
      `Overall Assessment: ${analysisResult?.overallAssessment || 'N/A'}`,
      analysisResult?.responseOptions?.length > 0
        ? `Suggested Responses: ${analysisResult.responseOptions.map((r: any) => `${r.type}: "${r.message}"`).join(' | ')}`
        : '',
    ].filter(Boolean).join('\n');

    // RAG search using the follow-up question
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const searchQuery = lastUserMsg ? `${lastUserMsg.content} conversation analysis strategic advice` : '';
    const ragContext = searchQuery ? await searchKnowledge(searchQuery, { threshold: 0.32 }) : '';

    const systemPrompt = `You are an expert conversation analyst and strategic communication coach. You previously analyzed a conversation and the user wants to explore the analysis further.

ORIGINAL CONVERSATION TEXT:
${originalText || '(not provided)'}

ANALYSIS RESULTS:
${analysisSummary}
${context ? `\nUSER'S CONTEXT: ${context}` : ''}

Your role:
- Answer questions about this specific conversation
- Suggest what to say and predict likely responses
- Provide strategic guidance, exact scripts, and alternative approaches
- Explain psychological dynamics at play
- Help the user navigate this conversation effectively

Be direct, tactical, and specific. Provide exact wording when suggesting responses. Consider power dynamics and manipulation risks in your advice.${voiceContext}${ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE CONTEXT:\n${ragContext}` : ''}`;

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
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return apiError('AI service is unavailable right now. Please try again.', 502, '[ANALYZE_FOLLOWUP]', `OpenRouter ${response.status}: ${errorText}`);
    }

    // Stream through to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const authFail = passthroughAuthError(error);
    if (authFail) return authFail;
    return apiError('Failed to process follow-up request.', 500, '[ANALYZE_FOLLOWUP]', error);
  }
}
