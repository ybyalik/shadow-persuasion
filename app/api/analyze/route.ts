import { NextRequest, NextResponse } from 'next/server';
import { DECODE_SYSTEM_PROMPT, RAG_ENFORCEMENT } from '@/lib/prompts';
import { searchKnowledge } from '@/lib/rag';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';

export const maxDuration = 60;

async function extractTextFromImage(base64Image: string): Promise<string> {
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
              text: 'Extract ALL text from this screenshot. Return only the text content, preserving the conversation structure. Include who said what if it\'s a conversation. Also briefly summarize what influence or persuasion dynamics you see.',
            },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) throw new Error('Failed to extract text from image');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

const COMPREHENSIVE_SYSTEM_PROMPT = `You are an expert conversation analyst specializing in psychological influence, power dynamics, manipulation detection, and strategic communication. You perform a COMPREHENSIVE analysis that covers both offensive insights (how to respond strategically) and defensive insights (detecting manipulation tactics).

Address the user directly with "you" and "your". Refer to the other person as "they" or "them".

You MUST respond with valid JSON in this exact format:
{
  "powerDynamics": {
    "yourPower": <number 1-10>,
    "theirPower": <number 1-10>,
    "dynamicsDescription": "Detailed explanation of the power balance and dynamics"
  },
  "communicationStyle": {
    "sensoryPreference": "Visual|Auditory|Kinesthetic|Mixed",
    "emotionalState": "Brief description of their emotional state",
    "receptivity": <number 1-100, how open they are to influence>
  },
  "threatScore": <number 1-10, how manipulative the message is. 0 if no manipulation detected>,
  "tactics": [
    {
      "quote": "exact quoted text from the message",
      "tactic": "Name of the manipulation tactic",
      "category": "Urgency|Social Proof|Authority|Guilt|Misdirection|Scarcity|Fear|Flattery|Reciprocity|Anchoring",
      "explanation": "How this tactic works psychologically",
      "counterResponse": "Exact words to say to neutralize this tactic"
    }
  ],
  "counterScript": "A complete response that neutralizes all manipulation tactics at once (empty string if no manipulation detected)",
  "responseOptions": [
    {
      "type": "Strategy name (e.g. Authority Building, Rapport Enhancement, Frame Reorientation, Reciprocity Creation)",
      "message": "Exact copy-pasteable response message",
      "description": "Why this approach works in this situation",
      "powerImpact": <percentage increase in influence>,
      "riskLevel": "LOW|MEDIUM|HIGH",
      "psychologyPrinciple": "The psychology principle being applied"
    }
  ],
  "overallAssessment": "Comprehensive assessment combining strategic analysis and manipulation landscape",
  "successProbability": <number 1-100>,
  "techniques_identified": ["Array", "of", "technique", "names", "detected"]
}

CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
1. EVERY field in the JSON schema above is REQUIRED. Never omit any field.
2. Always provide exactly 4 responseOptions covering different strategic approaches.
3. For tactics array: look for EVERY influence or persuasion technique being used, even subtle ones like strategic questions, framing, anchoring, social proof, etc. Most conversations contain at least 1-2 tactics. Only return an empty array if the message is purely factual with zero persuasive intent.
4. threatScore: 1-3 = subtle influence only, 4-6 = moderate tactics, 7-10 = heavy manipulation. Even casual conversations with light persuasion should score 1-3, not 0.
5. counterScript: Always provide this, even if manipulation is low. Frame it as "how to maintain your position" rather than just "neutralize manipulation."
6. techniques_identified: Always identify at least 1-2 communication techniques being used.
7. Be thorough and actionable. Response messages must be copy-pasteable and sound natural.
8. overallAssessment must be at least 2-3 sentences covering both the strategic landscape and any influence dynamics.`;

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    let textContent = '';
    let imageDataUrl: string | null = null;
    let isImage = false;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Image upload
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      imageDataUrl = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

      // Pass 1: Extract text + initial summary from image
      textContent = await extractTextFromImage(imageDataUrl);
      isImage = true;
    } else {
      // Text input
      const { text } = await req.json();
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text to analyze is required.' }, { status: 400 });
      }
      textContent = text;
    }

    // RAG search using the actual content
    const ragContext = await searchKnowledge(textContent);
    const enhancedPrompt = COMPREHENSIVE_SYSTEM_PROMPT + (ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE CONTEXT:\n${ragContext}` : '') + voiceContext;

    // Build the analysis message
    const userContent: any[] = [];

    if (isImage && imageDataUrl) {
      // For images, include both the image and extracted text for best results
      userContent.push({ type: 'image_url', image_url: { url: imageDataUrl } });
      userContent.push({
        type: 'text',
        text: `Perform a comprehensive analysis of this conversation screenshot. Here is the extracted text for reference:\n\n${textContent}\n\nProvide your full JSON analysis.`,
      });
    } else {
      userContent.push({
        type: 'text',
        text: `Perform a comprehensive analysis of this text:\n\n${textContent}\n\nProvide your full JSON analysis.`,
      });
    }

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
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: enhancedPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.15,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ANALYZE]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
    }

    const parsed = JSON.parse(content);

    // Include extracted text for image uploads so the frontend can display it
    if (isImage) {
      parsed.extractedText = textContent;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[ANALYZE]', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request.' },
      { status: 500 }
    );
  }
}
