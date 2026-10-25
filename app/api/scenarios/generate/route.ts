import { BOOK, IS_V3 } from '@/lib/edition';
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { getTactic, getTactics, HOTLINE, practiceDb as db, SCENE_COLS, VOICE } from '@/lib/prompts/practice';

export const maxDuration = 30;

type Gen = {
  safety?: boolean;
  title?: string;
  other_person?: string;
  description?: string;
  objective?: string;
  opening_line?: string;
  tactic_slug?: string;
};

/**
 * "Make a scene from my situation": turns what the person describes into a
 * private practice scene they can play right away.
 * POST { situation, difficulty?: 1|2|3 } -> { scene } or { safety: true, message }
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const situation = String(body.situation ?? '').trim().slice(0, 1500);
    const difficulty = [1, 2, 3].includes(Number(body.difficulty)) ? Number(body.difficulty) : 2;
    if (situation.length < 15) {
      return NextResponse.json({ error: 'Tell us a bit more: who is it, and what do they usually say?' }, { status: 400 });
    }

    // On the new edition, danger signs are never turned into practice scenes (they point to Chapter 11 and help instead).
    const tactics = (await getTactics()).filter((t) => !IS_V3 || !t.safety);
    const list = tactics.map((t) => `${t.slug}: ${t.name} (Ch ${t.chapter})`).join('\n');

    const { data } = await aiChat<Gen>({
      userId: uid,
      feature: 'scene:generate',
      model: MODELS.fast,
      temperature: 0.6,
      maxTokens: 700,
      json: true,
      messages: [
        {
          role: 'system',
          content: `You turn a real situation into a short practice scene for a self-help app based on the book ${BOOK.quoted}. The user will practice answering calmly while the AI plays the other person.
${VOICE}
The user's goal is always fair and defensive: hold a limit, say no kindly, ask for what they're owed, or stay steady. If the user asks to practice manipulating, tricking or controlling someone, turn it into the fair version (being heard, asking clearly).
If the situation suggests real danger (violence, threats, stalking, fear for safety), return {"safety": true} and nothing else.
Pick the ONE tactic from this list that best fits what the other person does:
${list}
Return JSON:
{"safety": false,
 "title": "short title, 3 to 6 words",
 "other_person": "who they are, e.g. 'Your sister, Megan'",
 "description": "2 sentences setting the scene in second person",
 "objective": "one sentence: what the user is practicing",
 "opening_line": "the first thing the other person says, in their voice, 1 to 2 sentences",
 "tactic_slug": "slug from the list"}`,
        },
        { role: 'user', content: situation },
      ],
    });

    if (data?.safety) {
      return NextResponse.json({
        safety: true,
        message: `This sounds like it may not be safe, and that matters more than practice. Please reach out for support. ${HOTLINE}`,
      });
    }
    if (!data?.title || !data.opening_line || !data.description) {
      return apiError("We couldn't build that scene. Please try again.", 502, '[scenarios/generate] bad json');
    }

    const picked = await getTactic(String(data.tactic_slug ?? ''));
    const tactic = picked && tactics.some((t) => t.slug === picked.slug) ? picked : null;
    const clean = (s?: string) => String(s ?? '').replace(/—/g, ', ').trim();
    const slug = clean(data.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'scene';
    const row = {
      id: `mine-${slug}-${crypto.randomUUID().slice(0, 8)}`,
      title: clean(data.title).slice(0, 80),
      category: 'My situation',
      difficulty,
      description: clean(data.description).slice(0, 600),
      objective: clean(data.objective).slice(0, 300) || 'Stay calm and hold your answer.',
      techniques: tactic ? [tactic.name] : [],
      is_generated: true,
      source_books: [BOOK.title],
      is_book: false,
      user_id: uid,
      chapter: tactic?.chapter ?? null,
      chapter_title: tactic?.chapter_title ?? null,
      tactic_slug: tactic?.slug ?? null,
      other_person: clean(data.other_person).slice(0, 80) || 'The other person',
      opening_line: clean(data.opening_line).slice(0, 400),
    };
    const { data: saved, error } = await db.from('scenarios').insert(row).select(SCENE_COLS).single();
    if (error) throw error;
    return NextResponse.json({ scene: saved });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't build that scene. Please try again.", 500, '[scenarios/generate]', err);
  }
}
