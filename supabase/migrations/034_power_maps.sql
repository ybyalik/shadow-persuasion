-- Saved maps from the Power Map builder (/app/power-map, new edition of the book).
-- One row per map the reader chose to keep. The map itself is JSON so its fields
-- can change without new migrations:
--   { people: [{ name, canDecide, need, needBasis: 'said'|'seen'|'guess', resources, knows, options }],
--     me: { canDecide, need, contribute, options },
--     heard, factToCheck, nextStep }
-- Not applied yet. Until it is, the page still works and can print; it only says saving is not switched on.
CREATE TABLE IF NOT EXISTS power_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  decision TEXT NOT NULL,      -- the one decision being mapped
  map JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_power_maps_user ON power_maps(user_id, updated_at DESC);

ALTER TABLE power_maps ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
