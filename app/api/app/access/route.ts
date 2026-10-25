/**
 * GET /api/app/access
 * The signed-in person's access: { ok, kind, until, daysLeft }.
 * The app shell uses it to show days left, or the Keep access page.
 */

import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-api';
import { getAccess } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const access = await getAccess(user.email);
    const daysLeft = access.until ? Math.max(0, Math.ceil((new Date(access.until).getTime() - Date.now()) / 86400_000)) : null;
    return NextResponse.json({ ...access, daysLeft });
  } catch (err) {
    const authFail = passthroughAuthError(err);
    if (authFail) return authFail;
    return apiError('Could not check your access.', 500, '[app/access]', err);
  }
}
