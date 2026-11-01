# Rhead Home

David & Laura's home app.

- `site/` — the app itself (published by Cloudflare at https://rhead-home.davidrhead03.workers.dev)
- `supabase/setup.sql` — database setup (run in Supabase > SQL Editor)
- `supabase/functions/notify/` — the notification sender (Supabase Edge Function "notify")
- `worker/index.js` — bank sync (Teller): answers `/api/bank` and pulls new transactions every 6 hours
- `supabase/bank.sql` — private tables for bank sync (run once in SQL Editor)
