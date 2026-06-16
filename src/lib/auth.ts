import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

// Returns the current user's profile, or null if not signed in.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

// Guards a page: ensures the user is signed in and (optionally) has a role.
// Redirects to /login or to the user's correct home if the role mismatches.
export async function requireRole(role?: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (role && profile.role !== role) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }
  return profile;
}

export function homeForRole(role: Role): string {
  return role === "admin" ? "/admin" : "/dashboard";
}
