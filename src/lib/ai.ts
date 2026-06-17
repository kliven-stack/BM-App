// Minimal Anthropic (Claude) wrapper. No-ops gracefully when ANTHROPIC_API_KEY
// isn't set, so AI features are optional. Uses fetch — no SDK dependency.

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askClaude(
  prompt: string,
  maxTokens = 400,
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
