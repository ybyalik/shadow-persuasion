-- Saved plans from "Plan a Conversation" (/app/warroom).
-- One row per plan the person chose to keep. The plan itself is stored as JSON
-- so its sections can change without new migrations.
CREATE TABLE IF NOT EXISTS conversation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  person_id UUID,              -- optional link to user_profiles_people
  counterpart TEXT,            -- who it's with
  situation TEXT NOT NULL,     -- what it's about
  goal TEXT NOT NULL,          -- what they want to walk away with
  fear TEXT,                   -- what they're afraid the other person will say
  plan JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_plans_user ON conversation_plans(user_id, created_at DESC);

ALTER TABLE conversation_plans ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
