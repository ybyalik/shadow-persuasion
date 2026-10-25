-- The 21-Day Reset (app page /app/field-ops), from Part Two of the book.
--
-- reset_days: the 24 steps of the reset, in order. Steps 1-3 are the 3-Day
--   Quick Start (Chapter 6), steps 4-24 are Days 1-21 (Chapters 8, 9, 10).
--   Filled by funnel-v2/app-knowledge/seed_reset_days.py (safe to re-run).
-- reset_progress: one row per person per finished step, with their journal
--   note and the optional short AI reflection on it. The person's current
--   step is the first one without a row here (they move at their own pace).

create table if not exists reset_days (
  day_number integer primary key check (day_number between 1 and 24),
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

create table if not exists reset_progress (
  user_id text not null,
  day_number integer not null references reset_days (day_number) on delete cascade,
  note text,
  reflection text,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day_number)
);
create index if not exists reset_progress_user_time_idx on reset_progress (user_id, completed_at desc);

alter table reset_days enable row level security;
alter table reset_progress enable row level security;

NOTIFY pgrst, 'reload schema';
