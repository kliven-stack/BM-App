-- ===========================================================================
-- CRM + helpdesk attachments migration. Run once in the Supabase SQL editor.
-- Requires helper functions from schema.sql (is_admin, current_client_id).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1) Client status + tags
-- ---------------------------------------------------------------------------
alter table public.clients
  add column if not exists status text not null default 'active'
    check (status in ('lead', 'active', 'churned'));

alter table public.clients
  add column if not exists tags text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- 2) Internal client notes (admin-only CRM)
-- ---------------------------------------------------------------------------
create table if not exists public.client_notes (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  author_name text,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists client_notes_client_id_idx
  on public.client_notes (client_id, created_at desc);

alter table public.client_notes enable row level security;

drop policy if exists client_notes_admin_all on public.client_notes;
create policy client_notes_admin_all on public.client_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3) Ticket message attachments (stored in the private
--    `ticket-attachments` Storage bucket; upload/download go through the
--    server with the service role, so no storage RLS policies are needed)
-- ---------------------------------------------------------------------------
alter table public.ticket_messages
  add column if not exists attachment_path text;
alter table public.ticket_messages
  add column if not exists attachment_name text;
