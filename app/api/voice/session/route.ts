import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';

/**
 * POST /api/voice/session
 *
 * Mints a short-lived ephemeral token for a browser to connect directly to
 * xAI's Grok Voice Agent realtime API, and builds the "opponent" persona the
 * AI will role-play. The real XAI_API_KEY never leaves the server.
 *
 * Provider is abstracted here so a different realtime voice vendor (OpenAI
 * Realtime, ElevenLabs) could be swapped in later without touching the client.
 */

const XAI_CLIENT_SECRETS_URL = 'https://api.x.ai/v1/realtime/client_secrets';

type Difficulty = 'easy' | 'medium' | 'hard';

const VOICES = ['eve', 'ara', 'rex', 'sal', 'leo'];

function buildInstructions(opts: {
  situation: string;
  counterpart: string;
  goal: string;
  difficulty: Difficulty;
  personSummary?: string;
}): string {
  const { situation, counterpart, goal, difficulty, personSummary } = opts;
  const toughness = {
    easy: 'You are fairly reasonable and open, though you still make the user work a little for it. Give ground when they make a good point.',
    medium: 'You push back realistically. You raise real objections, you are a little skeptical, and you do not give in easily, but a strong, well-reasoned case can move you.',
    hard: 'You are tough, guarded, and a little dismissive. You interrupt when the user rambles, you lowball or deflect, you use pressure and objections, and you only concede to a genuinely excellent, composed case. Never make it easy.',
  }[difficulty];

  const personBlock = personSummary
    ? `\n\nYOU ARE PLAYING A SPECIFIC REAL PERSON THE USER KNOWS. Embody these details, stay true to how they actually behave:\n${personSummary}`
    : '';

  return `You are role-playing a realistic practice partner for a high-stakes conversation. Stay fully in character as the OTHER person the user is talking to. This is a rehearsal so the user can practice out loud before the real thing.

WHO YOU ARE PLAYING: ${counterpart}
THE SITUATION: ${situation}
WHAT THE USER IS TRYING TO ACHIEVE (do NOT make this easy, and do not hand it to them): ${goal}

HOW YOU BEHAVE: ${toughness}${personBlock}

RULES:
- Speak like a real person in a real conversation: natural, spoken-length replies (usually one to three sentences), not essays.
- NEVER break character. Do not coach, do not explain tactics, do not mention that this is practice or that you are an AI. You ARE the other person.
- React to what the user actually says. If they are vague, press them. If they concede too early, take the win.
- Open the scene naturally as this person would, then let the user drive.
- Keep it grounded and realistic. No theatrics.`;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'not_configured', message: 'Voice practice is not set up yet.' },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const situation = String(body?.situation || '').trim() || 'A difficult conversation.';
    let counterpart = String(body?.counterpart || '').trim() || 'the other person';
    const goal = String(body?.goal || '').trim() || 'Get a better outcome than you would by default.';
    const difficulty: Difficulty = ['easy', 'medium', 'hard'].includes(body?.difficulty)
      ? body.difficulty
      : 'medium';
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

    const instructions = buildInstructions({ situation, counterpart, goal, difficulty, personSummary });

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
      console.error('[voice/session] xAI token mint failed', res.status);
      return apiError('Could not start voice practice. Please try again.', 502);
    }

    const data = await res.json();
    // The client secret field name can vary; pick it up defensively.
    const token: string | undefined =
      data?.value || data?.client_secret?.value || data?.client_secret || data?.secret;
    if (!token) {
      console.error('[voice/session] no token field in xAI response');
      return apiError('Could not start voice practice. Please try again.', 502);
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
    console.error('[voice/session]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}
