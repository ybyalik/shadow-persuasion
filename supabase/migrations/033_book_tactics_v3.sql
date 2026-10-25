-- Spot the Tactic for the new edition ("The Hidden Rules of Power").
--
-- The new Tactic Spotter (book-v3/bonuses/drafts/tactic-spotter.md) has 42 ordinary
-- entries in 5 families plus 6 danger signs. It is set up differently from the old
-- guide: each entry gives other explanations to read first, what makes it concerning,
-- one calm reply and when not to confront. Danger signs have no reply on purpose and
-- point to Chapter 11 and real help instead.
--
-- The new entries go into the SAME book_tactics table, so Train mode (tactic_examples)
-- and progress (tactic_progress) keep working without changes. They are told apart by:
--   edition = 'v3' and a slug that starts with "v3-" (for example v3-the-ledger).
-- The old 50 rows get edition = 'v2' and are not changed otherwise.
-- The app reads v3 rows only when NEXT_PUBLIC_BOOK_EDITION=v3, and falls back to the
-- old rows if this migration or the seed has not been run yet.
--
-- Loaded by: python3 funnel-v2/app-knowledge/seed_practice_v3.py (safe to re-run;
-- try --dry-run first). Adds columns only; nothing is deleted or rewritten.

alter table book_tactics add column if not exists edition text not null default 'v2';
alter table book_tactics add column if not exists other_explanations text;
alter table book_tactics add column if not exists not_confront text;
alter table book_tactics add column if not exists help text;
alter table book_tactics add column if not exists book_note text;

create index if not exists book_tactics_edition_idx on book_tactics (edition, chapter, number);

comment on column book_tactics.edition is 'Which book edition the row belongs to: v2 (old 50 tactics) or v3 (new Tactic Spotter, slugs start with v3-).';
comment on column book_tactics.other_explanations is 'v3: other explanations to read first (ordinary entries).';
comment on column book_tactics.warning_sign is 'v2: warning sign. v3: what makes it concerning as a pattern (ordinary) or why there is no script (danger).';
comment on column book_tactics.not_confront is 'v3: when not to confront.';
comment on column book_tactics.help is 'v3 danger signs: what helps instead of a script.';
comment on column book_tactics.book_note is 'v3: the chapters the entry points to, as written in the guide (e.g. "Chapter 7; Chapter 3, The Rules You Never Chose.").';

NOTIFY pgrst, 'reload schema';
