import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { editionScene, practiceDb as db, SCENE_COLS, type Scene } from '@/lib/prompts/practice';

export const dynamic = 'force-dynamic';

/**
 * Practice Scenes: the book's scenes plus the ones this person made from
 * their own situation.
 *   GET           -> { scenes, mine }
 *   GET ?id=<id>  -> { scene }
 */
export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const { data } = await db.from('scenarios').select(SCENE_COLS).eq('id', id).maybeSingle();
      const scene = data as Scene | null;
      if (!scene || !(scene.is_book || scene.user_id === uid)) {
        return NextResponse.json({ error: "We couldn't find that scene." }, { status: 404 });
      }
      return NextResponse.json({ scene: editionScene(scene) });
    }

    const [book, mine] = await Promise.all([
      db.from('scenarios').select(SCENE_COLS).eq('is_book', true).order('sort_order'),
      db.from('scenarios').select(SCENE_COLS).eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ]);
    if (book.error) throw book.error;
    return NextResponse.json({ scenes: ((book.data ?? []) as Scene[]).map(editionScene), mine: ((mine.data ?? []) as Scene[]).map(editionScene) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't load the scenes. Please try again.", 500, '[scenarios/list]', err);
  }
}
