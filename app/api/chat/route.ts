import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';
import { HANDLER_SYSTEM_PROMPT } from '@/lib/prompts';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const systemMessage = {
      role: 'system',
      content: HANDLER_SYSTEM_PROMPT,
    };
    
    // Use the last 5 messages to keep context window small for demo
    const recentMessages = messages.slice(-5); 

    const response = await chatCompletion(
      [systemMessage, ...recentMessages],
      {
        model: 'anthropic/claude-3.5-sonnet',
        stream: true,
      }
    );
    
    const stream = new ReadableStream({
        async start(controller) {
            const reader = response.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                // SSE format for streaming
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const json = JSON.parse(line.substring(6));
                        if (json.choices && json.choices[0].delta.content) {
                            controller.enqueue(new TextEncoder().encode(json.choices[0].delta.content));
                        }
                    }
                }
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('[CHAT API] Error:', error);
    return new Response('Failed to get chat response.', { status: 500 });
  }
}
