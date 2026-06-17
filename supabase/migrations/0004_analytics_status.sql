-- ===========================================================================
-- Real analytics + public status page. Run once in the Supabase SQL editor.
-- Requires the pgcrypto extension (enabled in schema.sql).
-- ===========================================================================

-- Optional Plausible domain per website (e.g. "example.com"). When set and
-- PLAUSIBLE_API_KEY is configured, the metrics cron pulls real traffic data.
alter table public.websites
  add column if not exists plausible_domain text;

-- Unguessable public token per client → powers /status/<token>.
alter table public.clients
  add column if not exists public_token text
    default encode(gen_random_bytes(12), 'hex');

-- Backfill any rows that pre-date the default.
update public.clients
  set public_token = encode(gen_random_bytes(12), 'hex')
  where public_token is null;

create unique index if not exists clients_public_token_idx
  on public.clients (public_token);
