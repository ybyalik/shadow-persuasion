/**
 * Auth helpers for API routes.
 *
 * Verifies the Firebase ID token in the Authorization header against Google's
 * public signing keys (real signature + expiry check). Because Firebase ID
 * tokens are signed by Google with rotating RSA keys, we fetch those public
 * keys from Google's well-known JWKS endpoint and let `jose` verify the
 * signature, issuer, audience, and expiry. This needs only the (public)
 * Firebase project id — no service-account secret.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'shadow-persuasion';

// Google's public keys for Firebase Secure Token service. `jose` caches these
// and handles key rotation automatically.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface AuthedUser {
  uid: string;
  email: string | null;
}

/**
 * Verify the Firebase ID token from the Authorization: Bearer header.
 * Returns the verified user (uid + email) or null if the token is missing,
 * malformed, expired, or has an invalid signature.
 */
export async function verifyIdToken(request: Request): Promise<AuthedUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    const uid = (payload.sub || (payload as Record<string, unknown>).user_id) as string | undefined;
    if (!uid || typeof uid !== 'string') {
      return null;
    }
    const rawEmail = (payload as Record<string, unknown>).email;
    const email = typeof rawEmail === 'string' ? rawEmail : null;
    return { uid, email };
  } catch {
    // Any verification failure (bad signature, expired, wrong audience) → not authed.
    return null;
  }
}

/**
 * Extract the verified Firebase UID from the Authorization header.
 * Returns the uid or null. (Kept for backwards compatibility with existing
 * call sites; now backed by real token verification.)
 */
export async function getUserFromRequest(request: Request): Promise<string | null> {
  const user = await verifyIdToken(request);
  return user?.uid ?? null;
}

function unauthorized(): never {
  throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function forbidden(): never {
  throw new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Require authentication. Returns the verified Firebase UID or throws a 401 Response.
 */
export async function requireAuth(request: Request): Promise<string> {
  const uid = await getUserFromRequest(request);
  if (!uid) {
    unauthorized();
  }
  return uid as string;
}

/**
 * Require authentication and return the full verified user (uid + email).
 * Throws a 401 Response if not authenticated.
 */
export async function requireUser(request: Request): Promise<AuthedUser> {
  const user = await verifyIdToken(request);
  if (!user) {
    unauthorized();
  }
  return user as AuthedUser;
}

const FALLBACK_ADMIN_EMAILS = ['ybyalik@gmail.com'];

/**
 * Load the list of admin emails from the settings table (server-side, via the
 * service-role client). Falls back to the hardcoded owner email if the lookup
 * fails or the row is missing. Returns lowercased emails.
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return FALLBACK_ADMIN_EMAILS.map((e) => e.toLowerCase());
    }
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_emails')
      .single();
    const list = (data?.value as string[] | undefined) ?? FALLBACK_ADMIN_EMAILS;
    return list.map((e) => String(e).toLowerCase());
  } catch {
    return FALLBACK_ADMIN_EMAILS.map((e) => e.toLowerCase());
  }
}

/**
 * Require an authenticated admin. Verifies the token, then checks the verified
 * email against the admin list. Throws 401 if not authenticated, 403 if the
 * authenticated user is not an admin. Returns the verified admin user.
 */
export async function requireAdmin(request: Request): Promise<AuthedUser> {
  const user = await verifyIdToken(request);
  if (!user) {
    unauthorized();
  }
  const email = user!.email?.toLowerCase();
  if (!email) {
    forbidden();
  }
  const admins = await getAdminEmails();
  if (!admins.includes(email as string)) {
    forbidden();
  }
  return user as AuthedUser;
}
