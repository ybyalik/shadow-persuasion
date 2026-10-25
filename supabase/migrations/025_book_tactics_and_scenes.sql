-- Spot the Tactic and Practice Scenes, rebuilt on the book's own content.
--
-- book_tactics: the 50 tactics from the free Tactic Spotter guide, each tied to
--   the Part Three chapter (11 to 18) that covers its family. Loaded by
--   funnel-v2/app-knowledge/seed_practice.py (safe to re-run).
-- tactic_examples: realistic messages for Train mode. The seed lines go in as
--   source 'seed'; lines written by the AI are cached here (source 'ai') so we
--   pay for each one only once.
-- tactic_progress: per-person spaced repetition for Train mode, keyed by tactic
--   slug. Tactics someone gets wrong come back sooner.
-- scenarios (from 005) gains columns so it can hold the book's practice scenes
--   and private scenes people make from their own situation. The old
--   third-party scenarios stay in the table but are no longer listed.

create table if not exists book_tactics (
  slug text primary key,
  number integer not null,
  name text not null,
  family text,
  chapter integer not null,
  chapter_title text not null,
  looks_like text not null,
  purpose text not null,
  warning_sign text not null,
  calm_reply text not null,
  note text,
  examples text[] not null default '{}',
  harm text,
  works_on text,
  safety boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists book_tactics_chapter_idx on book_tactics (chapter, number);

create table if not exists tactic_examples (
  id uuid primary key default gen_random_uuid(),
  tactic_slug text not null references book_tactics (slug) on delete cascade,
  message text not null,
  context text,
  source text not null default 'ai',
  created_at timestamptz not null default now()
);
create index if not exists tactic_examples_slug_idx on tactic_examples (tactic_slug);
create unique index if not exists tactic_examples_unique_msg on tactic_examples (tactic_slug, md5(message));

create table if not exists tactic_progress (
  user_id text not null,
  tactic_slug text not null references book_tactics (slug) on delete cascade,
  ease_factor double precision not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  next_review_at timestamptz not null default now(),
  last_review_at timestamptz,
  times_right integer not null default 0,
  times_wrong integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, tactic_slug)
);
create index if not exists tactic_progress_due_idx on tactic_progress (user_id, next_review_at);

alter table scenarios add column if not exists is_book boolean not null default false;
alter table scenarios add column if not exists user_id text;
alter table scenarios add column if not exists chapter integer;
alter table scenarios add column if not exists chapter_title text;
alter table scenarios add column if not exists tactic_slug text;
alter table scenarios add column if not exists other_person text;
alter table scenarios add column if not exists opening_line text;
alter table scenarios add column if not exists sort_order integer;
create index if not exists scenarios_book_idx on scenarios (is_book, sort_order);
create index if not exists scenarios_user_idx on scenarios (user_id);

alter table book_tactics enable row level security;
alter table tactic_examples enable row level security;
alter table tactic_progress enable row level security;

NOTIFY pgrst, 'reload schema';
