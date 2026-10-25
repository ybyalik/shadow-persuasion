import { NextRequest } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiStream, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { followupPrompt, type DecodeResult } from '@/lib/prompts/in-the-moment';

export const maxDuration = 60;

/**
 * Follow-up questions about a decoded message.
 * Body: { originalText, result, messages: [{ role: 'user'|'assistant', content }] }.
 * Streams the answer back as plain text.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const originalText = String(body?.originalText || '');
    const result = (body?.result && typeof body.result === 'object' ? body.result : null) as Partial<DecodeResult> | null;
    const messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: { role?: string; content?: unknown }) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
      .slice(-10)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return apiError('Type your question first.', 400);
    }

    const stream = await aiStream({
      userId: uid,
      feature: 'decode:followup',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 500,
      messages: [{ role: 'system', content: followupPrompt(originalText, result) }, ...messages],
    });

    const encoder = new TextEncoder();
    const out = new ReadableStream({
      async start(controller) {
        try {
          for await (const piece of stream) controller.enqueue(encoder.encode(piece.replace(/\s*[—–]\s*/g, ', ')));
        } catch (e) {
          console.error('[decode:followup] stream', e);
          controller.enqueue(encoder.encode('\n\n(Sorry, the answer was cut off. Please ask again.)'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[decode:followup]', err);
  }
}
