-- ════════════════════════════════════════════════════════════
-- Email cadence (DB-driven) + unsubscribe management
--
-- Builds on migration 016:
--   - `delay_hours` lets sequence templates define their own cadence
--     from the admin UI instead of being hardcoded in the cron.
--   - `is_transactional` separates required-by-law delivery emails
--     (order receipts) from marketing emails (recovery sequences)
--     that must honor unsubscribe.
--   - `email_unsubscribes` is the permanent opt-out list checked
--     before any non-transactional send.
-- ════════════════════════════════════════════════════════════

-- 1. New columns on email_templates
ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS delay_hours int,            -- null = fires immediately; N = N hours after triggering event
  ADD COLUMN IF NOT EXISTS is_transactional boolean DEFAULT false;

-- 2. Backfill existing seed rows with cadence + transactional flags
UPDATE email_templates SET is_transactional = true, delay_hours = NULL WHERE key = 'order_delivery';
UPDATE email_templates SET is_transactional = false, delay_hours = 1  WHERE key = 'cart_recovery_1';
UPDATE email_templates SET is_transactional = false, delay_hours = 24 WHERE key = 'cart_recovery_2';
UPDATE email_templates SET is_transactional = false, delay_hours = 72 WHERE key = 'cart_recovery_3';

-- 3. Add unsubscribe variable to recovery templates so the admin can
-- see/edit it, and the preview + sender know it's expected.
UPDATE email_templates
  SET variables = variables || $JSON$[
    {"name": "unsubscribe_url", "description": "Auto-populated one-click unsubscribe link (HMAC-signed).", "sample": "https://shadowpersuasion.com/api/unsubscribe?e=...&sig=..."}
  ]$JSON$::jsonb
  WHERE sequence_key = 'cart_recovery'
    AND NOT (variables @> '[{"name": "unsubscribe_url"}]'::jsonb);

-- 4. Unsubscribe list
CREATE TABLE IF NOT EXISTS email_unsubscribes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  reason          text,
  source          text,           -- 'link' | 'admin' | 'bounce' | 'complaint'
  template_key    text,           -- which email triggered the unsub (if known)
  unsubscribed_at timestamptz DEFAULT now(),
  resubscribed_at timestamptz,
  metadata        jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_status ON email_unsubscribes(email)
  WHERE resubscribed_at IS NULL;

-- 5. Help the cron pick up recovery rows fast
CREATE INDEX IF NOT EXISTS idx_email_templates_sequence_enabled
  ON email_templates(sequence_key, sequence_step)
  WHERE enabled = true AND sequence_key IS NOT NULL;
