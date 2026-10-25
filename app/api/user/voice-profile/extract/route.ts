import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { uid: userId } = await requireAppUser(req);

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Guard against cost abuse: only accept real images, and cap the size.
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That image is too large. Please upload one under 10 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

    const { text } = await aiChat({
      userId,
      feature: 'voice-profile',
      model: MODELS.fast,
      temperature: 0,
      maxTokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ONLY the text that was written by the user (the sender) in this screenshot of a message, email, text conversation or DM. It is used to learn how this person writes.

Rules:
- Only the messages the user sent, not what others said to them.
- Keep their exact wording, punctuation, capitalization and emoji.
- If you cannot tell who the sender is, extract all text.
- Return only the extracted text, with no labels or commentary.`,
            },
            { type: 'image_url', image_url: { url: base64 } },
          ],
        },
      ],
    });
    const extractedText = text.trim();

    return NextResponse.json({ extractedText });
  } catch (error) {
    const f = passthroughAuthError(error);
    if (f) return f;
    return apiError("We couldn't read that image. Please try another one.", 500, '[VOICE_EXTRACT]', error);
  }
}
