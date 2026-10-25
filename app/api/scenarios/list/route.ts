import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { editionScene, getScene, listBookScenes, practiceDb as db, SCENE_COLS, type Scene } from '@/lib/prompts/practice';

export const dynamic = 'force-dynamic';

/**
 * Practice Scenes: the book's scenes for the current edition (lib/edition.ts;
 * v3 scenes come from lib/practice-v3/scenes.json) plus the ones this person
 * made from their own situation.
 *   GET           -> { scenes, mine }
 *   GET ?id=<id>  -> { scene }
 */
export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const scene = await getScene(id, uid);
      if (!scene) return NextResponse.json({ error: "We couldn't find that scene." }, { status: 404 });
      return NextResponse.json({ scene });
    }

    const [book, mine] = await Promise.all([
      listBookScenes(),
      db.from('scenarios').select(SCENE_COLS).eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ]);
    return NextResponse.json({ scenes: book, mine: ((mine.data ?? []) as Scene[]).map(editionScene) });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't load the scenes. Please try again.", 500, '[scenarios/list]', err);
  }
}
