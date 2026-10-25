import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { DEBRIEF_CHAPTERS, DEBRIEF_DEFAULT_CHAPTER, DEBRIEF_PROMPT } from '@/lib/prompts/rehearse';

/**
 * POST /api/voice/feedback  ("Rehearse It" debrief, for typed and voice practice)
 * Body: { transcript: [{ role: 'user'|'assistant', text }], counterpart?, situation, goal, difficulty?, delivery? }
 * -> { result: Debrief }
 */

export const maxDuration = 60;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Debrief = {
  headline: string;
  didWell: string[];
  gaveGround: { quote: string; what: string; tryInstead: string }[];
  nextTime: string;
  holdRating: number;
  bookChapter?: number;
  bookRef?: { chapter: number; title: string };
};

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);

    const body = await req.json().catch(() => ({}));
    const transcript: Array<{ role: string; text: string }> = Array.isArray(body?.transcript) ? body.transcript : [];
    const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
    const counterpart = clip(body?.counterpart, 200);
    const situation = clip(body?.situation, 1500);
    const goal = clip(body?.goal, 800);
    const difficulty = clip(body?.difficulty, 20);
    const delivery = body?.delivery && typeof body.delivery === 'object' ? body.delivery : null;

    const userTurns = transcript.filter((t) => t?.role === 'user' && typeof t.text === 'string' && t.text.trim()).length;
    if (userTurns === 0) {
      return NextResponse.json({ error: "There's nothing to review yet. Say at least one thing, then end the practice." }, { status: 400 });
    }

    const them = counterpart || 'THEM';
    const convo = transcript
      .filter((t) => typeof t?.text === 'string' && t.text.trim())
      .map((t) => `${t.role === 'user' ? 'YOU' : them.toUpperCase()}: ${t.text.trim()}`)
      .join('\n')
      .slice(-9000);

    let deliveryLine = '';
    if (delivery) {
      const bits: string[] = [];
      if (typeof delivery.wpm === 'number') bits.push(`spoke at about ${delivery.wpm} words per minute`);
      if (typeof delivery.talkRatioPct === 'number') bits.push(`talked ${delivery.talkRatioPct}% of the time`);
      if (typeof delivery.pauses === 'number') bits.push(`used ${delivery.pauses} clear pauses`);
      if (typeof delivery.steadiness === 'string') bits.push(`voice sounded ${delivery.steadiness}`);
      if (bits.length)
        deliveryLine = `\n\nFrom the audio (they practiced out loud): the user ${bits.join(', ')}. A fast pace or few pauses often means nerves; talking far more than the other person often means over-explaining.`;
    }

    const context = `Who they practiced with: ${counterpart || 'the other person'}
What it was about: ${situation || 'not given'}
What they wanted: ${goal || 'not given'}
How hard the other person pushed: ${difficulty || 'realistic'}${deliveryLine}

Transcript:
${convo}`;

    const { data } = await aiChat<Debrief>({
      userId: uid,
      feature: 'spar:debrief',
      model: MODELS.smart,
      temperature: 0.4,
      maxTokens: 1500,
      json: true,
      messages: [
        { role: 'system', content: DEBRIEF_PROMPT },
        { role: 'user', content: context },
      ],
    });

    if (!data || !data.headline) {
      return apiError("I couldn't put your debrief together just now. Please try again.", 502, '[spar:debrief] bad AI output');
    }

    const rating = Math.min(5, Math.max(1, Math.round(Number(data.holdRating) || 3)));
    const chapter = DEBRIEF_CHAPTERS[Number(data.bookChapter)] ? Number(data.bookChapter) : DEBRIEF_DEFAULT_CHAPTER;
    const result: Debrief = {
      headline: data.headline,
      didWell: Array.isArray(data.didWell) ? data.didWell.slice(0, 3) : [],
      gaveGround: Array.isArray(data.gaveGround) ? data.gaveGround.slice(0, 3) : [],
      nextTime: data.nextTime || '',
      holdRating: rating,
      bookRef: { chapter, title: DEBRIEF_CHAPTERS[chapter] },
    };

    // Count it on My Progress. A failed save must not cost the person their debrief.
    const { error: saveError } = await db.from('practice_results').insert({
      user_id: uid,
      type: 'rehearsal',
      reference_id: null,
      score: rating,
      xp_earned: 0,
      techniques_used: [],
      feedback: {
        heldGround: rating >= 4,
        rating,
        difficulty: difficulty || 'realistic',
        mode: delivery ? 'voice' : 'text',
        counterpart: counterpart || null,
        headline: result.headline,
        bookChapter: chapter,
      },
    });
    if (saveError) console.error('[spar:debrief] practice_results insert failed', saveError);

    return NextResponse.json({ result });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("I couldn't put your debrief together just now. Please try again.", 500, '[spar:debrief]', err);
  }
}
