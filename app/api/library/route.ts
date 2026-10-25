import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails, requireUser } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { escapeLike } from '@/lib/db-utils';
import { IS_V3 } from '@/lib/edition';
import { SP2_PRODUCTS, sp2Downloads, type Sp2Slug } from '@/lib/sp2/config';
import REPLIES from '@/lib/library/replies.generated.json';
import PLAYBOOKS from '@/lib/library/playbooks.generated.json';

export const dynamic = 'force-dynamic';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const PAID_BUCKET = 'paid-downloads';
/** Download links made on this page are short-lived; the delivery email has the long-lived ones. */
const LINK_TTL_SECONDS = 60 * 60;

/** The two paid add-ons, by their order item slug (lib/sp2/config.ts). */
const ADDONS = { replies: 'sp2_scripts', playbooks: 'sp2_upsell' } as const satisfies Record<string, Sp2Slug>;

async function signedLinks(slug: Sp2Slug): Promise<{ name: string; url: string }[]> {
  const out: { name: string; url: string }[] = [];
  for (const d of sp2Downloads(slug)) {
    try {
      const { data, error } = await db.storage.from(PAID_BUCKET).createSignedUrl(d.filePath, LINK_TTL_SECONDS);
      if (error || !data?.signedUrl) {
        console.error('[library] could not sign download', d.filePath, error?.message);
        continue;
      }
      out.push({ name: d.name, url: data.signedUrl });
    } catch (err) {
      console.error('[library] signing failed', d.filePath, err);
    }
  }
  return out;
}

/** Which add-ons this email has paid for (paid orders that weren't refunded). */
async function ownedAddons(email: string): Promise<{ replies: boolean; playbooks: boolean }> {
  const { data, error } = await db
    .from('orders')
    .select('items')
    .ilike('email', escapeLike(email))
    .eq('status', 'paid')
    .is('refunded_at', null);
  if (error) throw error;
  const items = new Set((data ?? []).flatMap((o) => (Array.isArray(o.items) ? (o.items as string[]) : [])));
  return { replies: items.has(ADDONS.replies), playbooks: items.has(ADDONS.playbooks) };
}

/**
 * "Your library" (/app/library, new edition only): the paid add-ons for the people who bought them.
 *   GET -> { available: false } on the old edition
 *       -> { available: true, owned, preview, offers, replies, playbooks, downloads }
 * replies / playbooks hold the full content only when owned (or for admins, as a preview).
 * Content comes from lib/library/*.generated.json, built from book-v3/bonuses/drafts by
 * funnel-v2/app-knowledge/build_library_v3.py.
 */
export async function GET(req: NextRequest) {
  try {
    // Signed in is enough: the add-ons were bought separately from app access.
    const user = await requireUser(req);
    if (!IS_V3) return NextResponse.json({ available: false });

    const email = (user.email || '').trim().toLowerCase();
    const bought = email ? await ownedAddons(email) : { replies: false, playbooks: false };
    const isAdmin = !!email && (await getAdminEmails()).includes(email);
    const show = { replies: bought.replies || isAdmin, playbooks: bought.playbooks || isAdmin };

    const [replyLinks, playbookLinks] = await Promise.all([
      show.replies ? signedLinks(ADDONS.replies) : Promise.resolve([]),
      show.playbooks ? signedLinks(ADDONS.playbooks) : Promise.resolve([]),
    ]);

    const offer = (slug: Sp2Slug) => ({ name: SP2_PRODUCTS[slug].name, description: SP2_PRODUCTS[slug].description });

    return NextResponse.json({
      available: true,
      owned: bought,
      // Admins see everything so they can check the page; the page says it's a preview.
      preview: isAdmin && !(bought.replies && bought.playbooks),
      offers: { replies: offer(ADDONS.replies), playbooks: offer(ADDONS.playbooks) },
      replies: show.replies ? REPLIES : null,
      playbooks: show.playbooks ? PLAYBOOKS : null,
      downloads: { replies: replyLinks, playbooks: playbookLinks },
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("We couldn't open your library. Please try again.", 500, '[library]', err);
  }
}
