import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { searchKnowledge } from '@/lib/rag';
import { getPersonContext } from '@/lib/person-context';
import { CHAPTER_COUNT, byEdition } from '@/lib/edition';
import { CHAPTERS, HOTLINE, VOICE_RULES, normalizeRelationship, playbookFor, soundsUnsafe } from '@/lib/prompts/your-life';

/**
 * Goals: bigger things that take a few weeks ("Get the raise I'm owed").
 * Creating a goal writes a short step-by-step plan grounded in Part Four of the
 * book. Stored in the existing `campaigns` table.
 */

export const maxDuration = 60;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Step = {
  label: string;
  detail: string;
  when: string;
  action: 'plan' | 'rehearse' | null;
  chapter: number | null;
  done: boolean;
  notes: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStep(s: any): Step {
  const chapter = Number(s?.chapter);
  return {
    label: String(s?.label || 'Step').slice(0, 160),
    detail: String(s?.detail || '').slice(0, 800),
    when: String(s?.when || '').slice(0, 40),
    action: s?.action === 'plan' || s?.action === 'rehearse' ? s.action : null,
    chapter: CHAPTERS[chapter] ? chapter : null,
    done: Boolean(s?.done),
    notes: String(s?.notes || '').slice(0, 1000),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any) {
  const steps = (Array.isArray(r.steps) ? r.steps : []).map(mapStep);
  return {
    id: r.id,
    personId: r.person_id,
    personName: r.person_name,
    title: r.title,
    goal: r.goal,
    situation: r.situation,
    status: r.status === 'won' ? 'done' : r.status === 'abandoned' ? 'paused' : r.status || 'active',
    steps,
    progress: steps.length ? Math.round((steps.filter((s: Step) => s.done).length / steps.length) * 100) : 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const PLAN_SYSTEM = `${VOICE_RULES}

TASK
The reader has a bigger goal that will take a few weeks, usually with someone in their life (a raise they are owed, a fairer share of family care, fewer holidays hosted, no more lending money). Write a short, realistic plan.

${byEdition({
  v2: "Ground it in Part Four of the book: Chapter 21 (Being Heard Without a Fight), Chapter 22 (Getting What You're Owed: prepare, ask plainly, handle the response, put it in writing), Chapter 24 (Office Politics and Alliances: make your work visible, allies, politics at home), Chapter 25 (Making It Stick: the one-line email confirming what was agreed, putting dates on things, the earlier agreement).",
  v3: 'Ground it in Parts III to VI of the book: Chapter 2 (the Power Map: who decides, what each person needs, where authority, resources and alternatives sit), Chapter 17 (the Clean Ask: say what you want, give the relevant reason, leave room for a real answer), Chapter 18 (build alternatives before you need them), Chapter 19 (be credible, visible and clear), Chapter 20 (allies without creating debts), Chapter 22 (the Smallest Agreed Step: a useful next action with clear agreement on exactly what it covers, confirmed in a short message), Chapter 28 (the No-Agreement Plan: what you will do if the answer is still no), and the Part V chapter for the setting (23 work and pay, 24 money and services, 25 partners and exes, 26 family and friends, 27 groups).',
})} Use the relationship playbook and the passages given. Fair and honest only: no pressure tactics, no tricks, no exploiting anyone.

Reply with JSON only:
{
  "steps": [
    {
      "label": "short name of the step, plain words (for example: Write down what you are owed)",
      "detail": "1 or 2 plain sentences: exactly what to do and why now",
      "when": "Week 1" (or Week 2, Week 3, Week 4),
      "action": "plan" if this step is a real conversation worth planning, "rehearse" if it is a hard conversation worth practicing out loud first, or null for prep or follow-up steps,
      "chapter": the one chapter number (1 to ${CHAPTER_COUNT}) that best covers this step
    }
  ]
}

3 to 6 steps, in order, over two to five weeks. Start with preparation, include at least one real conversation, and end by making the result stick (for example a short email confirming what was agreed, or a date on it).${byEdition({ v2: '', v3: ' Include what to do if the answer is no (the No-Agreement Plan).' })}`;

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const { data, error } = await supabase.from('campaigns').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (error) return apiError('Could not load your goals. Please try again.', 500, '[goals GET]', error);
    return NextResponse.json({ campaigns: (data || []).map(mapRow) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[goals GET]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || '').trim().slice(0, 160);
    const situation = String(body?.situation || '').trim().slice(0, 3000);
    const goal = String(body?.goal || '').trim().slice(0, 1000) || title;
    const personId = typeof body?.personId === 'string' && body.personId ? body.personId : '';
    if (!title) return NextResponse.json({ error: 'Give your goal a short name, like "Get the raise I\'m owed".' }, { status: 400 });

    let personName: string | null = null;
    let personBlock = '';
    let playbook = '';
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) {
        personName = person.name;
        personBlock = `\nWho this involves: ${person.name}\n${person.summary}`;
        const { data: p } = await supabase.from('user_profiles_people').select('relationship_type').eq('id', personId).eq('user_id', uid).maybeSingle();
        playbook = playbookFor(normalizeRelationship(p?.relationship_type));
      }
    }

    const passages = await searchKnowledge(`${title}. ${goal}. ${situation.slice(0, 400)}`, { count: 5, threshold: 0.25 });
    const unsafe = soundsUnsafe(title, goal, situation);

    let steps: Step[] = [];
    try {
      const { data, text } = await aiChat<{ steps?: unknown[] }>({
        userId: uid,
        feature: 'goals:plan',
        model: MODELS.smart,
        temperature: 0.4,
        maxTokens: 2200,
        json: true,
        messages: [
          { role: 'system', content: PLAN_SYSTEM },
          {
            role: 'user',
            content: `Goal: ${title}${goal !== title ? `\nWhat I want: ${goal}` : ''}
${situation ? `What's going on: ${situation}\n` : ''}${personBlock}
${playbook ? `\n${playbook}\n` : ''}${unsafe ? `\nNote: this may involve safety concerns. Make the first step about staying safe and getting support (${HOTLINE}).\n` : ''}
Passages from the book:
${passages || '(none found)'}`,
          },
        ],
      });
      if (Array.isArray(data?.steps)) steps = data.steps.slice(0, 6).map(mapStep);
      else console.error('[goals:plan] unreadable plan', text.slice(0, 400));
    } catch (e) {
      if (e instanceof Response) throw e;
      console.error('[goals:plan] plan failed', e);
    }
    if (steps.length === 0) {
      return apiError('We could not write a plan just now. Please try again in a moment.', 502, '[goals:plan]', 'no steps returned');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: uid,
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
    if (error) return apiError('Could not save your goal. Please try again.', 500, '[goals POST]', error);
    return NextResponse.json({ campaign: mapRow(data), unsafe, hotline: unsafe ? HOTLINE : null });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[goals POST]', err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'Which goal is this?' }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (Array.isArray(body.steps)) updates.steps = body.steps.slice(0, 12).map(mapStep);
    if (['active', 'done', 'paused'].includes(body.status)) updates.status = body.status;
    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim().slice(0, 160);

    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).eq('user_id', uid).select().maybeSingle();
    if (error) return apiError('Could not save your changes. Please try again.', 500, '[goals PUT]', error);
    if (!data) return NextResponse.json({ error: 'We could not find that goal.' }, { status: 404 });
    return NextResponse.json({ campaign: mapRow(data) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[goals PUT]', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Which goal is this?' }, { status: 400 });
    const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', uid);
    if (error) return apiError('Could not remove this goal. Please try again.', 500, '[goals DELETE]', error);
    return NextResponse.json({ success: true });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[goals DELETE]', err);
  }
}
