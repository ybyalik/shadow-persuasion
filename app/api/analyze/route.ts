import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { readScreenshot } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getPersonContext } from '@/lib/person-context';
import { supabase } from '@/lib/rag';
import { decodeMessage, pressureToScore, RELATIONS } from '@/lib/prompts/in-the-moment';

export const maxDuration = 60;

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Decode a Message. Accepts JSON { text, relation?, goal?, personId? } or
 * multipart form data with image_0..image_4 (plus the same optional fields).
 * Returns { id, result, transcript }.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);

    let text = '';
    let relation = '';
    let goal = '';
    let personId = '';
    let inputType: 'text' | 'image' = 'text';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const files: File[] = [];
      for (let i = 0; i < MAX_IMAGES; i++) {
        const f = form.get(`image_${i}`);
        if (f instanceof File) files.push(f);
      }
      const single = form.get('image');
      if (!files.length && single instanceof File) files.push(single);
      if (!files.length) return apiError('Please add at least one screenshot.', 400);
      if (files.some((f) => !f.type.startsWith('image/'))) return apiError('Screenshots need to be images (PNG or JPG).', 400);
      if (files.some((f) => f.size > MAX_IMAGE_BYTES)) return apiError('One of the screenshots is too large. Please use images under 8 MB.', 400);

      const transcripts = await Promise.all(
        files.map(async (f) => {
          const dataUrl = `data:${f.type};base64,${Buffer.from(await f.arrayBuffer()).toString('base64')}`;
          return readScreenshot({ userId: uid, feature: 'decode', imageDataUrl: dataUrl });
        })
      );
      const typed = String(form.get('text') || '').trim();
      text = [typed, ...transcripts.map((t, i) => (files.length > 1 ? `(Screenshot ${i + 1})\n${t}` : t))].filter(Boolean).join('\n\n');
      relation = String(form.get('relation') || '');
      goal = String(form.get('goal') || '');
      personId = String(form.get('personId') || '');
      inputType = 'image';
      if (!text.trim()) return apiError("We couldn't read any words in that screenshot. Try a clearer one, or paste the message instead.", 400);
    } else {
      const body = await req.json().catch(() => ({}));
      text = String(body?.text || '').trim();
      relation = String(body?.relation || '');
      goal = String(body?.goal || '');
      personId = typeof body?.personId === 'string' ? body.personId : '';
      if (!text) return apiError('Paste the message you want to decode.', 400);
    }

    relation = (RELATIONS as readonly string[]).includes(relation) ? relation : '';
    goal = goal.trim().slice(0, 500);

    let personSummary = '';
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) personSummary = `${person.name}. ${person.summary}`;
      else personId = '';
    }

    const result = await decodeMessage({ userId: uid, feature: 'decode', text, relation, goal, personSummary });
    if (!result) return apiError("We couldn't decode that one. Please try again.", 502, '[decode] empty or invalid AI answer');

    // Save to history (best effort: the answer still shows if saving fails).
    let id: string | null = null;
    const { data: saved, error: saveErr } = await supabase
      .from('analysis_history')
      .insert({
        user_id: uid,
        person_id: personId || null,
        input_text: text.slice(0, 10000),
        input_type: inputType,
        threat_score: pressureToScore(result.pressure),
        tactics: result.tactic ? [{ tactic: result.tactic, explanation: result.whatsHappening }] : [],
        response_options: result.replies,
        overall_assessment: result.whatsHappening,
        techniques_identified: result.tactic ? [result.tactic] : [],
        full_result: { ...result, kind: 'decode-v2', relation: relation || null, goal: goal || null },
      })
      .select('id')
      .single();
    if (saveErr) console.error('[decode] history save failed', saveErr.message);
    else id = saved?.id ?? null;

    return NextResponse.json({ id, result, transcript: inputType === 'image' ? text : null });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("Something went wrong while decoding. Please try again.", 500, '[decode]', err);
  }
}
