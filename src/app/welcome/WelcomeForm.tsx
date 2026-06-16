"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import { completeSignup } from "./actions";

export default function WelcomeForm({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await completeSignup(sessionId, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Account created — sign them straight in and drop them into the portal.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      router.replace("/login");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="card shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input opacity-70"
            value={email}
            disabled
            readOnly
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Create a password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Setting up…" : "Finish & enter portal"}
        </button>
      </form>
    </div>
  );
}
