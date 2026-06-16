# SaaS Client Portal

A production-ready **client portal + admin dashboard** for managing websites,
website metrics, Stripe subscriptions, invoices, and support tickets.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase
(Auth + Postgres + RLS) · Stripe · Zod · SWR · Recharts.

---

## Features

| Area              | Admin                                              | Client                                  |
| ----------------- | -------------------------------------------------- | --------------------------------------- |
| Clients           | Create / view all clients                          | —                                       |
| Websites          | Add, assign to client, view per client             | View assigned websites                  |
| Metrics           | Add manually, view charts                          | View charts (visitors / views / bounce) |
| Subscriptions     | Create Stripe customer + subscription              | View price, cycle, status               |
| Invoices          | Synced from Stripe via webhook                     | View list + hosted invoice link         |
| Tickets           | View all, update status                            | Create + track own tickets              |

Role-based routing, Row Level Security on every table, server-side Zod
validation, and Stripe webhook signature verification are all included.

---

## 1. Prerequisites

- Node.js 18.18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine)

## 2. Install

```bash
npm install
```

## 3. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (**server only**) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` output, or Stripe → Webhooks |
| `STRIPE_DEFAULT_PRICE_ID` | Stripe → Product catalog → your recurring price |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev |

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must never be
> imported into a Client Component or exposed to the browser. It is only used in
> `src/lib/supabase/server.ts` (`createAdminClient`) by the Stripe webhook.

## 4. Set up the database

Open the Supabase **SQL Editor** and run the contents of
[`supabase/schema.sql`](supabase/schema.sql). This creates every table, the
RLS policies, the `is_admin()` / `current_client_id()` helper functions, and a
trigger that auto-creates a `profiles` row on signup.

## 5. Create your first admin

1. Start the app (step 6) and sign up at `/login`.
2. New users default to the `client` role. Promote yourself in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

3. Sign out and back in — you'll land on `/admin`.

> **How clients are linked:** an admin creates a `clients` row with a client's
> email. When that person signs up using the **same email**, RLS
> (`current_client_id()` matches on email) scopes them to their own data.

## 6. Run

```bash
npm run dev
```

Visit http://localhost:3000.

## 7. Stripe webhooks (local)

In a second terminal, forward events to your local webhook handler:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

Handled events:

- `invoice.payment_succeeded` → upsert invoice row
- `invoice.payment_failed` → upsert invoice row (status reflects failure)
- `customer.subscription.updated` / `.deleted` → sync subscription status

---

## Project structure

```
saas-client-portal/
├── middleware.ts                 # Route protection + role redirects
├── supabase/schema.sql           # Tables, RLS policies, triggers, helpers
└── src/
    ├── app/
    │   ├── login/                # Email/password auth (Zod-validated)
    │   ├── auth/                 # callback + signout route handlers
    │   ├── admin/                # /admin/* — admin dashboard + Server Actions
    │   ├── dashboard/            # /dashboard/* — client portal + Server Actions
    │   └── api/stripe/           # create-customer, create-subscription, webhook
    ├── components/               # Sidebar, shell, charts, modal, forms
    └── lib/
        ├── supabase/             # browser, server, admin & middleware clients
        ├── stripe.ts             # Stripe SDK singleton
        ├── auth.ts               # getProfile / requireRole guards
        ├── validations.ts        # Zod schemas (shared client + server)
        └── types.ts              # Domain types
```

## Routes

**Public:** `/login`

**Admin** (role `admin`): `/admin`, `/admin/clients`, `/admin/websites`,
`/admin/subscriptions`, `/admin/tickets`

**Client** (role `client`): `/dashboard`, `/dashboard/websites`,
`/dashboard/subscription`, `/dashboard/invoices`, `/dashboard/tickets`

---

## Security checklist

- ✅ RLS enabled on every table; admins get full access, clients are scoped to
  their own rows and may only INSERT tickets.
- ✅ Service-role key is server-only; the browser uses the anon key.
- ✅ Routes protected in `middleware.ts` **and** re-checked in each layout via
  `requireRole()`.
- ✅ Stripe webhook signatures verified before any DB write.
- ✅ All mutating forms validated with Zod on both client and server.

---

## Optional next steps (bonus)

- **Real-time tickets:** subscribe with `supabase.channel(...).on('postgres_changes', …)`.
- **Email notifications:** send on `tickets` insert (e.g. Resend) from the
  Server Action or a Supabase Edge Function.
- **Activity logs:** add an `activity_logs` table + insert from Server Actions.
```

---

## Deploy to Vercel

1. **Import the repo** at [vercel.com/new](https://vercel.com/new) (Next.js is auto-detected — no config needed).

2. **Set Environment Variables** (Project → Settings → Environment Variables) for
   Production (and Preview). Use the same keys as `.env.example`:

   | Variable | Notes |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | **secret** — server only |
   | `STRIPE_SECRET_KEY` | **secret** |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | publishable key |
   | `STRIPE_WEBHOOK_SECRET` | from the **hosted** webhook (step 4) |
   | `NEXT_PUBLIC_SITE_URL` | your deployed URL, e.g. `https://your-app.vercel.app` |

3. **Deploy.** Vercel runs `next build` automatically.

4. **Add the Stripe webhook** (the local `stripe listen` CLI is dev-only). In the
   Stripe Dashboard → Developers → Webhooks → *Add endpoint*:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`,
     `invoice.payment_failed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Copy the endpoint's **Signing secret** into `STRIPE_WEBHOOK_SECRET` and redeploy.

5. **Supabase redirect URLs** (Auth → URL Configuration → Redirect URLs): add
   `https://your-app.vercel.app/**` so email links (password reset) work.

6. **Custom domain (optional):** add it under Project → Domains, then update
   `NEXT_PUBLIC_SITE_URL` and the Stripe webhook URL to match.

> The Stripe Products/Prices used by the pricing page are referenced by ID in
> `src/lib/plans.ts`. They live in your Stripe account, so the same IDs work in
> any environment that uses the same Stripe account (test vs live keys differ —
> recreate the products in live mode and swap the IDs before going live).
