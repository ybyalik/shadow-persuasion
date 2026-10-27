/**
 * GET /api/admin/emails             -> { emails: CatalogEntry[] }  every email the site sends (lib/sp2/email-catalog.ts)
 * GET /api/admin/emails?key=<key>   -> { subject, html }           a preview built by the same code that sends it
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { emailCatalog, emailPreview } from '@/lib/sp2/email-catalog';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const key = new URL(req.url).searchParams.get('key');
    if (key) {
      const p = emailPreview(key);
      return p ? NextResponse.json(p) : NextResponse.json({ error: 'No such email.' }, { status: 404 });
    }
    return NextResponse.json({ emails: emailCatalog() });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Could not load emails.', 500, '[admin/emails]', err);
  }
}
