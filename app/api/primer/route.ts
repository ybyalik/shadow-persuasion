/**
 * "Steady your nerves" before a hard conversation (used by Plan a Conversation).
 * POST { situation, goal?, counterpart? } -> { result: { reframe, grounding, powerAnchor, mantra } }
 * The field names are kept for the page that calls this; the content is the
 * book's calm, defense-first voice (Chapters 7 and 21).
 */
import { BOOK } from '@/lib/edition';
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';

export const maxDuration = 30;

type Primer = { reframe: string; grounding: string; powerAnchor: string; mantra: string };

const SYSTEM = `You help a reader of the book ${BOOK.quoted} settle their nerves a few minutes before a hard conversation. The reader is a kind, accommodating person who tends to fold under pressure. This is about feeling steady, not about tactics or winning.

Reply with ONLY valid JSON in exactly this shape:
{
  "reframe": "2 or 3 short sentences that make the conversation feel smaller and more manageable. Remind them they only need to say what they mean, calmly, and that the other person's reaction belongs to the other person.",
  "grounding": "One concrete thing to do in the next minute. Prefer the book's calm-down breath: breathe in normally, then breathe out slowly and fully, making the exhale longer, two or three times.",
  "powerAnchor": "One sentence naming a real, fair reason they are allowed to ask for this (what they are owed, what is reasonable, a limit that is theirs to set).",
  "mantra": "A short, plain line to repeat as they walk in, under 12 words."
}

Rules: plain everyday English, short sentences, warm and steady. No hype, no exclamation marks, no em-dashes. Never suggest tricking, pressuring or manipulating the other person. If the situation suggests they are in danger (violence, threats, stalking), use "reframe" to say kindly that their safety comes first and that they can call the US National Domestic Violence Hotline at 1-800-799-7233 (text START to 88788).`;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const situation = String(body?.situation || '').trim().slice(0, 2000);
    const goal = String(body?.goal || '').trim().slice(0, 600);
    const counterpart = String(body?.counterpart || '').trim().slice(0, 120);
    if (!situation) return apiError('Tell me a little about the conversation first.', 400);

    const { data } = await aiChat<Primer>({
      userId: uid,
      feature: 'primer',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 450,
      json: true,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Coming up: a conversation with ${counterpart || 'someone'}.\nWhat it's about: ${situation}\nWhat I want: ${goal || 'to say what I mean and stay calm'}\nI'm nervous.` },
      ],
    });

    if (!data?.reframe || !data?.mantra) return apiError('We could not put that together just now. Please try again.', 502, '[primer] bad json');
    const clean = (s: unknown) => String(s || '').replace(/—/g, ', ').trim();
    const result: Primer = { reframe: clean(data.reframe), grounding: clean(data.grounding), powerAnchor: clean(data.powerAnchor), mantra: clean(data.mantra) };
    return NextResponse.json({ result });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not put that together just now. Please try again.', 500, '[primer]', err);
  }
}
