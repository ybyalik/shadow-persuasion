-- The 21-Day Power Reset (v3 edition): check-ins, tool pages and after-the-reset pages.
--
-- NOT APPLIED YET. Apply at launch, right after 031_reset_days_v3.sql and before
-- running funnel-v2/app-knowledge/seed_reset_days_v3.py (the seed fills the new
-- practice column). It only ADDS things. It does not touch any v2 table.
--
-- 1. reset_days_v3.practice: the book's "Today's practice" line for each day, word for word.
--    The app falls back to the drill text while this column is empty.
--
-- 2. reset_pages_v3: one row per person per page, the answers kept as JSON.
--    page_key is one of:
--      checkin-1 .. checkin-4   the four check-ins (five statements from Chapter 31, rated 0 to 10)
--      replay-4                 Day 4 replay page
--      map-6                    Day 6 Power Map
--      choice-7                 Day 7 Choice Check
--      ask-12                   Day 12 Clean Ask planner (with the Four Fair Influence Tests)
--      trade-18                 Day 18 trade proposal
--      confirm-19               Day 19 Smallest Agreed Step confirmation
--      repair-20                Day 20 repair
--      rewrite-21               Day 21 rewrite of the Day 4 replay
--      review-1, review-2       weekly reviews on Days 7 and 14 (reflection = short AI reflection)
--      review-3                 the Day 21 wrap-up
--      monthly-YYYY-MM          the monthly check-in after the reset
--      drills                   courage drills ticked off in the current round
--    The page list lives in app/app/field-ops/reset-pages.ts; the API only accepts those keys.
--    Until this table exists, the Reset page still works and shows these pages with a
--    short "saving isn't switched on yet" note instead of a Save button.

alter table reset_days_v3 add column if not exists practice text;

create table if not exists reset_pages_v3 (
  user_id text not null,
  page_key text not null check (page_key ~ '^[a-z0-9-]{1,40}$'),
  answers jsonb not null default '{}'::jsonb,
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, page_key)
);
create index if not exists reset_pages_v3_user_time_idx on reset_pages_v3 (user_id, updated_at desc);

alter table reset_pages_v3 enable row level security;

NOTIFY pgrst, 'reload schema';
