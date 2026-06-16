-- ===========================================================================
-- SaaS Client Portal — Supabase schema + Row Level Security
-- ===========================================================================
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- It is idempotent-ish: safe to re-run in a fresh project.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  email      text,
  role       text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.websites (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  name       text not null,
  url        text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.website_metrics (
  id                   uuid primary key default gen_random_uuid(),
  website_id           uuid not null references public.websites (id) on delete cascade,
  date                 date not null,
  visitors             integer not null default 0,
  page_views           integer not null default 0,
  bounce_rate          double precision not null default 0,
  avg_session_duration double precision not null default 0,
  created_at           timestamptz not null default now(),
  unique (website_id, date)
);

create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  client_id              uuid not null references public.clients (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text not null default 'incomplete',
  price                  numeric(10, 2) not null default 0,
  billing_cycle          text not null default 'monthly',
  created_at             timestamptz not null default now()
);

create table if not exists public.invoices (
  id                 uuid primary key default gen_random_uuid(),
  subscription_id    uuid references public.subscriptions (id) on delete cascade,
  stripe_invoice_id  text unique,
  amount             numeric(10, 2) not null default 0,
  status             text not null default 'open',
  hosted_invoice_url text,
  created_at         timestamptz not null default now()
);

create table if not exists public.tickets (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  subject    text not null,
  message    text not null,
  status     text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

-- Helpful indexes for the RLS sub-selects and common lookups.
create index if not exists websites_client_id_idx        on public.websites (client_id);
create index if not exists website_metrics_website_id_idx on public.website_metrics (website_id);
create index if not exists subscriptions_client_id_idx    on public.subscriptions (client_id);
create index if not exists invoices_subscription_id_idx   on public.invoices (subscription_id);
create index if not exists tickets_client_id_idx          on public.tickets (client_id);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER avoids recursive RLS evaluation)
-- ---------------------------------------------------------------------------

-- Is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Resolve the clients.id that belongs to the currently logged-in client user.
-- A client is matched to a clients row by email (the email they authenticate
-- with must equal the clients.email an admin entered for them).
create or replace function public.current_client_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select c.id
  from public.clients c
  where lower(c.email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Enable Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.clients         enable row level security;
alter table public.websites        enable row level security;
alter table public.website_metrics enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.invoices        enable row level security;
alter table public.tickets         enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
-- Pattern: admins get full access; clients get scoped read access; clients
-- may only INSERT tickets. The service role key bypasses RLS entirely and is
-- used server-side by Stripe webhooks.
-- ---------------------------------------------------------------------------

-- ----- profiles -----
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

-- ----- clients -----
drop policy if exists clients_admin_all on public.clients;
create policy clients_admin_all on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists clients_select_own on public.clients;
create policy clients_select_own on public.clients
  for select using (id = public.current_client_id());

-- ----- websites -----
drop policy if exists websites_admin_all on public.websites;
create policy websites_admin_all on public.websites
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists websites_select_own on public.websites;
create policy websites_select_own on public.websites
  for select using (client_id = public.current_client_id());

-- ----- website_metrics -----
drop policy if exists website_metrics_admin_all on public.website_metrics;
create policy website_metrics_admin_all on public.website_metrics
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists website_metrics_select_own on public.website_metrics;
create policy website_metrics_select_own on public.website_metrics
  for select using (
    website_id in (
      select id from public.websites where client_id = public.current_client_id()
    )
  );

-- ----- subscriptions -----
drop policy if exists subscriptions_admin_all on public.subscriptions;
create policy subscriptions_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (client_id = public.current_client_id());

-- ----- invoices -----
drop policy if exists invoices_admin_all on public.invoices;
create policy invoices_admin_all on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists invoices_select_own on public.invoices;
create policy invoices_select_own on public.invoices
  for select using (
    subscription_id in (
      select id from public.subscriptions where client_id = public.current_client_id()
    )
  );

-- ----- tickets -----
drop policy if exists tickets_admin_all on public.tickets;
create policy tickets_admin_all on public.tickets
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists tickets_select_own on public.tickets;
create policy tickets_select_own on public.tickets
  for select using (client_id = public.current_client_id());

-- Clients may create tickets, but only for their own client_id.
drop policy if exists tickets_insert_own on public.tickets;
create policy tickets_insert_own on public.tickets
  for insert with check (client_id = public.current_client_id());

-- ===========================================================================
-- OPTIONAL: promote a user to admin after they sign up
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ===========================================================================
