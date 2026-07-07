import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export const maxDuration = 60;

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

const FEEDBACK_SYSTEM_PROMPT = `You are a sharp, supportive conversation coach. The user just finished a spoken role-play rehearsal for a real high-stakes conversation. You are given the transcript (their words and the other person's). Give them a short, useful debrief.

Judge only from what was actually SAID. Look for: hedging and apologizing ("sorry", "just", "I was wondering if maybe"), filler words, caving too early, whether they held their goal/number, whether they asked for what they wanted clearly, and moments that landed well.

Respond with ONLY valid JSON in exactly this shape:
{
  "score": <integer 0-100, overall how well they did>,
  "headline": "<one plain-English sentence summarizing how it went>",
  "wins": ["<specific thing they did well>", "..."],
  "improvements": ["<specific, actionable thing to change next time>", "..."],
  "languageFlags": [
    { "quote": "<short phrase they actually said>", "issue": "<e.g. 'hedging', 'apologizing', 'undercut your ask'>", "betterVersion": "<a stronger way to say it>" }
  ],
  "nextTime": "<one crisp sentence: the single most important thing to do differently>"
}

Keep everything short and jargon-free. wins/improvements: 2-4 items each. languageFlags: 0-4 of the most useful. If the transcript is too short to judge, say so in headline and keep arrays small.`;

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const transcript: Array<{ role: string; text: string }> = Array.isArray(body?.transcript)
      ? body.transcript
      : [];
    const situation = String(body?.situation || '').trim();
    const goal = String(body?.goal || '').trim();
    const delivery = body?.delivery && typeof body.delivery === 'object' ? body.delivery : null;

    const userTurns = transcript.filter((t) => t.role === 'user' && t.text?.trim()).length;
    if (userTurns === 0) {
      return NextResponse.json(
        { error: 'There was nothing to review, it looks like you did not speak. Try again.' },
        { status: 400 }
      );
    }

    const convo = transcript
      .map((t) => `${t.role === 'user' ? 'YOU' : 'THEM'}: ${t.text}`)
      .join('\n')
      .slice(0, 8000);

    let deliveryLine = '';
    if (delivery) {
      const bits: string[] = [];
      if (delivery.wpm) bits.push(`spoke at about ${delivery.wpm} words per minute`);
      if (typeof delivery.talkRatioPct === 'number') bits.push(`talked ${delivery.talkRatioPct}% of the time`);
      if (typeof delivery.pauses === 'number') bits.push(`used ${delivery.pauses} clear pauses`);
      if (typeof delivery.steadiness === 'string') bits.push(`voice sounded ${delivery.steadiness} (a shaky voice usually means nerves)`);
      if (bits.length) deliveryLine = `\n\nDELIVERY (from the audio, factor this into your feedback: a fast pace often signals nerves; talking well over ~60% means not listening enough; too few pauses reads as rushed): the user ${bits.join(', ')}.`;
    }

    const context = `Situation: ${situation || 'not specified'}\nYour goal: ${goal || 'not specified'}${deliveryLine}\n\nTranscript:\n${convo}`;

    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
          { role: 'user', content: context },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[voice/feedback] LLM error', res.status);
      return apiError('Could not build your debrief. Please try again.', 502);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let result;
    try {
      result = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      console.error('[voice/feedback] JSON parse failed');
      return apiError('Could not build your debrief. Please try again.', 502);
    }

    return NextResponse.json({ result });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    console.error('[voice/feedback]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
