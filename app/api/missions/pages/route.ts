/**
 * The 21-Day Power Reset (v3 edition only): check-ins, tool pages, weekly reviews
 * and the after-the-reset pages (page list: app/app/field-ops/reset-pages.ts).
 *
 * GET  -> { ready, pages: [{ page_key, answers, reflection, updated_at }] }
 *         ready=false while migration 032 (reset_pages_v3) isn't applied, or on the v2 edition.
 * POST { key, answers } -> saves one page (only known keys and fields are kept).
 *         -> { ok, page } or a friendly 503 while the table isn't there yet.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { IS_V3 } from '@/lib/edition';
import { cleanAnswers } from '@/app/app/field-ops/reset-pages';
import { PAGES_TABLE, db, isMissingSchema, loadPages } from '../reset-data';

const NOT_READY = "Saving these pages isn't switched on yet. Please use your journal for now.";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    if (!IS_V3) return NextResponse.json({ ready: false, pages: [] });
    return NextResponse.json(await loadPages(uid));
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not load your pages just now. Please try again.', 500, '[reset:pages:get]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    if (!IS_V3) return apiError(NOT_READY, 503);
    const body = await req.json().catch(() => ({}));
    const key = typeof body?.key === 'string' ? body.key : '';
    const answers = cleanAnswers(key, body?.answers);
    if (!answers) return apiError('We could not find that page.', 400);

    const now = new Date().toISOString();
    const { data, error } = await db
      .from(PAGES_TABLE)
      .upsert({ user_id: uid, page_key: key, answers, updated_at: now }, { onConflict: 'user_id,page_key' })
      .select('page_key, answers, reflection, updated_at')
      .single();
    if (error) {
      if (isMissingSchema(error)) return apiError(NOT_READY, 503, '[reset:pages:not-ready]', error);
      throw error;
    }
    return NextResponse.json({ ok: true, page: data });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('We could not save that just now. Your writing is still on the screen, so please try again.', 500, '[reset:pages:save]', err);
  }
}
