-- =============================================================
--  Rhead Home: bank sync tables
--  Paste into Supabase > SQL Editor > New query, then Run.
--  Safe to run again.
-- =============================================================

-- Bank connections. The access token stays here; the app can't read this table.
create table if not exists public.bank_links (
  enrollment_id text primary key,
  who           text not null check (who in ('david','laura')),
  institution   text,
  access_token  text not null,
  user_id       uuid,
  status        text not null default 'ok',
  synced_at     timestamptz,
  created_at    timestamptz not null default now()
);

-- Every bank line already brought in (so a deleted expense never comes back).
create table if not exists public.bank_seen (
  tx_id text primary key,
  at    timestamptz not null default now()
);

alter table public.bank_links enable row level security;
alter table public.bank_seen  enable row level security;
-- No policies on purpose: only the bank sync server (secret key) can use these.
revoke all on public.bank_links, public.bank_seen from anon, authenticated;
grant all on public.bank_links, public.bank_seen to service_role;

select 'Bank sync tables are ready ✓' as result;
