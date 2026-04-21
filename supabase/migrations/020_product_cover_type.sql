-- ════════════════════════════════════════════════════════════
-- Product file types — 'download' vs 'cover'
--
-- Reuses the product_files table for two distinct purposes:
--   1. 'download' — the PDFs / files delivered to buyers post-
--      purchase. Referenced by the delivery email + thank-you
--      page. Unchanged behavior — default for existing rows.
--   2. 'cover'   — product cover images rendered across landing
--      pages, checkout order bump, upsell pages, etc. The
--      ProductCover React component reads these.
--
-- Keeps file admin in one place; UI groups them by product +
-- file_type.
-- ════════════════════════════════════════════════════════════

ALTER TABLE product_files
  ADD COLUMN IF NOT EXISTS file_type text NOT NULL DEFAULT 'download';

-- Narrow, fast index for the public cover lookup (runs on every
-- page load that renders a <ProductCover>).
CREATE INDEX IF NOT EXISTS idx_product_files_covers
  ON product_files(product_slug)
  WHERE is_active = true AND file_type = 'cover';

-- Make the existing download index still useful under the new
-- discriminator; keep old index too since it predates file_type.
CREATE INDEX IF NOT EXISTS idx_product_files_downloads
  ON product_files(product_slug, sort_order)
  WHERE is_active = true AND file_type = 'download';
