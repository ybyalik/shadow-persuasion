import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { readScreenshot } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { decodeMessage, RELATIONS } from '@/lib/prompts/in-the-moment';

export const maxDuration = 60;

/**
 * Old "Defense" endpoint. The page now redirects to Decode a Message; this
 * route stays for anything still calling it and uses the same decode logic.
 * Body: { text?, image? (data URL), relation?, goal? }. Returns { result }.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    let text = typeof body?.text === 'string' ? body.text.trim() : '';
    const image = typeof body?.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';
    if (image) {
      const read = await readScreenshot({ userId: uid, feature: 'decode', imageDataUrl: image });
      text = [text, read].filter(Boolean).join('\n\n');
    }
    if (!text) return apiError('Paste the message you want to decode.', 400);
    const relation = (RELATIONS as readonly string[]).includes(body?.relation) ? body.relation : '';
    const goal = typeof body?.goal === 'string' ? body.goal.slice(0, 500) : '';

    const result = await decodeMessage({ userId: uid, feature: 'decode', text, relation, goal });
    if (!result) return apiError("We couldn't decode that one. Please try again.", 502, '[defense] invalid AI answer');
    return NextResponse.json({ result });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong while decoding. Please try again.', 500, '[defense]', err);
  }
}
