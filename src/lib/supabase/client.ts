"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Uses only the public anon key — RLS enforces
// what this client is allowed to read/write.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
