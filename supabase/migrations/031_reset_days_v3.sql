-- The 21-Day Power Reset for the NEW book edition (v3, "Shadow Persuasion:
-- The Hidden Rules of Power", Part VII, Chapters 31 to 34).
--
-- NOT APPLIED YET. Apply at launch (see book-v3/launch-checklist.md, "App and emails").
-- It only ADDS two new tables. It does not touch reset_days / reset_progress, which
-- the v2 app (current customers) keeps using until NEXT_PUBLIC_BOOK_EDITION=v3.
--
-- reset_days_v3: Days 1 to 21, numbered as in the book. Days 1-3 Quick Start
--   (Ch 31), 4-7 Week One: Notice (Ch 32), 8-14 Week Two: Pause and Choose (Ch 33),
--   15-21 Week Three: Hold and Follow Through (Ch 34).
--   Filled by funnel-v2/app-knowledge/seed_reset_days_v3.py (safe to re-run).
-- reset_progress_v3: one row per person per finished day. Kept apart from the v2
--   progress because the step numbers mean different days in the two books
--   (v2 step 4 = "Day 1"; v3 day 4 = "Day 4"). Switching the edition back to v2
--   brings back everyone's v2 progress untouched.

create table if not exists reset_days_v3 (
  day_number integer primary key check (day_number between 1 and 21),
  phase text not null check (phase in ('quick_start', 'notice', 'pause', 'hold')),
  label text not null,
  title text not null,
  drill text not null,
  morning_prompt text not null,
  journal_prompts jsonb not null default '[]'::jsonb,
  chapter integer not null,
  chapter_title text not null,
  updated_at timestamptz not null default now()
);

create table if not exists reset_progress_v3 (
  user_id text not null,
  day_number integer not null references reset_days_v3 (day_number) on delete cascade,
  note text,
  reflection text,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day_number)
);
create index if not exists reset_progress_v3_user_time_idx on reset_progress_v3 (user_id, completed_at desc);

alter table reset_days_v3 enable row level security;
alter table reset_progress_v3 enable row level security;

NOTIFY pgrst, 'reload schema';
