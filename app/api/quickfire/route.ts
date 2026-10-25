import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { searchKnowledge } from '@/lib/rag';
import { HOTLINE, VOICE } from '@/lib/prompts/practice';
import { BOOK, PRESSURE_FAMILIES } from '@/lib/edition';

export const maxDuration = 30;

/**
 * Fast help for a live moment: "they just said X, what do I say?"
 * POST { situation, context? } -> three calm replies, one thing to avoid, and
 * what to say if they push back. Response shape kept for the Talk It Through page.
 * (Quick Reps for Practice Scenes live at /api/quickfire/reps.)
 */
const SYSTEM = `You help a reader of the book ${BOOK.quoted} answer someone who is pressuring them, right now. They need words in seconds.
${VOICE}
Name the pressure (use the book's chapter names: ${PRESSURE_FAMILIES.join(', ')}, or "Not really pressure" if it's just a hard moment).
Give three short calm replies in different tones, one thing not to say, and three "if they say / you say" follow-ups. Every reply stays kind and holds the user's position. Never suggest tricks, guilt or pressure back.
If the situation suggests danger (violence, threats, stalking), put this in "avoid": "If you feel unsafe, step away and get support. ${HOTLINE}"
Return JSON only:
{"responses": [{"approach": "Short and kind", "sayThis": "...", "why": "one plain sentence", "riskLevel": "LOW"}, {"approach": "Firm and clear", ...}, {"approach": "Warm, with a question", ...}],
 "avoid": "one thing not to say and why",
 "scenarios": [{"ifTheySay": "...", "thenSay": "...", "why": "..."}, {...}, {...}],
 "classification": "the chapter name of the pressure",
 "technique": "the name of the tactic, in plain words"}
riskLevel means how likely the reply is to start a bigger argument: LOW, MEDIUM or HIGH.`;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const situation = String(body.situation ?? '').trim().slice(0, 1500);
    const context = String(body.context ?? '').trim().slice(0, 500);
    if (!situation) return NextResponse.json({ error: 'Tell us what they said first.' }, { status: 400 });

    const book = await searchKnowledge(situation, { count: 3 });
    const { data } = await aiChat<Record<string, unknown>>({
      userId: uid,
      feature: 'quickfire',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 1200,
      json: true,
      messages: [
        { role: 'system', content: SYSTEM + (book ? `\n\nFROM THE BOOK (use its ideas and wording where they fit):\n${book}` : '') },
        { role: 'user', content: context ? `WHAT HAPPENED: ${situation}\n\nWHO THIS IS: ${context}` : `WHAT HAPPENED: ${situation}` },
      ],
    });
    if (!data || !Array.isArray(data.responses)) {
      return apiError("We couldn't put an answer together. Please try again.", 502, '[quickfire] bad json');
    }
    return NextResponse.json(JSON.parse(JSON.stringify(data).replace(/—/g, ', ')));
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't put an answer together. Please try again.", 500, '[quickfire]', err);
  }
}
