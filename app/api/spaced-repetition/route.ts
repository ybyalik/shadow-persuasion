import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getTactic, practiceDb as db, PROGRESS_COLS as COLS, recordReview } from '@/lib/prompts/practice';
import { cardStatus, type SRCard } from '@/lib/spaced-repetition';

/** GET: this person's Train progress per tactic (?due=true for only the ones ready to review). */
export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    let q = db.from('tactic_progress').select(COLS).eq('user_id', uid).order('next_review_at');
    if (req.nextUrl.searchParams.get('due') === 'true') q = q.lte('next_review_at', new Date().toISOString());
    const { data, error } = await q;
    if (error) throw error;
    const cards = (data ?? []).map((c) => ({ ...c, status: cardStatus(c as SRCard) }));
    return NextResponse.json({ cards, due: cards.filter((c) => c.status === 'due').length });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't load your progress. Please try again.", 500, '[spaced-repetition]', err);
  }
}

/** POST { slug, correct } or { slug, quality: 0-5 }: records one review and schedules the next. */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug ?? body.technique_id ?? '');
    if (!(await getTactic(slug))) return NextResponse.json({ error: 'Please pick a tactic.' }, { status: 400 });
    const quality = typeof body.quality === 'number' ? body.quality : body.correct ? 5 : 1;
    const card = await recordReview(uid, slug, quality);
    return NextResponse.json({ card: { ...card, status: cardStatus(card) } });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't save that. Please try again.", 500, '[spaced-repetition]', err);
  }
}
