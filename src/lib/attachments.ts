import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export const ATTACHMENT_BUCKET = "ticket-attachments";

// Uploads a ticket attachment to the private bucket using the service role
// (keeps storage RLS simple — access is gated by our routes). Returns the
// stored path + original name, or null if there's no usable file.
export async function uploadTicketAttachment(
  ticketId: string,
  file: File | null,
): Promise<{ path: string; name: string } | null> {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return null;
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Attachment must be under 10MB");
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const path = `${ticketId}/${randomUUID()}-${safeName}`;

  const admin = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  return { path, name: file.name };
}
