-- Multi-conversation "campaigns": a goal pursued across several conversations,
-- optionally tied to a saved person, with a planned sequence of steps to track.
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  person_id UUID,                 -- optional link to user_profiles_people
  person_name TEXT,               -- denormalized name for display
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  situation TEXT,
  status TEXT DEFAULT 'active',   -- active | won | abandoned
  steps JSONB DEFAULT '[]',       -- [{ label, detail, done (bool), notes }]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);

NOTIFY pgrst, 'reload schema';
