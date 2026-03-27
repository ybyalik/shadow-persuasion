import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';
import { HANDLER_SYSTEM_PROMPT } from '@/lib/prompts';
import { scenarios } from '@/lib/scenarios';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return new Response('Scenario not found.', { status: 404 });
    }

    const scenarioPrompt = `The user is starting a simulation for the "${scenario.title}" scenario. 
    Your objective is: ${scenario.objective}.
    Guide them through it step-by-step. Be direct and tactical. Start by setting the scene for them.`;

    const systemMessage = {
      role: 'system',
      content: `${HANDLER_SYSTEM_PROMPT}\n\n${scenarioPrompt}`,
    };

    const response = await chatCompletion(
      [systemMessage, ...messages],
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
    console.error('[SCENARIOS API] Error:', error);
    return new Response('Failed to get scenario response.', { status: 500 });
  }
}
