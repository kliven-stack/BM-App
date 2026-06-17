"use client";

import { useState } from "react";
import { Icon } from "./icons";

// On-demand AI summary of a website's metrics. Hidden entirely if the API
// returns "not configured".
export default function AiInsight({ websiteId }: { websiteId: string }) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/insights?website_id=${websiteId}`);
      if (res.status === 503) {
        setHidden(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setInsight(data.insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="card border-brand-200 bg-brand-50/40 dark:border-brand-500/20 dark:bg-brand-500/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="icon-chip h-8 w-8">
            <Icon name="star" size={15} />
          </span>
          <p className="text-sm font-semibold text-gray-900">AI insight</p>
        </div>
        {!insight && (
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            {loading ? "Analyzing…" : "Generate"}
          </button>
        )}
      </div>

      {insight && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
          {insight}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {!insight && !error && !loading && (
        <p className="mt-3 text-xs text-gray-400">
          Generate an AI-written summary of this site&apos;s recent performance.
        </p>
      )}
    </div>
  );
}
