/**
 * Auth helpers for API routes.
 * Extracts Firebase UID from the JWT in the Authorization header.
 */

/**
 * Decode a base64url string to a regular string.
 */
function base64UrlDecode(str: string): string {
  // Replace base64url chars with base64 equivalents
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make length a multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Extract the Firebase UID from the Authorization Bearer token.
 * Decodes the JWT payload (without verification — server-side verification to be added later).
 * Returns the user_id (sub claim) or null if not present/invalid.
 */
export async function getUserFromRequest(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    // Firebase tokens use 'sub' for the UID, but also check 'user_id' as a fallback
    const userId = payload.sub || payload.user_id || null;
    return typeof userId === 'string' ? userId : null;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the Firebase UID or throws a Response with 401.
 */
export async function requireAuth(request: Request): Promise<string> {
  const userId = await getUserFromRequest(request);
  if (!userId) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return userId;
}
