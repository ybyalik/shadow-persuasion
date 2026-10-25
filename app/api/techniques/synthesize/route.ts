import { BOOK } from '@/lib/edition';
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { getTactic, HOTLINE, VOICE } from '@/lib/prompts/practice';

export const maxDuration = 30;

type Fit = { read?: string; reply?: string; tip?: string; safety?: boolean };

/**
 * "Fit it to my situation" on a tactic's page.
 * POST { slug, situation } -> { read, reply, tip, safety }
 * Shapes the book's calm reply for this tactic to the person's own situation.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const tactic = await getTactic(String(body.slug ?? ''));
    const situation = String(body.situation ?? '').trim().slice(0, 1500);
    if (!tactic) return NextResponse.json({ error: 'Please pick a tactic.' }, { status: 400 });
    if (situation.length < 10) return NextResponse.json({ error: 'Tell us a little about what happened first.' }, { status: 400 });

    const { data } = await aiChat<Fit>({
      userId: uid,
      feature: 'spot:fit',
      model: MODELS.fast,
      temperature: 0.4,
      maxTokens: 500,
      json: true,
      messages: [
        {
          role: 'system',
          content: `You help a reader of the book ${BOOK.quoted} answer a pressure tactic calmly in their own situation.
${VOICE}
The tactic: ${tactic.name} (Chapter ${tactic.chapter}, ${tactic.chapter_title}).
What it looks like: ${tactic.looks_like}
What it's for: ${tactic.purpose}
The book's calm reply: "${tactic.calm_reply}"${tactic.note ? `\nThe book adds: ${tactic.note}` : ''}

Read the user's situation. Say in one or two sentences whether this tactic seems to be happening (if it looks like a different pattern, or just a bad moment, say so gently). Then give ONE calm reply in the same shape as the book's, fitted to their situation, under 30 words. Then one short tip.
If the situation suggests danger (violence, threats, stalking, fear for their safety), set "safety" to true and say so kindly in "read".
Return JSON: {"read": "...", "reply": "...", "tip": "...", "safety": false}`,
        },
        { role: 'user', content: situation },
      ],
    });

    if (!data?.reply) return apiError("We couldn't put that together. Please try again.", 502, '[techniques/synthesize] empty');
    const clean = (s?: string) => String(s ?? '').replace(/—/g, ', ').trim();
    return NextResponse.json({
      read: clean(data.read),
      reply: clean(data.reply),
      tip: clean(data.tip),
      safety: !!data.safety,
      hotline: data.safety ? HOTLINE : null,
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't put that together. Please try again.", 500, '[techniques/synthesize]', err);
  }
}
