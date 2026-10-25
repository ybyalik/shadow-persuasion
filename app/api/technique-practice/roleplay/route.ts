import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { generateExample, getTactic, practiceDb as db } from '@/lib/prompts/practice';

export const maxDuration = 30;

/**
 * POST { slug }: writes one fresh, realistic message that uses this tactic
 * (MODELS.fast) and keeps it for Train mode, so each message is paid for once.
 * Used by "Show me another example" on a tactic's page.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const tactic = await getTactic(String(body.slug ?? ''));
    if (!tactic) return NextResponse.json({ error: 'Please pick a tactic.' }, { status: 400 });

    const fresh = await generateExample(uid, tactic);
    if (!fresh) return apiError("We couldn't write an example just now. Please try again.", 502, '[technique-practice/roleplay] empty');

    const { data: row } = await db
      .from('tactic_examples')
      .insert({ tactic_slug: tactic.slug, message: fresh.message, context: fresh.context, source: 'ai' })
      .select('id, message, context')
      .single();

    return NextResponse.json({ example: row ?? { id: null, ...fresh } });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't write an example just now. Please try again.", 500, '[technique-practice/roleplay]', err);
  }
}
