// Minimal Resend wrapper. No-ops gracefully when RESEND_API_KEY isn't set, so
// the app works with or without email configured.

const FROM = process.env.EMAIL_FROM ?? "Blend Mode <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return; // not configured — silently skip

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
  } catch {
    // Never let email failures break the request.
  }
}

// Simple branded HTML shell for transactional emails.
export function emailLayout(title: string, body: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;background:#f4f4f5;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#e67e64,#cb4530);padding:20px 24px;color:#fff;font-weight:700;font-size:18px">Blend Mode</div>
      <div style="padding:24px;color:#1f2937">
        <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#374151">${body}</div>
      </div>
    </div>
  </div>`;
}
