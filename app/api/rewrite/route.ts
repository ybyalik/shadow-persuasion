import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { searchKnowledge } from '@/lib/rag';
import { getVoiceProfile } from '@/lib/voice-profile';
import { normalizeRewrite, REWRITE_PROMPT } from '@/lib/prompts/in-the-moment';

export const maxDuration = 60;

/**
 * Calm My Reply. Body: { draft, replyingTo? } (older callers may send { message }).
 * Returns { versions: [{ style, text, changed }], flags: [{ kind, note }] }.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const draft = String(body?.draft ?? body?.message ?? '').trim().slice(0, 3000);
    const replyingTo = String(body?.replyingTo ?? '').trim().slice(0, 3000);
    if (!draft) return apiError('Type the reply you want to send first.', 400);

    const [voice, knowledge] = await Promise.all([
      getVoiceProfile(uid),
      searchKnowledge(`${draft} apologizing over-explaining sounding small boundary`, { count: 3 }),
    ]);

    const system =
      REWRITE_PROMPT +
      voice +
      (knowledge ? `\n\nPassages from the book that may help (use the ideas, don't quote them):\n${knowledge}` : '');
    const user = `${replyingTo ? `The message they are answering:\n"""\n${replyingTo}\n"""\n\n` : ''}The reply they want to send (their draft):\n"""\n${draft}\n"""`;

    const { data } = await aiChat({
      userId: uid,
      feature: 'rewrite',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 2000,
      json: true,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    const result = normalizeRewrite(data);
    if (!result) return apiError("We couldn't rewrite that one. Please try again.", 502, '[rewrite] invalid AI answer');
    return NextResponse.json(result);
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[rewrite]', err);
  }
}
