-- =============================================================
--  Rhead Home: database setup
--  Paste this whole file into Supabase > SQL Editor > New query,
--  then press Run. Safe to run again if something goes wrong.
-- =============================================================

-- 1. Every record in the app (lists, chat, bills, ...) lives in one table.
create table if not exists public.docs (
  col        text        not null,               -- which part of the app: 'items', 'msgs', 'bills', ...
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  at         bigint      generated always as (
               case when jsonb_typeof(data->'at') = 'number' then floor((data->>'at')::numeric)::bigint else 0 end
             ) stored,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
create index if not exists docs_col_at on public.docs (col, at desc);

-- Merge a few fields into a record (used when you edit something).
create or replace function public.doc_merge(p_col text, p_id text, p_patch jsonb)
returns void language sql security invoker as $$
  update public.docs set data = data || p_patch, updated_at = now()
  where col = p_col and id = p_id;
$$;

-- 2. Phones that asked for notifications.
create table if not exists public.push_subs (
  endpoint   text primary key,
  who        text not null check (who in ('david','laura')),
  sub        jsonb not null,
  ua         text,
  created_at timestamptz not null default now()
);

-- 3. Private settings for the notification sender (nobody but the sender can read these).
create table if not exists public.push_config (
  id            int primary key default 1 check (id = 1),
  vapid_public  text,
  vapid_private jsonb,
  cron_secret   text not null
);
insert into public.push_config (id, cron_secret)
values (1, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

-- Remembers which reminders were already sent, so nothing is sent twice.
create table if not exists public.push_sent (
  key text primary key,
  at  timestamptz not null default now()
);

-- 4. Security: only signed-in people (just David and Laura) can touch the data.
alter table public.docs        enable row level security;
alter table public.push_subs   enable row level security;
alter table public.push_config enable row level security;
alter table public.push_sent   enable row level security;

drop policy if exists "members only" on public.docs;
create policy "members only" on public.docs for all to authenticated using (true) with check (true);
drop policy if exists "members only" on public.push_subs;
create policy "members only" on public.push_subs for all to authenticated using (true) with check (true);
-- push_config and push_sent have no policies on purpose: only the sender can use them.

revoke all on public.docs, public.push_subs, public.push_config, public.push_sent from anon;
revoke all on public.push_config, public.push_sent from authenticated;
grant select, insert, update, delete on public.docs, public.push_subs to authenticated;
grant execute on function public.doc_merge(text, text, jsonb) to authenticated;
grant all on public.docs, public.push_subs, public.push_config, public.push_sent to service_role;
grant execute on function public.doc_merge(text, text, jsonb) to service_role;
revoke execute on function public.doc_merge(text, text, jsonb) from anon, public;

-- 5. Live updates between the two phones.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 6. Photos folder. Photo names are long random codes, so only the app knows them.
insert into storage.buckets (id, name, public, file_size_limit)
values ('photos', 'photos', true, 20971520)
on conflict (id) do update set public = true;

drop policy if exists "members read photos" on storage.objects;
create policy "members read photos" on storage.objects for select to authenticated using (bucket_id = 'photos');
drop policy if exists "members upload photos" on storage.objects;
create policy "members upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
drop policy if exists "members change photos" on storage.objects;
create policy "members change photos" on storage.objects for update to authenticated using (bucket_id = 'photos');
drop policy if exists "members delete photos" on storage.objects;
create policy "members delete photos" on storage.objects for delete to authenticated using (bucket_id = 'photos');

-- 7. Reminder check every 15 minutes (bills, plans, birthdays, ...).
create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$ begin perform cron.unschedule('rhead-reminders'); exception when others then null; end $$;
select cron.schedule(
  'rhead-reminders',
  '*/15 * * * *',
  $job$
  select net.http_post(
    url     := 'https://rxtqhjukfwnrwvcdjivx.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json',
                                  'x-cron-secret', (select cron_secret from public.push_config where id = 1)),
    body    := '{"kind":"tick"}'::jsonb
  );
  $job$
);

-- Clean out old "already sent" markers once a week.
do $$ begin perform cron.unschedule('rhead-cleanup'); exception when others then null; end $$;
select cron.schedule('rhead-cleanup', '0 8 * * 0', $c$ delete from public.push_sent where at < now() - interval '60 days' $c$);

select 'Rhead Home database is ready ✓' as result;
