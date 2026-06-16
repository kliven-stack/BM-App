"use client";

import { useActionState, useEffect } from "react";
import { addMetricAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import SubmitButton from "@/components/SubmitButton";
import FormFeedback from "./FormFeedback";

const initial: ActionState = {};

export default function MetricForm({
  websiteId,
  onDone,
}: {
  websiteId: string;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(addMetricAction, initial);

  useEffect(() => {
    if (state.success) onDone?.();
  }, [state.success, onDone]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="website_id" value={websiteId} />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label" htmlFor="date">
            Date
          </label>
          <input id="date" name="date" type="date" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="visitors">
            Visitors
          </label>
          <input
            id="visitors"
            name="visitors"
            type="number"
            min="0"
            className="input"
            defaultValue={0}
          />
        </div>
        <div>
          <label className="label" htmlFor="page_views">
            Page views
          </label>
          <input
            id="page_views"
            name="page_views"
            type="number"
            min="0"
            className="input"
            defaultValue={0}
          />
        </div>
        <div>
          <label className="label" htmlFor="bounce_rate">
            Bounce rate (%)
          </label>
          <input
            id="bounce_rate"
            name="bounce_rate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="input"
            defaultValue={0}
          />
        </div>
        <div>
          <label className="label" htmlFor="avg_session_duration">
            Avg. session (s)
          </label>
          <input
            id="avg_session_duration"
            name="avg_session_duration"
            type="number"
            step="0.1"
            min="0"
            className="input"
            defaultValue={0}
          />
        </div>
      </div>
      <FormFeedback state={state} />
      <SubmitButton>Save metric</SubmitButton>
    </form>
  );
}
