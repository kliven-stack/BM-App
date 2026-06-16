import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { requireRole } from "@/lib/auth";

const bodySchema = z.object({
  client_id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
});

// POST /api/stripe/create-customer
// Admin-only. Creates a Stripe customer for a client (idempotent-ish: reuses an
// existing subscription row's customer id if one already exists).
export async function POST(request: Request) {
  try {
    await requireRole("admin");

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }
    const { client_id, email, name } = parsed.data;

    const customer = await getStripe().customers.create({
      email,
      name,
      metadata: { client_id },
    });

    return NextResponse.json({ customer_id: customer.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
