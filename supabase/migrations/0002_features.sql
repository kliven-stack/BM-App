-- ===========================================================================
-- Feature migration: helpdesk threads, activity log, website monitoring.
-- Run once in the Supabase SQL editor (safe to re-run).
-- Requires the helper functions from supabase/schema.sql (is_admin,
-- current_client_id).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1) Ticket reply threads
-- ---------------------------------------------------------------------------
create table if not exists public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  author_role text not null default 'client' check (author_role in ('admin', 'client')),
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists ticket_messages_ticket_id_idx
  on public.ticket_messages (ticket_id);

alter table public.ticket_messages enable row level security;

drop policy if exists ticket_messages_admin_all on public.ticket_messages;
create policy ticket_messages_admin_all on public.ticket_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ticket_messages_select_own on public.ticket_messages;
create policy ticket_messages_select_own on public.ticket_messages
  for select using (
    ticket_id in (
      select id from public.tickets where client_id = public.current_client_id()
    )
  );

drop policy if exists ticket_messages_insert_own on public.ticket_messages;
create policy ticket_messages_insert_own on public.ticket_messages
  for insert with check (
    author_id = auth.uid()
    and ticket_id in (
      select id from public.tickets where client_id = public.current_client_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Activity log (admin-visible audit feed)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles (id) on delete set null,
  actor_name text,
  action     text not null,   -- e.g. 'created', 'updated', 'deleted'
  entity     text not null,   -- e.g. 'client', 'website', 'ticket'
  detail     text,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists activity_logs_admin_all on public.activity_logs;
create policy activity_logs_admin_all on public.activity_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3) Website uptime / health checks
-- ---------------------------------------------------------------------------
create table if not exists public.website_checks (
  id          uuid primary key default gen_random_uuid(),
  website_id  uuid not null references public.websites (id) on delete cascade,
  ok          boolean not null default false,
  status_code integer,
  response_ms integer,
  checked_at  timestamptz not null default now()
);
create index if not exists website_checks_website_id_idx
  on public.website_checks (website_id, checked_at desc);

alter table public.website_checks enable row level security;

drop policy if exists website_checks_admin_all on public.website_checks;
create policy website_checks_admin_all on public.website_checks
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists website_checks_select_own on public.website_checks;
create policy website_checks_select_own on public.website_checks
  for select using (
    website_id in (
      select id from public.websites where client_id = public.current_client_id()
    )
  );

-- ===========================================================================
-- OPTIONAL: enable Realtime for the notification bell
--   (Supabase Dashboard → Database → Replication → add `tickets`)
-- ===========================================================================
