import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiChat, MODELS } from '@/lib/ai';
import { searchKnowledge } from '@/lib/rag';
import { CHAPTER_COUNT } from '@/lib/edition';
import {
  CHAPTERS,
  HOTLINE,
  TACTICS,
  VOICE_RULES,
  mapDecode,
  mapInteraction,
  matchTactic,
  normalizeRelationship,
  playbookFor,
  soundsUnsafe,
  tallyTactics,
  type HowItWent,
  type Interaction,
} from '@/lib/prompts/your-life';

/**
 * My People actions (all scoped to the signed-in reader):
 *   add-interaction     log what happened with a person; a quick read names the
 *                       tactics they used and notes what worked (MODELS.fast)
 *   delete-interaction  remove one entry from the timeline
 *   update-summary      rewrite "How to handle [name]" from the book's playbooks
 *                       and the person's history (MODELS.smart)
 */

export const maxDuration = 60;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const TABLE = 'user_profiles_people';
const TACTIC_NAMES = TACTICS.map((t) => t.name).join('; ');

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const personId = body?.personId || body?.profile?.id;
    if (!personId) return NextResponse.json({ error: 'Which person is this about?' }, { status: 400 });

    const { data: row } = await supabase.from(TABLE).select('*').eq('id', personId).eq('user_id', uid).maybeSingle();
    if (!row) return NextResponse.json({ error: 'We could not find that person.' }, { status: 404 });

    if (action === 'add-interaction' || action === 'analyze-interaction') return addInteraction(uid, row, body?.interaction || {});
    if (action === 'delete-interaction') return deleteInteraction(uid, row, String(body?.interactionId || ''));
    if (action === 'update-summary' || action === 'generate-playbook') return updateSummary(uid, row);
    return NextResponse.json({ error: 'That action is not available.' }, { status: 400 });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('Something went wrong. Please try again.', 500, '[people action]', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function addInteraction(uid: string, row: Row, raw: Record<string, unknown>) {
  const whatHappened = clip(raw.whatHappened ?? raw.summary, 3000);
  if (!whatHappened) return NextResponse.json({ error: 'Tell us briefly what happened.' }, { status: 400 });
  const whatTheySaid = clip(raw.whatTheySaid, 1500);
  const whatISaid = clip(raw.whatISaid, 1500);
  const howItWent = (['landed', 'mixed', 'didnt', 'unsure'].includes(String(raw.howItWent)) ? raw.howItWent : 'unsure') as HowItWent;
  const date = clip(raw.date, 40) || new Date().toISOString();

  const relationship = normalizeRelationship(row.relationship_type);
  const went = { landed: 'It went well, my reply landed.', mixed: 'It went so-so.', didnt: 'It did not go well.', unsure: 'Not sure yet.' }[howItWent];

  type Read = { tactics?: string[]; read?: string; worked?: string; unsafe?: boolean };
  let read: Read = {};
  try {
    const { data } = await aiChat<Read>({
      userId: uid,
      feature: 'people:interaction',
      model: MODELS.fast,
      temperature: 0.2,
      maxTokens: 500,
      json: true,
      messages: [
        {
          role: 'system',
          content: `${VOICE_RULES}

TASK
The reader logged a moment with someone in their life. Give a short, kind read of it.
Pick the pressure tactics the OTHER person used, only from this list from the book, using the exact names: ${TACTIC_NAMES}.
Pick 0 to 3. If nothing clearly fits, return an empty list. Do not label normal disagreement as a tactic.

Reply with JSON only:
{
  "tactics": ["exact tactic names from the list"],
  "read": "1 or 2 short sentences in plain English on what was happening, said kindly to the reader",
  "worked": "If the reader's reply landed, one short sentence on what about it worked (for example: short, calm, no over-explaining). Otherwise an empty string.",
  "unsafe": true or false (true only if it suggests violence, threats, stalking or fear for their safety)
}`,
        },
        {
          role: 'user',
          content: `Who: ${row.name} (${relationship})
What happened: ${whatHappened}
${whatTheySaid ? `What they said: ${whatTheySaid}\n` : ''}${whatISaid ? `What I said: ${whatISaid}\n` : ''}How it went: ${went}`,
        },
      ],
    });
    read = data || {};
  } catch (e) {
    // The entry is still saved without the quick read. Spend-cap responses pass through.
    if (e instanceof Response) throw e;
    console.error('[people:interaction] quick read failed', e);
  }

  const tactics = (Array.isArray(read.tactics) ? read.tactics : [])
    .map((t) => matchTactic(String(t))?.name)
    .filter((t): t is string => !!t)
    .slice(0, 3);
  const unsafe = Boolean(read.unsafe) || soundsUnsafe(whatHappened, whatTheySaid);

  const interaction: Interaction = {
    id: `i_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    date,
    whatHappened,
    whatTheySaid: whatTheySaid || undefined,
    whatISaid: whatISaid || undefined,
    howItWent,
    tactics,
    read: clip(read.read, 600) || undefined,
    worked: howItWent === 'landed' ? clip(read.worked, 300) || undefined : undefined,
    unsafe,
  };

  const interactions = [...(Array.isArray(row.interactions) ? row.interactions : []), interaction].slice(-200);
  const whatWorked = Array.isArray(row.what_worked) ? [...row.what_worked] : [];
  if (howItWent === 'landed' && whatISaid) {
    whatWorked.unshift({ id: interaction.id, date, text: whatISaid, note: interaction.worked || null, interactionId: interaction.id });
  }

  const { error } = await supabase
    .from(TABLE)
    .update({ interactions, what_worked: whatWorked.slice(0, 50), updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .eq('user_id', uid);
  if (error) return apiError('Could not save this moment. Please try again.', 500, '[people:interaction]', error);

  return NextResponse.json({ interaction, unsafe, hotline: unsafe ? HOTLINE : null });
}

async function deleteInteraction(uid: string, row: Row, interactionId: string) {
  if (!interactionId) return NextResponse.json({ error: 'Which entry should we remove?' }, { status: 400 });
  const interactions = (Array.isArray(row.interactions) ? row.interactions : []).filter((i: { id?: string }) => i?.id !== interactionId);
  const whatWorked = (Array.isArray(row.what_worked) ? row.what_worked : []).filter((w: { interactionId?: string }) => w?.interactionId !== interactionId);
  const { error } = await supabase
    .from(TABLE)
    .update({ interactions, what_worked: whatWorked, updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .eq('user_id', uid);
  if (error) return apiError('Could not remove that entry. Please try again.', 500, '[people:delete-interaction]', error);
  return NextResponse.json({ success: true });
}

async function updateSummary(uid: string, row: Row) {
  const relationship = normalizeRelationship(row.relationship_type);
  const interactions = (Array.isArray(row.interactions) ? row.interactions : []).map(mapInteraction);
  interactions.sort((a: Interaction, b: Interaction) => b.date.localeCompare(a.date));

  const { data: decodeRows } = await supabase
    .from('analysis_history')
    .select('id, input_text, tactics, overall_assessment, full_result, created_at')
    .eq('user_id', uid)
    .eq('person_id', row.id)
    .order('created_at', { ascending: false })
    .limit(8);
  const decodes = (decodeRows || []).map(mapDecode);
  const tactics = tallyTactics(interactions, decodes, row.tactics).slice(0, 6);
  const unsafe = interactions.some((i: Interaction) => i.unsafe || soundsUnsafe(i.whatHappened, i.whatTheySaid));

  const tacticLines = tactics
    .map((t) => {
      const book = matchTactic(t.name);
      return `- ${t.name} (seen ${t.count}x${book ? `, Chapter ${book.chapter}, calm reply: ${book.reply}` : ''})`;
    })
    .join('\n');
  const history = interactions
    .slice(0, 12)
    .map(
      (i: Interaction) =>
        `- ${i.date.slice(0, 10)}: ${i.whatHappened.slice(0, 300)}${i.whatISaid ? ` | I said: "${i.whatISaid.slice(0, 200)}"` : ''} | went: ${i.howItWent}${i.tactics.length ? ` | tactics: ${i.tactics.join(', ')}` : ''}`
    )
    .join('\n');
  const decodeLines = decodes
    .slice(0, 5)
    .map((d) => `- ${d.date.slice(0, 10)}: ${d.tactics.join(', ') || 'no clear tactic'}${d.whatsHappening ? `: ${d.whatsHappening.slice(0, 200)}` : ''}`)
    .join('\n');
  const worked = (Array.isArray(row.what_worked) ? row.what_worked : [])
    .slice(0, 5)
    .map((w: { text?: string }) => `- "${String(w?.text || '').slice(0, 200)}"`)
    .join('\n');

  const query = `${relationship} ${tactics.map((t) => t.name).join(', ')} ${interactions[0]?.whatHappened?.slice(0, 200) || ''} calm reply boundary`;
  const passages = await searchKnowledge(query, { count: 4, threshold: 0.25 });

  type Out = { approach?: string; dos?: string[]; donts?: string[]; sayThis?: string[]; pressureNote?: string | null; nextStep?: string; chapters?: number[] };
  const { data } = await aiChat<Out>({
    userId: uid,
    feature: 'people:summary',
    model: MODELS.smart,
    temperature: 0.4,
    maxTokens: 900,
    json: true,
    messages: [
      {
        role: 'system',
        content: `${VOICE_RULES}

TASK
Write a short, plain-English guide called "How to handle ${row.name}" for the reader. Base it on the book's playbook for this kind of relationship, the tactics this person tends to use (with the book's calm replies), and what has worked before. It is about the reader protecting their time, energy and fairness, not about changing or controlling ${row.name}. No personality scores, no labels, no "risk levels".

Reply with JSON only:
{
  "approach": "2 to 4 short sentences, warm and direct, on the overall way to handle ${row.name}",
  "dos": ["3 short things to do"],
  "donts": ["2 or 3 short things to avoid (usually the reader's own habits, like over-explaining or saying yes on the spot)"],
  "sayThis": ["1 or 2 calm lines the reader could actually say, in the book's style"],
  "pressureNote": ${unsafe ? `"Kindly say this relationship sounds unsafe, and include: ${HOTLINE}"` : `"If the history shows a lot of pressure, one kind sentence saying so (for example: This relationship has a lot of pressure in it. That is not your fault.). Otherwise null."`},
  "nextStep": "one small, concrete next step for this week",
  "chapters": [2 or 3 chapter numbers from the book that fit best, from 1 to ${CHAPTER_COUNT}]
}`,
      },
      {
        role: 'user',
        content: `Person: ${row.name}
Relationship: ${relationship}
${row.notes ? `My notes: ${String(row.notes).slice(0, 600)}\n` : ''}
${playbookFor(relationship) || 'No specific playbook for this relationship; use the general principles from the passages below.'}

Tactics they tend to use:
${tacticLines || '- None recorded yet.'}

Recent moments:
${history || '- None logged yet.'}
${decodeLines ? `\nMessages from them I decoded:\n${decodeLines}\n` : ''}
${worked ? `Calm replies that landed before:\n${worked}\n` : ''}
Passages from the book:
${passages || '(none found)'}`,
      },
    ],
  });

  if (!data || typeof data.approach !== 'string' || !data.approach.trim()) {
    return apiError('We could not write the guide just now. Please try again.', 502, '[people:summary]', 'empty or unparseable summary');
  }
  const list = (v: unknown, n: number) => (Array.isArray(v) ? v.map((x) => clip(x, 400)).filter(Boolean).slice(0, n) : []);
  const playbook = {
    approach: clip(data.approach, 1500),
    dos: list(data.dos, 4),
    donts: list(data.donts, 3),
    sayThis: list(data.sayThis, 2),
    pressureNote: clip(data.pressureNote, 500) || null,
    chapters: (Array.isArray(data.chapters) ? data.chapters : [])
      .map(Number)
      .filter((n) => CHAPTERS[n])
      .slice(0, 3)
      .map((n) => ({ chapter: n, title: CHAPTERS[n] })),
    generatedAt: new Date().toISOString(),
  };
  const nextStep = clip(data.nextStep, 400) || null;

  const { error } = await supabase
    .from(TABLE)
    .update({ playbook, next_recommended_action: nextStep, updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .eq('user_id', uid);
  if (error) return apiError('Could not save the guide. Please try again.', 500, '[people:summary]', error);
  return NextResponse.json({ summary: playbook, nextStep });
}
