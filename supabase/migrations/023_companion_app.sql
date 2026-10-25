-- Companion app for book buyers (the paperback includes 60 days of the app).
--
-- app_access: time-limited access granted outside a Stripe subscription
--   (book purchase, admin extension). One row per email; access_until is
--   pushed forward, never back, when more access is granted.
-- ai_usage: one row per AI call, with OpenRouter's reported cost, so we can
--   cap spend per person and see what the app really costs.

create table if not exists app_access (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id text,
  source text not null default 'book',
  access_until timestamptz not null,
  order_id uuid,
  reminder_50_sent_at timestamptz,
  reminder_58_sent_at timestamptz,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists app_access_email_key on app_access (lower(email));
create index if not exists app_access_user_idx on app_access (user_id);
create index if not exists app_access_until_idx on app_access (access_until);

create table if not exists ai_usage (
  id bigserial primary key,
  user_id text not null,
  feature text not null,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time_idx on ai_usage (user_id, created_at desc);

alter table app_access enable row level security;
alter table ai_usage enable row level security;

-- Spend caps per person (US dollars of AI cost), editable from the database.
insert into app_settings (key, value)
values ('ai_budget', '{"daily_usd": 0.5, "monthly_usd": 3}'::jsonb)
on conflict (key) do nothing;
NOTIFY pgrst, 'reload schema';
