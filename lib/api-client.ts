'use client';

import { auth } from '@/lib/firebase';

/**
 * Client-side fetch helpers that attach the current user's Firebase ID token.
 *
 * Every authenticated API route verifies this token server-side, so any page
 * that calls a protected endpoint MUST send it. Use `apiFetch` in place of
 * `fetch` for calls to protected routes, or `authHeaders()` when you need to
 * build the headers yourself.
 */

/**
 * Build request headers including the Authorization: Bearer token for the
 * currently signed-in user. If nobody is signed in, no Authorization header is
 * added (the server will reject with 401). Merge in any extra headers you need.
 */
export async function authHeaders(
  extra?: Record<string, string>
): Promise<Record<string, string>> {
  let token: string | null = null;
  try {
    const user = auth.currentUser;
    if (user) {
      token = await user.getIdToken();
    }
  } catch {
    token = null;
  }
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

/**
 * Drop-in replacement for `fetch` that automatically attaches the signed-in
 * user's token. Pass a normal RequestInit; existing headers are preserved.
 */
export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const existing = (init.headers as Record<string, string> | undefined) || {};
  const headers = await authHeaders(existing);
  return fetch(input, { ...init, headers });
}
