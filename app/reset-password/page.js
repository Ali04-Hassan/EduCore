"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center p-6 text-on-background">
      <div className="glass-card w-full max-w-[420px] p-8 md:p-10 rounded-[20px] flex flex-col gap-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
            Set a new password
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Choose a strong password for your EduCore account.
          </p>
        </div>

        {done ? (
          <p className="text-secondary font-body-md text-body-md">
            Password updated! Redirecting to login&hellip;
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                New Password
              </label>
              <input
                className="w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1">
                Confirm New Password
              </label>
              <input
                className="w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-error text-body-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="primary-gradient text-white font-headline-md text-body-lg font-bold py-4 rounded-xl shadow-xl shadow-secondary-container/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
