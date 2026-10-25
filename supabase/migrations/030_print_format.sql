-- Which printed format a print order is for (paperback or hardcover).
alter table sp2_print_jobs add column if not exists format text not null default 'paperback';
NOTIFY pgrst, 'reload schema';
