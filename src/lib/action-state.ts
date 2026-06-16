// Shared return shape for Server Actions. Kept in its own (non-"use server")
// module so it can be imported by both actions and client components — a
// "use server" file may only export async functions.
export type ActionState = { error?: string; success?: string };
