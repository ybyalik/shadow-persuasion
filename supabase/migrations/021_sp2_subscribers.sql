-- ============================================================================
-- 021_sp2_subscribers.sql — Shadow Persuasion v2 free-chapter subscribers
-- ============================================================================
-- People who download the free first chapter on the v2 pages (/v2). Drives
-- the 20-email follow-up sequence (/api/cron/sp2-sequence).
--
-- Deliberately separate from checkout_leads: the existing hourly
-- cart-recovery cron reads every checkout_leads row, so v2 signups must
-- never land there.
--
-- Lifecycle (status):
--   active     → in the sequence, next email due at next_send_at
--   converted  → bought the book; sequence stops
--   completed  → received all 20 emails
--   unsubscribed
-- ============================================================================

CREATE TABLE IF NOT EXISTS sp2_subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text NOT NULL,
  first_name       text,
  source           text NOT NULL DEFAULT 'free_chapter',
  status           text NOT NULL DEFAULT 'active',
  sequence_step    integer NOT NULL DEFAULT 0,   -- last email number sent (0 = none yet)
  next_send_at     timestamptz,                  -- when the next email is due (null = nothing due)
  last_sent_at     timestamptz,
  converted_at     timestamptz,
  order_id         uuid REFERENCES orders(id) ON DELETE SET NULL,
  is_test          boolean NOT NULL DEFAULT false,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  referrer         text,
  ip_address       text,
  user_agent       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sp2_subscribers_email_idx ON sp2_subscribers (LOWER(email));
CREATE INDEX IF NOT EXISTS sp2_subscribers_due_idx ON sp2_subscribers (next_send_at) WHERE status = 'active';

CREATE OR REPLACE FUNCTION sp2_subscribers_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sp2_subscribers_updated_at ON sp2_subscribers;
CREATE TRIGGER sp2_subscribers_updated_at
  BEFORE UPDATE ON sp2_subscribers
  FOR EACH ROW EXECUTE FUNCTION sp2_subscribers_set_updated_at();

ALTER TABLE sp2_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sp2_subscribers_service_role_all ON sp2_subscribers;
CREATE POLICY sp2_subscribers_service_role_all ON sp2_subscribers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE sp2_subscribers IS 'Shadow Persuasion v2 free-chapter subscribers and their 20-email sequence progress.';
