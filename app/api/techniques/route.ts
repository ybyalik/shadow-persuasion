import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getTactic, getTactics, isDangerSign } from '@/lib/prompts/practice';

export const dynamic = 'force-dynamic';

/**
 * Spot the Tactic library: the tactics from the book's Tactic Spotter guide for the current
 * edition (lib/prompts/practice.ts, getTactics: the old 50, or on v3 the new guide's 42
 * entries plus 6 danger signs, falling back to the old 50 until the new ones are loaded).
 *   GET            -> { tactics, techniques, meta } (techniques is the short shape older pages use;
 *                     meta says which guide was served and how many entries of each kind)
 *   GET ?id=<slug> -> { tactic }
 */
export async function GET(req: NextRequest) {
  try {
    await requireAppUser(req);
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const tactic = await getTactic(id);
      if (!tactic) return NextResponse.json({ error: "We couldn't find that tactic." }, { status: 404 });
      return NextResponse.json({ tactic });
    }

    const tactics = await getTactics();
    const techniques = tactics.map((t) => ({ id: t.slug, name: t.name, category: t.chapter_title, difficulty: 1, chunkCount: 0 }));
    const danger = tactics.filter(isDangerSign).length;
    const meta = {
      edition: tactics.some((t) => t.edition === 'v3') ? 'v3' : 'v2',
      total: tactics.length,
      ordinary: tactics.length - danger,
      danger,
    };
    return NextResponse.json({ tactics, techniques, meta });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't load the tactics. Please try again.", 500, '[techniques]', err);
  }
}
