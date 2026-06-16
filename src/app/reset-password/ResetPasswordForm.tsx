"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // The recovery link routes through /auth/callback, which exchanges the code
  // for a session before landing here. Confirm we actually have one.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setReady(Boolean(data.user));
    });
  }, [supabase]);

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
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="card text-center text-sm text-gray-500">
        <p>Validating your reset link…</p>
        <p className="mt-2">
          If this doesn&apos;t resolve, request a new link from the{" "}
          <a href="/login" className="font-medium text-brand-600 hover:underline">
            sign-in page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="card shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
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
        {done && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-300">
            Password updated. Redirecting…
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading || done}
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
