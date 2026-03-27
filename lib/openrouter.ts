const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

interface ChatCompletionOptions {
  model?: string;
  stream?: boolean;
  [key: string]: any;
}

export async function chatCompletion(messages: any[], options: ChatCompletionOptions = {}) {
  const { model = 'anthropic/claude-3.5-sonnet', stream = false, ...restOptions } = options;

  const body = JSON.stringify({
    model,
    messages,
    stream,
    ...restOptions,
  });

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
      'X-Title': 'Shadow Persuasion MVP',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenRouter API Error:', errorBody);
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }

  if (stream) {
    return response.body;
  }

  return response.json();
}
