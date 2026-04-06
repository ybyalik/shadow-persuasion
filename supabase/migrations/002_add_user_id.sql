-- Add user_id to all user-facing tables
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE practice_results ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  goals TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner',
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User data tables (migrate from localStorage)
CREATE TABLE IF NOT EXISTS user_profiles_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship_type TEXT,
  traits JSONB DEFAULT '{}',
  interactions JSONB DEFAULT '[]',
  playbook JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  who TEXT,
  situation TEXT NOT NULL,
  goal TEXT,
  techniques_used TEXT[] DEFAULT '{}',
  what_you_did TEXT,
  their_response TEXT,
  outcome INTEGER,
  notes TEXT,
  ai_debrief JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  mission_title TEXT,
  response TEXT,
  result TEXT,
  notes TEXT,
  grade TEXT,
  xp_earned INTEGER DEFAULT 0,
  feedback JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  stack JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  original_advice TEXT,
  outcome TEXT,
  notes TEXT,
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spaced_repetition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  technique_id TEXT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'not-started',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase ON user_profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_user ON practice_results(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_people_user ON user_profiles_people(user_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_user ON field_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_completions_user ON mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_stacks_user ON saved_stacks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_user ON spaced_repetition(user_id);

NOTIFY pgrst, 'reload schema';
