-- ============================================================================
-- 022_sp2_print_jobs.sql — Lulu print orders for the v2 paperback
-- ============================================================================
-- One row per paperback order. Created when the Stripe payment succeeds
-- (lib/sp2/fulfill.ts), sent to Lulu's Print API, then kept up to date by
-- Lulu's webhook (/api/lulu/webhook) and a daily check (/api/cron/sp2-print-jobs).
--
-- status mirrors Lulu's print-job status (CREATED, UNPAID, PRODUCTION_DELAYED,
-- IN_PRODUCTION, SHIPPED, DELIVERED, REJECTED, CANCELED, ERROR) plus our own:
--   pending      → saved, not yet sent to Lulu
--   dry_run      → orders to Lulu are switched off (LULU_ORDERS_ENABLED unset), nothing sent
--   send_failed  → Lulu rejected the request; error kept for admins only
-- ============================================================================

CREATE TABLE IF NOT EXISTS sp2_print_jobs (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                  uuid REFERENCES orders(id) ON DELETE SET NULL,
  stripe_payment_intent_id  text NOT NULL UNIQUE,
  email                     text NOT NULL,
  quantity                  integer NOT NULL DEFAULT 1,
  shipping_level            text NOT NULL,
  shipping_address          jsonb NOT NULL,
  shipping_charged_cents    integer,                 -- what the customer paid for shipping
  lulu_print_job_id         bigint,
  status                    text NOT NULL DEFAULT 'pending',
  lulu_costs                jsonb,                   -- Lulu's cost breakdown for the job
  tracking_id               text,
  tracking_urls             jsonb,
  carrier_name              text,
  shipped_email_sent_at     timestamptz,
  error                     text,                    -- admin-only; never shown to customers
  attempts                  integer NOT NULL DEFAULT 0,
  is_test                   boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sp2_print_jobs_status_idx ON sp2_print_jobs (status);
CREATE INDEX IF NOT EXISTS sp2_print_jobs_lulu_idx ON sp2_print_jobs (lulu_print_job_id);

CREATE OR REPLACE FUNCTION sp2_print_jobs_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sp2_print_jobs_updated_at ON sp2_print_jobs;
CREATE TRIGGER sp2_print_jobs_updated_at
  BEFORE UPDATE ON sp2_print_jobs
  FOR EACH ROW EXECUTE FUNCTION sp2_print_jobs_set_updated_at();

ALTER TABLE sp2_print_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sp2_print_jobs_service_role_all ON sp2_print_jobs;
CREATE POLICY sp2_print_jobs_service_role_all ON sp2_print_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE sp2_print_jobs IS 'Lulu print orders for the Shadow Persuasion v2 paperback.';
