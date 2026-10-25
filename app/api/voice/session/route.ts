import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { assertWithinBudget } from '@/lib/ai';
import { buildRehearsePersona, parseDifficulty } from '@/lib/prompts/rehearse';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';

/**
 * POST /api/voice/session
 *
 * Mints a short-lived ephemeral token for a browser to connect directly to
 * xAI's Grok Voice Agent realtime API, and builds the persona of the other
 * person the AI plays in "Rehearse It" (voice mode).
 * The real XAI_API_KEY never leaves the server.
 *
 * Provider is abstracted here so a different realtime voice vendor (OpenAI
 * Realtime, ElevenLabs) could be swapped in later without touching the client.
 */

const XAI_CLIENT_SECRETS_URL = 'https://api.x.ai/v1/realtime/client_secrets';

const VOICES = ['eve', 'ara', 'rex', 'sal', 'leo'];

export async function POST(req: NextRequest) {
  try {
    const { uid: userId } = await requireAppUser(req);
    // Voice goes straight to xAI (not through aiChat), so check the spend cap here.
    await assertWithinBudget(userId);

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'not_configured', message: 'Practicing out loud is not available right now. You can practice by typing instead.' },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const situation = String(body?.situation || '').trim().slice(0, 1500) || 'A hard conversation.';
    let counterpart = String(body?.counterpart || '').trim().slice(0, 200) || 'the other person';
    const goal = String(body?.goal || '').trim().slice(0, 800) || 'Say what they need calmly and not take it back.';
    const difficulty = parseDifficulty(body?.difficulty);
    const voice = VOICES.includes(body?.voice) ? body.voice : 'eve';
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    // If a saved person was picked, make the AI play that specific person.
    let personSummary: string | undefined;
    if (personId) {
      const person = await getPersonContext(userId, personId);
      if (person) {
        counterpart = person.name;
        personSummary = person.summary;
      }
    }

    const instructions = buildRehearsePersona({ situation, counterpart, goal, difficulty, personSummary, spoken: true });

    // Mint the ephemeral token. Max session 300s keeps cost bounded (~$0.25).
    const res = await fetch(XAI_CLIENT_SECRETS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_after: { seconds: 300 } }),
    });

    if (!res.ok) {
      return apiError("Couldn't start voice practice. You can practice by typing instead.", 502, '[voice/session] token mint failed', res.status);
    }

    const data = await res.json();
    // The client secret field name can vary; pick it up defensively.
    const token: string | undefined =
      data?.value || data?.client_secret?.value || data?.client_secret || data?.secret;
    if (!token) {
      return apiError("Couldn't start voice practice. You can practice by typing instead.", 502, '[voice/session] no token field');
    }

    return NextResponse.json({
      token,
      model: 'grok-voice-latest',
      wsUrl: 'wss://api.x.ai/v1/realtime',
      voice,
      instructions,
      maxSeconds: 300,
    });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError("Couldn't start voice practice. You can practice by typing instead.", 500, '[voice/session]', err);
  }
}
