CREATE TABLE IF NOT EXISTS technique_summaries (
  technique_id TEXT PRIMARY KEY,
  description TEXT,
  how_to JSONB DEFAULT '[]',
  when_to_use TEXT,
  when_not_to_use TEXT,
  examples JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now()
);

NOTIFY pgrst, 'reload schema';
