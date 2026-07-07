import { NextResponse } from 'next/server';

/**
 * Return a customer-safe JSON error response and log the real error server-side.
 *
 * Customer-facing responses must never contain raw error text, stack traces,
 * database messages, or internal identifiers. Pass a friendly `message`; the
 * real error is written to the server logs (visible to the admin) only.
 */
export function apiError(
  message: string,
  status = 500,
  logTag?: string,
  err?: unknown
): NextResponse {
  if (err !== undefined) {
    console.error(logTag || '[api-error]', err);
  } else if (logTag) {
    console.error(logTag, message);
  }
  return NextResponse.json({ error: message }, { status });
}

/**
 * If `err` is a Response thrown by requireAuth/requireAdmin, convert it to a
 * NextResponse and return it; otherwise return null so the caller can fall
 * through to its generic 500 handler.
 *
 * Usage inside a catch block:
 *   const authFail = passthroughAuthError(err);
 *   if (authFail) return authFail;
 */
export function passthroughAuthError(err: unknown): NextResponse | null {
  if (err instanceof Response) {
    return new NextResponse(err.body, { status: err.status, headers: err.headers });
  }
  return null;
}
