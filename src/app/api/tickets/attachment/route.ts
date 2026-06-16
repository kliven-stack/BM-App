import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { ATTACHMENT_BUCKET } from "@/lib/attachments";

// GET /api/tickets/attachment?path=…
// Verifies the user may see the attachment (via RLS on ticket_messages), then
// redirects to a short-lived signed URL from the private bucket.
export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  // RLS check: can this user read the message that owns this attachment?
  const supabase = await createClient();
  const { data: msg } = await supabase
    .from("ticket_messages")
    .select("id")
    .eq("attachment_path", path)
    .maybeSingle();
  if (!msg) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not sign URL" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
