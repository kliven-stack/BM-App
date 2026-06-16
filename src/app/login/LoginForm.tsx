"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";
import PasswordInput from "@/components/PasswordInput";
import LoadingSplash from "@/components/LoadingSplash";

type Mode = "login" | "reset";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // --- Forgot password ---------------------------------------------------
    if (mode === "reset") {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError("Enter a valid email address");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage(
          "If an account exists for that email, a password reset link is on its way.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Login -------------------------------------------------------------
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Keep the branded splash up while the dashboard loads.
      setRedirecting(true);
      const redirectedFrom = params.get("redirectedFrom");
      router.replace(redirectedFrom || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (redirecting) {
    return <LoadingSplash label="Loading your dashboard…" />;
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
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {mode === "login" && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label mb-0" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-brand-600 hover:underline"
                onClick={() => switchMode("reset")}
              >
                Forgot password?
              </button>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-300">
            {message}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Send reset link"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        {mode === "reset" ? (
          <button
            type="button"
            className="font-medium text-brand-600 hover:underline"
            onClick={() => switchMode("login")}
          >
            ← Back to sign in
          </button>
        ) : (
          <>
            No account yet?{" "}
            <Link
              href="/pricing"
              className="font-medium text-brand-600 hover:underline"
            >
              View plans
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
