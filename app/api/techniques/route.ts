import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { getTactic, getTactics } from '@/lib/prompts/practice';

export const dynamic = 'force-dynamic';

/**
 * Spot the Tactic library: the 50 tactics from the book's Tactic Spotter guide.
 *   GET            -> { tactics, techniques } (techniques is the short shape older pages use)
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
    return NextResponse.json({ tactics, techniques });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't load the tactics. Please try again.", 500, '[techniques]', err);
  }
}
