// Fallback if API hasn't loaded yet
const FALLBACK_ADMIN_EMAILS = ['ybyalik@gmail.com'];

let cachedAdminEmails: string[] | null = null;

export async function getAdminEmails(): Promise<string[]> {
  if (cachedAdminEmails) return cachedAdminEmails;
  try {
    const res = await fetch('/api/settings?key=admin_emails');
    if (res.ok) {
      const data = await res.json();
      cachedAdminEmails = (data.value as string[] | null) || FALLBACK_ADMIN_EMAILS;
      return cachedAdminEmails;
    }
  } catch {
    // Silently fall back
  }
  return FALLBACK_ADMIN_EMAILS;
}

export function isAdminSync(email: string | null | undefined): boolean {
  if (!email) return false;
  return (cachedAdminEmails || FALLBACK_ADMIN_EMAILS).includes(email);
}
