import { z } from "zod";

// Shared Zod schemas — used for both client-side form validation and
// server-side validation inside Server Actions / Route Handlers.

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
});
export type ClientInput = z.infer<typeof clientSchema>;

// On create, an admin can optionally set a password — that provisions the
// client's login immediately. An empty string means "no login yet".
export const clientCreateSchema = clientSchema.extend({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;

export const clientUpdateSchema = clientSchema.extend({
  id: z.string().uuid(),
});
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export const idSchema = z.object({ id: z.string().uuid() });

export const websiteSchema = z.object({
  client_id: z.string().uuid("Select a client"),
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Enter a valid URL (https://…)"),
});
export type WebsiteInput = z.infer<typeof websiteSchema>;

export const metricSchema = z.object({
  website_id: z.string().uuid("Select a website"),
  date: z.string().min(1, "Date is required"),
  visitors: z.coerce.number().int().min(0),
  page_views: z.coerce.number().int().min(0),
  bounce_rate: z.coerce.number().min(0).max(100),
  avg_session_duration: z.coerce.number().min(0),
});
export type MetricInput = z.infer<typeof metricSchema>;

export const subscriptionSchema = z.object({
  client_id: z.string().uuid("Select a client"),
  email: z.string().email(),
  price: z.coerce.number().min(0),
  billing_cycle: z.enum(["monthly", "yearly"]),
});
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// Admin creates a subscription by picking a live Stripe price.
export const subscriptionCreateSchema = z.object({
  client_id: z.string().uuid("Select a client"),
  email: z.string().email(),
  price_id: z.string().min(1, "Select a plan"),
});

export const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});
export type TicketInput = z.infer<typeof ticketSchema>;

export const ticketStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "closed"]),
});

export const ticketReplySchema = z.object({
  ticket_id: z.string().uuid(),
  body: z.string().min(1, "Message is required").max(5000),
});
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
