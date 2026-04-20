/**
 * Email template loader + renderer.
 *
 * Every Resend email in the system goes through this module. Templates
 * live in the `email_templates` Supabase table so the admin can edit
 * them at runtime from /app/admin/emails without requiring a deploy.
 *
 * If the DB lookup fails or the row is missing we fall back to the
 * caller-supplied code template so we never silently stop sending —
 * the legacy lib/email.ts code stays reachable as a safety net.
 *
 * Variable syntax: {{name}} — simple string replacement, no escaping,
 * no logic. Callers pre-render anything structural (HTML rows, etc.)
 * and pass it as a pre-rendered string.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowpersuasion.com';

/**
 * Secret used to sign one-click unsubscribe links. Prefer a dedicated
 * EMAIL_SIGNING_SECRET so rotating Supabase keys doesn't invalidate
 * every outstanding unsubscribe link; fall back to the service-role
 * key if the dedicated secret isn't set so the system still works on
 * day one.
 */
function getSigningSecret(): string {
  return (
    process.env.EMAIL_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'dev-insecure-secret'
  );
}

export type TemplateRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  trigger_description: string | null;
  subject: string;
  body_html: string;
  body_text: string;
  from_name: string | null;
  from_email: string | null;
  variables: Array<{ name: string; description?: string; sample?: string }>;
  provider: string;
  is_system: boolean;
  enabled: boolean;
  sequence_key: string | null;
  sequence_step: number | null;
  delay_hours: number | null;
  is_transactional: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Render a template string by substituting {{var}} placeholders.
 * Missing variables are replaced with an empty string and logged.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    const v = vars[name];
    if (v === undefined || v === null) {
      // Don't spam — this is expected when a template doesn't use
      // every variable the caller offers.
      return '';
    }
    return String(v);
  });
}

/**
 * Fetch a template row by key. Returns null if the row is missing
 * or the DB is unavailable — caller should fall back to its
 * hardcoded defaults.
 */
export async function loadTemplate(key: string): Promise<TemplateRecord | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data as TemplateRecord;
  } catch (err) {
    console.warn('[email-templates] load failed for', key, err);
    return null;
  }
}

/**
 * Record a send attempt so admins can see delivery history.
 * Fire-and-forget — we never want a logging hiccup to block a real send.
 */
export async function logSend(entry: {
  template_key: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  provider_id?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from('email_sends').insert({
      template_key: entry.template_key,
      to_email: entry.to,
      subject: entry.subject,
      status: entry.status,
      provider_id: entry.provider_id ?? null,
      error: entry.error ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.warn('[email-templates] log failed', err);
  }
}

/* ──────────────────── Unsubscribe ──────────────────── */

/**
 * Has this email opted out of non-transactional sends? Used by the
 * senders to skip recovery / marketing emails for unsubscribed users.
 * Transactional emails (order delivery) bypass this check — Stripe
 * requires we deliver what the customer paid for regardless of
 * marketing preferences.
 */
export async function isUnsubscribed(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('email_unsubscribes')
      .select('id')
      .ilike('email', email)
      .is('resubscribed_at', null)
      .limit(1)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/**
 * HMAC-sign the email so the unsubscribe link is tamper-proof. Used by
 * /api/unsubscribe to verify the request actually came from a link
 * we sent. Base64-url-safe encoding so the link survives email
 * clients that auto-escape.
 */
function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(email: string): string {
  return b64url(crypto.createHmac('sha256', getSigningSecret()).update(email.toLowerCase()).digest());
}

/**
 * Build the one-click unsubscribe URL for a given email. Automatically
 * injected as the `{{unsubscribe_url}}` variable on non-transactional
 * sends.
 */
export function buildUnsubscribeUrl(email: string): string {
  const lower = email.trim().toLowerCase();
  const e = b64url(Buffer.from(lower, 'utf8'));
  const sig = sign(lower);
  return `${SITE_URL}/api/unsubscribe?e=${e}&sig=${sig}`;
}

/**
 * Verify an inbound unsubscribe URL. Returns the decoded email if the
 * signature is valid, null otherwise.
 */
export function verifyUnsubscribeSignature(encodedEmail: string, providedSig: string): string | null {
  try {
    const padded = encodedEmail.replace(/-/g, '+').replace(/_/g, '/');
    const paddedLen = padded.length + ((4 - (padded.length % 4)) % 4);
    const email = Buffer.from(padded.padEnd(paddedLen, '='), 'base64').toString('utf8');
    const expected = sign(email);
    // Constant-time compare
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;
    return email;
  } catch {
    return null;
  }
}

/**
 * Record an unsubscribe. Idempotent: a second call on the same email
 * is a no-op (we don't want to reset `unsubscribed_at` if they click
 * the link twice).
 */
export async function recordUnsubscribe(opts: {
  email: string;
  source: 'link' | 'admin' | 'bounce' | 'complaint';
  templateKey?: string;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from('email_unsubscribes')
      .select('id, resubscribed_at')
      .ilike('email', opts.email)
      .is('resubscribed_at', null)
      .limit(1)
      .maybeSingle();
    if (existing) return { ok: true };
    const { error } = await supabase.from('email_unsubscribes').insert({
      email: opts.email.toLowerCase(),
      source: opts.source,
      template_key: opts.templateKey ?? null,
      reason: opts.reason ?? null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ──────────────────── From address ──────────────────── */

/**
 * Build the From address. Prefers the template's per-row values; falls
 * back to env (RESEND_FROM) or the canonical default.
 */
export function buildFromAddress(template: TemplateRecord | null): string {
  const envFrom = process.env.RESEND_FROM;
  if (template?.from_name && template?.from_email) {
    return `${template.from_name} <${template.from_email}>`;
  }
  if (template?.from_email) return template.from_email;
  if (envFrom) return envFrom;
  return 'Nate Harlan <nate@shadowpersuasion.com>';
}
