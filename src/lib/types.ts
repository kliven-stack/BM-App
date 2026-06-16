// Domain types mirroring the Supabase schema. Kept hand-written and small;
// for large projects generate these with `supabase gen types typescript`.

export type Role = "admin" | "client";
export type TicketStatus = "open" | "in_progress" | "closed";
export type BillingCycle = "monthly" | "yearly";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  created_by: string | null;
  created_at: string;
}

export interface Website {
  id: string;
  client_id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface WebsiteMetric {
  id: string;
  website_id: string;
  date: string;
  visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  price: number;
  billing_cycle: BillingCycle | string;
  created_at: string;
}

export interface Invoice {
  id: string;
  subscription_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  status: string;
  hosted_invoice_url: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  client_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
}
