import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-api';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ONLY the text that was written by the user/sender in this screenshot. This is a message, email, text conversation, or DM. I need to learn this person's writing style and voice.

Rules:
- Extract only what the USER wrote (not what others said to them)
- Preserve their exact wording, punctuation, capitalization, and emoji usage
- If it's a conversation, only include the user's messages (the ones they sent)
- If you can't tell who the sender is, extract all text
- Return ONLY the extracted text, nothing else — no labels, no commentary`,
              },
              { type: 'image_url', image_url: { url: base64 } },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('[VOICE_EXTRACT]', 'OpenRouter error:', response.status);
      return NextResponse.json({ error: 'Failed to analyze image' }, { status: 502 });
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error('[VOICE_EXTRACT]', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
