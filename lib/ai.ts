/**
 * Every AI call in the app goes through here.
 *
 * - Picks the model from one place (MODELS), so prices can be tuned centrally.
 * - Checks the person's spend cap before calling (daily and monthly, in US
 *   dollars of AI cost, from app_settings.ai_budget).
 * - Asks OpenRouter to report the real cost of each call and logs it to
 *   ai_usage, so the admin can see what each feature costs.
 *
 * Over the cap, it throws a 429 Response with a friendly message, which routes
 * pass back with passthroughAuthError().
 */

import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** smart: careful reading of real messages and plans. fast: chat turns, drills, short answers. */
export const MODELS = {
  smart: 'anthropic/claude-sonnet-5.5',
  fast: 'anthropic/claude-haiku-5.5',
} as const;

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: unknown };

export interface AiOptions {
  userId: string;
  feature: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  /** Hidden "thinking" before answering. Default: off for the fast model, low for the smart one. */
  thinking?: 'off' | 'low' | 'medium';
}

const DEFAULT_BUDGET = { daily_usd: 0.5, monthly_usd: 3 };
let budgetCache: { at: number; value: typeof DEFAULT_BUDGET } | null = null;

async function getBudget() {
  if (budgetCache && Date.now() - budgetCache.at < 60_000) return budgetCache.value;
  const { data } = await db.from('app_settings').select('value').eq('key', 'ai_budget').maybeSingle();
  const value = { ...DEFAULT_BUDGET, ...((data?.value as Partial<typeof DEFAULT_BUDGET>) ?? {}) };
  budgetCache = { at: Date.now(), value };
  return value;
}

async function spentSince(userId: string, since: Date) {
  const { data } = await db.from('ai_usage').select('cost_usd').eq('user_id', userId).gte('created_at', since.toISOString());
  return (data ?? []).reduce((sum, r) => sum + Number(r.cost_usd || 0), 0);
}

/** Throws a 429 Response if the person has used up today's or this month's allowance. */
export async function assertWithinBudget(userId: string) {
  const budget = await getBudget();
  const now = new Date();
  const dayStart = new Date(now.getTime() - 24 * 3600_000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 3600_000);
  const [day, month] = await Promise.all([spentSince(userId, dayStart), spentSince(userId, monthStart)]);
  if (day >= budget.daily_usd || month >= budget.monthly_usd) {
    const message =
      day >= budget.daily_usd
        ? "You've reached today's limit for the app. It resets within 24 hours."
        : "You've reached this month's fair-use limit for the app. It frees up gradually over the coming days.";
    throw new Response(JSON.stringify({ error: 'limit', message }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function logUsage(o: { userId: string; feature: string; model: string; usage?: Record<string, unknown> }) {
  const u = o.usage ?? {};
  const { error } = await db.from('ai_usage').insert({
    user_id: o.userId,
    feature: o.feature,
    model: o.model,
    prompt_tokens: Number(u.prompt_tokens) || null,
    completion_tokens: Number(u.completion_tokens) || null,
    cost_usd: Number(u.cost) || 0,
  });
  if (error) console.error('[ai] usage log failed:', error.message);
}

function body(o: AiOptions, stream: boolean) {
  return JSON.stringify({
    model: o.model ?? MODELS.fast,
    messages: o.messages,
    temperature: o.temperature ?? 0.5,
    max_tokens: o.maxTokens ?? 1500,
    ...(o.json ? { response_format: { type: 'json_object' } } : {}),
    reasoning: reasoningFor(o),
    usage: { include: true },
    stream,
  });
}

// Thinking tokens are billed and count against max_tokens, which can cut answers short.
function reasoningFor(o: AiOptions) {
  const level = o.thinking ?? ((o.model ?? MODELS.fast) === MODELS.smart ? 'low' : 'off');
  return level === 'off' ? { enabled: false } : { effort: level };
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://shadowpersuasion.com',
    'X-Title': 'Shadow Persuasion',
  };
}

class AiError extends Error {}

/** One complete answer. With json: true, returns the parsed object as `data`. */
export async function aiChat<T = unknown>(o: AiOptions): Promise<{ text: string; data: T | null }> {
  await assertWithinBudget(o.userId);
  const res = await fetch(OR_URL, { method: 'POST', headers: headers(), body: body(o, false) });
  if (!res.ok) throw new AiError(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const json = await res.json();
  await logUsage({ userId: o.userId, feature: o.feature, model: o.model ?? MODELS.fast, usage: json.usage });
  const text: string = json.choices?.[0]?.message?.content ?? '';
  let data: T | null = null;
  if (o.json) data = parseJson<T>(text);
  return { text, data };
}

/** Streams the answer as text pieces; logs the cost when the stream ends. */
export async function aiStream(o: AiOptions): Promise<AsyncGenerator<string>> {
  await assertWithinBudget(o.userId);
  const res = await fetch(OR_URL, { method: 'POST', headers: headers(), body: body(o, true) });
  if (!res.ok || !res.body) throw new AiError(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  async function* gen() {
    let buffer = '';
    let usage: Record<string, unknown> | undefined;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data: ')) continue;
          const d = t.slice(6);
          if (d === '[DONE]') continue;
          try {
            const j = JSON.parse(d);
            if (j.usage) usage = j.usage;
            const piece = j.choices?.[0]?.delta?.content;
            if (piece) yield piece as string;
          } catch {
            /* keep-alive comments and partial lines */
          }
        }
      }
    } finally {
      await logUsage({ userId: o.userId, feature: o.feature, model: o.model ?? MODELS.fast, usage });
    }
  }
  return gen();
}

/** Lenient JSON parse: strips code fences and finds the outermost object. */
export function parseJson<T>(text: string): T | null {
  const cleaned = text.replace(/```(?:json)?/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const a = cleaned.indexOf('{');
    const b = cleaned.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(cleaned.slice(a, b + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Reads the words out of a screenshot (cheap model, vision). */
export async function readScreenshot(o: { userId: string; feature: string; imageDataUrl: string }) {
  const { text } = await aiChat({
    userId: o.userId,
    feature: `${o.feature}:screenshot`,
    model: MODELS.fast,
    temperature: 0,
    maxTokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Transcribe this screenshot of a conversation exactly. Put each message on its own line as "Name: message" (use "Me" for the phone owner\'s own messages, usually on the right). Include timestamps only if visible. Output only the transcript.',
          },
          { type: 'image_url', image_url: { url: o.imageDataUrl } },
        ],
      },
    ],
  });
  return text.trim();
}
