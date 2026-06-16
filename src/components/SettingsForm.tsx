"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

// Lets a signed-in user update their own profile name and password. Both
// operations run client-side: profile name via RLS-protected update, password
// via Supabase Auth.
export default function SettingsForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const supabase = createClient();

  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setSavingName(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSavingName(false);
      toast.error("You're signed out");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);
    setSavingName(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (pw !== pw2) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed");
      setPw("");
      setPw2("");
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Profile */}
      <form onSubmit={saveName} className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Update your display name.</p>
        </div>
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
          <p className="mt-1 text-xs text-gray-400">
            Email changes aren&apos;t available here — contact support.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={savingName}>
          {savingName ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="card space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Password</h2>
          <p className="text-sm text-gray-500">
            Choose a new password for your account.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="pw">
            New password
          </label>
          <PasswordInput
            id="pw"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="pw2">
            Confirm password
          </label>
          <PasswordInput
            id="pw2"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={savingPw}>
          {savingPw ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
