-- ============================================================================
-- 015_checkout_leads.sql — Cart abandonment / lead capture
-- ============================================================================
-- Captures an email the moment someone types it into /checkout/book, before
-- they complete payment. Enables automated recovery email sequence.
--
-- Lifecycle:
--   created            → user typed an email, nothing else
--   abandoned          → no payment attempted within 24h
--   recovery_sent_1    → first recovery email sent
--   recovery_sent_2    → second recovery email sent
--   recovery_sent_3    → third recovery email sent
--   converted          → they completed payment (linked to orders table)
--   recovered          → they completed payment AFTER receiving a recovery email
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkout_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL,
  first_name            text,
  funnel                text NOT NULL DEFAULT 'book_checkout',     -- which checkout they were on
  include_bump          boolean DEFAULT false,                     -- did they have the bump checked
  amount_cents          integer,                                    -- intended order amount
  status                text NOT NULL DEFAULT 'created',           -- lifecycle state
  converted_at          timestamptz,                                -- when they completed payment
  order_id              uuid REFERENCES orders(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,                                   -- link to the PI if they started checkout
  recovery_emails       jsonb DEFAULT '[]'::jsonb,                  -- array of { step, sent_at, email_id }
  recovered_by_email_step integer,                                  -- which step closed the sale (1, 2, or 3) — NULL if organic
  ip_address            text,
  user_agent            text,
  referrer              text,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  metadata              jsonb DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Unique per email (most recent lead wins) so we don't spam the same person.
-- Use a unique constraint on email + funnel for uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS checkout_leads_email_funnel_idx ON checkout_leads (LOWER(email), funnel);

CREATE INDEX IF NOT EXISTS checkout_leads_status_idx      ON checkout_leads (status);
CREATE INDEX IF NOT EXISTS checkout_leads_created_at_idx  ON checkout_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS checkout_leads_converted_idx   ON checkout_leads (converted_at) WHERE converted_at IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION checkout_leads_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS checkout_leads_updated_at ON checkout_leads;
CREATE TRIGGER checkout_leads_updated_at
  BEFORE UPDATE ON checkout_leads
  FOR EACH ROW EXECUTE FUNCTION checkout_leads_set_updated_at();

-- Row-level security: service role only (admin + API)
ALTER TABLE checkout_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY checkout_leads_service_role_all ON checkout_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE  checkout_leads IS 'Captured emails from checkout funnels before payment. Drives cart abandonment recovery sequence.';
COMMENT ON COLUMN checkout_leads.status IS 'Lifecycle: created | abandoned | recovery_sent_1 | recovery_sent_2 | recovery_sent_3 | converted | recovered';
COMMENT ON COLUMN checkout_leads.recovered_by_email_step IS 'If conversion happened after a recovery email (within 48h of that email), which email step closed it.';
