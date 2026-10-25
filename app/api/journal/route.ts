/**
 * The 21-Day Reset journal: a short, calm reflection on the note someone wrote
 * for a reset step (MODELS.fast). Saved with the note so it shows again later.
 *
 * POST { day } -> { reflection }   (the note must be saved first via /api/missions)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { RESET_TOTAL } from '@/lib/progress';
import { BOOK, RESET, byEdition } from '@/lib/edition';

export const maxDuration = 30;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const HOTLINE =
  'If someone is hurting you, threatening you, or you feel unsafe, please reach out: the National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788. You do not have to handle this alone.';

const DANGER = /\b(hit|hits|hitting|punch|slap|chok|strangl|hurt me|hurts me|threaten|stalk|kill|weapon|gun|knife|afraid for my (life|safety)|scared for my (life|safety)|abus|violent|unsafe)/i;

const SYSTEM = `You are a calm, warm companion inside the app for the book ${BOOK.quotedWithAuthor}. ${byEdition({
  v2: "The reader is doing the book's 21-Day Reset: small daily drills that help kind, accommodating people notice pressure, pause before answering, and hold their ground calmly.",
  v3: "The reader is doing the book's 21-Day Power Reset (Part VII): small daily practices that follow Notice, Pause, Hold (see the pattern, make room to choose, follow through), so kind, reliable people get more say in their own lives.",
})}

They just wrote their evening journal note for today's step. Write a short reflection back to them.

Rules:
- 2 to 3 sentences, plain everyday English, short sentences. Speak to them as "you".
- Never gushing. No "amazing", "incredible", "proud of you", no exclamation marks.
- Point out one pattern they might notice in what they wrote (for example: the fear was bigger than what happened, the same person keeps showing up, they caught it sooner than before, an apology slipped in, the guilt faded faster). Use their own details.
- ${byEdition({
  v2: 'If the drill went badly or they skipped it, be kind and matter-of-fact. The book says a bad day written down honestly teaches more than a perfect week.',
  v3: "If the practice went badly or they skipped it, be kind and matter-of-fact. The book asks for two lines every evening, even on a bad day, because the record shows progress you can't feel day to day. Missed days are fine: they pick up where they left off.",
})}
- Defense first. Never suggest manipulating, tricking or getting back at anyone.
- No em-dashes. Use commas or periods.
- Not therapy, and never claim to be.
- If the note suggests they are in danger (violence, threats, stalking), say so kindly and mention the US National Domestic Violence Hotline, 1-800-799-7233 (text START to 88788).
Output only the reflection text.`;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const day = Number(body?.day);
    if (!Number.isInteger(day) || day < 1 || day > RESET_TOTAL) return apiError('Please pick a day of the reset.', 400);

    const [{ data: step }, { data: entry }] = await Promise.all([
      db.from(RESET.daysTable).select('label, title, drill, journal_prompts').eq('day_number', day).maybeSingle(),
      db.from(RESET.progressTable).select('note').eq('user_id', uid).eq('day_number', day).maybeSingle(),
    ]);
    if (!step) return apiError('We could not find that day of the reset.', 404);
    const note = (entry?.note || '').trim();
    if (!entry || note.length < 10) return apiError('Write a few lines about how it went first, then ask for a reflection.', 400);

    const prompts = ((step.journal_prompts as string[]) || []).map((p) => `- ${p}`).join('\n');
    const { text } = await aiChat({
      userId: uid,
      feature: 'reset:reflect',
      model: MODELS.fast,
      temperature: 0.5,
      maxTokens: 220,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Today's step: ${step.label}, "${step.title}"\nThe drill: ${step.drill}\nJournal questions:\n${prompts}\n\nTheir note:\n"""${note.slice(0, 4000)}"""`,
        },
      ],
    });

    let reflection = text.replace(/—/g, ', ').replace(/\s+,/g, ',').trim();
    if (!reflection) return apiError('We could not write a reflection just now. Please try again.', 502);
    if (DANGER.test(note) && !reflection.includes('799-7233')) reflection += `\n\n${HOTLINE}`;

    await db
      .from(RESET.progressTable)
      .update({ reflection, updated_at: new Date().toISOString() })
      .eq('user_id', uid)
      .eq('day_number', day);

    return NextResponse.json({ reflection });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not write a reflection just now. Your note is saved.', 500, '[reset:reflect]', err);
  }
}
