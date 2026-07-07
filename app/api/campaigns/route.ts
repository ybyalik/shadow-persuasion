import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';

export const maxDuration = 45;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any) {
  return {
    id: r.id,
    personId: r.person_id,
    personName: r.person_name,
    title: r.title,
    goal: r.goal,
    situation: r.situation,
    status: r.status,
    steps: r.steps || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const PLAN_SYSTEM = `You are a strategist planning a multi-conversation campaign toward a goal that takes several interactions over time (like getting a promotion, winning someone over, or closing a slow deal). Break it into an ordered sequence of conversation "moves."

Respond with ONLY valid JSON: { "steps": [ { "label": "<short name of this move>", "detail": "<1-2 plain sentences: what to do in this conversation and why now>" } ] }

3 to 6 steps, in order. Each step is one real conversation or touchpoint. Concrete and specific to their goal. Plain language.`;

// GET: list the user's campaigns
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      // Table may not exist yet (migration not applied). Fail soft.
      console.error('[campaigns GET]', error.message);
      return NextResponse.json({ campaigns: [] });
    }
    return NextResponse.json({ campaigns: (data || []).map(mapRow) });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[campaigns GET]', err);
  }
}

// POST: create a campaign (auto-generates a plan of steps)
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || '').trim();
    const goal = String(body?.goal || '').trim();
    const situation = String(body?.situation || '').trim();
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    if (!title || !goal) {
      return NextResponse.json({ error: 'Give your campaign a title and a goal.' }, { status: 400 });
    }

    let personName: string | null = null;
    let personBlock = '';
    if (personId) {
      const person = await getPersonContext(userId, personId);
      if (person) {
        personName = person.name;
        personBlock = `\nWho this is about (${person.name}):\n${person.summary}`;
      }
    }

    // Generate the plan.
    let steps: { label: string; detail: string; done: boolean; notes: string }[] = [];
    try {
      const res = await fetch(OR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
          'X-Title': 'Shadow Persuasion',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 1000,
          messages: [
            { role: 'system', content: PLAN_SYSTEM },
            { role: 'user', content: `Goal: ${goal}\n${situation ? `Context: ${situation}\n` : ''}${personBlock}` },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        if (Array.isArray(parsed.steps)) {
          steps = parsed.steps.slice(0, 6).map((s: { label?: string; detail?: string }) => ({
            label: String(s.label || 'Step'),
            detail: String(s.detail || ''),
            done: false,
            notes: '',
          }));
        }
      }
    } catch (e) {
      console.error('[campaigns] plan generation failed', e);
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        person_id: personId || null,
        person_name: personName,
        title,
        goal,
        situation: situation || null,
        status: 'active',
        steps,
      })
      .select()
      .single();

    if (error) {
      return apiError('Could not save your campaign. Please try again.', 500, '[campaigns POST]', error);
    }
    return NextResponse.json({ campaign: mapRow(data) });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[campaigns POST]', err);
  }
}

// PUT: update a campaign (steps / status), scoped to the caller
export async function PUT(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (Array.isArray(body.steps)) updates.steps = body.steps;
    if (typeof body.status === 'string') updates.status = body.status;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return apiError('Could not update your campaign.', 500, '[campaigns PUT]', error);
    return NextResponse.json({ campaign: mapRow(data) });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[campaigns PUT]', err);
  }
}

// DELETE: remove a campaign, scoped to the caller
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', userId);
    if (error) return apiError('Could not delete your campaign.', 500, '[campaigns DELETE]', error);
    return NextResponse.json({ success: true });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Something went wrong.', 500, '[campaigns DELETE]', err);
  }
}
