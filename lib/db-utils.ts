/**
 * Escape the wildcard characters used by SQL LIKE/ILIKE so a user-supplied
 * value is matched literally instead of as a pattern.
 *
 * Without this, a value like "%" passed to `.ilike('email', value)` matches
 * every row (it means "match anything"), which can bypass an email lookup.
 * Postgres ILIKE uses `\` as the default escape character, so we backslash the
 * three metacharacters: \  %  _
 */
export function escapeLike(value: string): string {
  return value.replace(/([\\%_])/g, '\\$1');
}

/** Basic email shape check. Rejects blanks and obviously non-email input. */
export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
