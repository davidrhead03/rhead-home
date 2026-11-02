-- =============================================================
--  Rhead Home: bank sync tables (Plaid)
--  Paste into Supabase > SQL Editor > New query, then Run.
--  Safe to run again.
-- =============================================================

-- An early Teller version of this table may exist; it was never used, so start fresh.
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_links' and column_name = 'enrollment_id') then
    drop table public.bank_links;
  end if;
end $$;

-- Bank connections. The access token stays here; the app can't read this table.
create table if not exists public.bank_links (
  item_id      text primary key,
  who          text not null check (who in ('david','laura')),
  institution  text,
  access_token text not null,
  user_id      uuid,
  status       text not null default 'ok',
  cursor       text,
  since        text,
  synced_at    timestamptz,
  created_at   timestamptz not null default now()
);

-- Every bank line already brought in (so a deleted expense never comes back).
create table if not exists public.bank_seen (
  tx_id text primary key,
  at    timestamptz not null default now()
);

-- Remembers a bank sign-in in progress (for banks that send you to their own site).
create table if not exists public.bank_pending (
  user_id    uuid primary key,
  link_token text not null,
  item_id    text,
  who        text,
  at         timestamptz not null default now()
);

alter table public.bank_links   enable row level security;
alter table public.bank_seen    enable row level security;
alter table public.bank_pending enable row level security;
-- No policies on purpose: only the bank sync server (secret key) can use these.
revoke all on public.bank_links, public.bank_seen, public.bank_pending from anon, authenticated;
grant all on public.bank_links, public.bank_seen, public.bank_pending to service_role;

select 'Bank sync tables are ready ✓' as result;
