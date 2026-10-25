import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { HOTLINE, looksLikeDanger } from '@/lib/prompts/rehearse';
import { BOOK, IS_V3, KEY_CHAPTERS, chapterRef } from '@/lib/edition';

/**
 * POST /api/choice-check  (the Choice Check page, /app/choice-check)
 * An optional, calm reflection on the reader's answers to The Choice Check
 * (v3 book, Chapter 5): What happened? What am I assuming? What do I actually owe?
 * What options do I have?
 * Body: { happened, assuming, owe, options } -> { result: Reflection }
 * New edition only; on v2 it answers with a friendly "not available yet".
 */

export const maxDuration = 30;

export type ChoiceReflection = {
  safety: string | null;
  reflection: string;
  otherExplanations: string[];
  owe: string;
  moreOptions: string[];
  nextStep: string;
};

const SYSTEM = `You are a calm, warm companion inside the app for the book ${BOOK.quotedWithAuthor}. The reader just worked through The Choice Check (Chapter 5, Stay Steady Without Going Cold): four questions for when feelings race ahead of the facts. What happened? What am I assuming? What do I actually owe? What options do I have?

Reply with ONLY valid JSON in exactly this shape:
{
  "safety": <null, or if anything suggests fear, threats, physical harm, stalking, or control of their money or devices, one kind sentence saying that a checklist is not the answer here and their safety comes first>,
  "reflection": "<2 or 3 short sentences. Point out what is a fact and what is a story about someone's feelings or motives, using their own details>",
  "otherExplanations": ["<one other plain explanation for what happened>", "<a second one>"],
  "owe": "<one or two sentences separating what they may genuinely owe (a promise they made, a fair reply, an apology for something specific) from what they don't owe (whatever would stop the other person's discomfort)>",
  "moreOptions": ["<an option they did not list, including waiting where it fits>", "<another>"],
  "nextStep": "<one small, calm next step they could choose, or a short line they could send, word for word>"
}

Rules:
- Plain everyday English, grade 6 to 7, short sentences. Speak to them as "you". Warm and steady, never gushing, no exclamation marks, no em-dashes.
- Never diagnose anyone or label a personality ("narcissist", "toxic", "manipulator"). Talk about what people did, not what they are.
- Keep observation, interpretation and decision separate. A sigh is not proof.
- The choice is theirs. Offer options, don't order them. Never suggest tricking, punishing or getting back at anyone.
- No legal, medical or financial advice. If those come up, say a qualified person can help.
- Use only these capitalised tool names if you name one: The Power Map; The Good Person Contract; The Choice Check; Notice, Pause, Hold; The Clean Ask; The Smallest Agreed Step; The No-Agreement Plan; The Four Fair Influence Tests.
- If there is any sign of danger, fill "safety", keep the rest short and point toward getting safe and getting help, not toward a conversation.`;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    if (!IS_V3) return NextResponse.json({ error: 'This part of the app is coming soon.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const clip = (v: unknown) => String(v ?? '').trim().slice(0, 1200);
    const happened = clip(body?.happened);
    const assuming = clip(body?.assuming);
    const owe = clip(body?.owe);
    const options = clip(body?.options);
    if (!happened) {
      return NextResponse.json({ error: 'Start with what happened, then I can reflect on it with you.' }, { status: 400 });
    }

    const { data } = await aiChat<ChoiceReflection>({
      userId: uid,
      feature: 'choice-check',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 700,
      json: true,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `What happened: ${happened}\nWhat I'm assuming: ${assuming || '(not given)'}\nWhat I actually owe: ${owe || '(not given)'}\nMy options: ${options || '(not given)'}`,
        },
      ],
    });

    if (!data?.reflection) return apiError("I couldn't put a reflection together just now. Please try again.", 502, '[choice-check] bad AI output');

    const clean = (v: unknown) => String(v ?? '').replace(/\s*[—–]\s*/g, ', ').trim();
    const list = (v: unknown) => (Array.isArray(v) ? v.map(clean).filter(Boolean).slice(0, 3) : []);
    const result: ChoiceReflection = {
      safety: data.safety ? clean(data.safety) : null,
      reflection: clean(data.reflection),
      otherExplanations: list(data.otherExplanations),
      owe: clean(data.owe),
      moreOptions: list(data.moreOptions),
      nextStep: clean(data.nextStep),
    };

    // Always show real help when the words point to danger.
    if (result.safety || looksLikeDanger(`${happened} ${assuming} ${owe} ${options}`)) {
      result.safety = `${result.safety || 'Some of what you wrote sounds like it could be unsafe. Your safety comes first, and a checklist is not the answer for that.'} ${chapterRef(KEY_CHAPTERS.danger)} covers this. ${HOTLINE}`;
    }

    return NextResponse.json({ result });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("I couldn't put a reflection together just now. Please try again.", 500, '[choice-check]', err);
  }
}
