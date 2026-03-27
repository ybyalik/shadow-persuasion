import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';
import { DECODE_SYSTEM_PROMPT } from '@/lib/prompts';

export const maxDuration = 30; 

function extractContent(text: string) {
    const analysisMatch = text.match(/<analysis>([\s\S]*?)<\/analysis>/);
    const suggestionsMatch = text.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
    const techniquesMatch = text.match(/<techniques>([\s\S]*?)<\/techniques>/);

    return {
        analysis: analysisMatch ? analysisMatch[1].trim() : 'No analysis provided.',
        suggestions: suggestionsMatch ? suggestionsMatch[1].trim().split('\n').filter(s => s) : [],
        techniques_identified: techniquesMatch ? techniquesMatch[1].trim().split(',').map(t => t.trim()).filter(t => t) : [],
    };
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    const response = await chatCompletion(
      [
        {
          role: 'system',
          content: DECODE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
              },
            },
            {
              type: 'text',
              text: "Analyze this conversation screenshot. Give me the analysis, suggested responses, and identified techniques inside XML tags: <analysis>, <suggestions>, and <techniques> (comma-separated).",
            },
          ],
        },
      ],
      {
        model: 'openai/gpt-4o',
        stream: false,
      }
    );
     
    const content = response.choices[0].message.content;
    const extracted = extractContent(content);

    return NextResponse.json(extracted);

  } catch (error) {
    console.error('[DECODE API] Error:', error);
    return NextResponse.json({ error: 'Failed to analyze screenshot.' }, { status: 500 });
  }
}
