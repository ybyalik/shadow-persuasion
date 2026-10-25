-- My People, Goals and Talk It Through (the defense-first rework).
--
-- user_profiles_people:
--   notes                  the reader's own notes about this person
--   tactics                tally of pressure tactics this person tends to use,
--                          [{ name, chapter, count, lastSeen }]
--   what_worked            calm replies that landed, [{ id, date, text, interactionId }]
--   next_recommended_action one plain next step (read by lib/person-context.ts)
--   (playbook now holds the "How to handle [name]" summary:
--    { approach, dos, donts, sayThis, pressureNote, chapters, generatedAt })
-- chat_sessions.person_id: a "talk about [name]" chat tied to one person.

ALTER TABLE user_profiles_people ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_profiles_people ADD COLUMN IF NOT EXISTS tactics JSONB DEFAULT '[]';
ALTER TABLE user_profiles_people ADD COLUMN IF NOT EXISTS what_worked JSONB DEFAULT '[]';
ALTER TABLE user_profiles_people ADD COLUMN IF NOT EXISTS next_recommended_action TEXT;

ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS person_id UUID;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_person ON chat_sessions(person_id);

NOTIFY pgrst, 'reload schema';
