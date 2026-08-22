"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  }

  return (
    <>
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-on-tertiary-container/10 blur-[100px] rounded-full" />
      </div>

      <main className="min-h-screen w-full flex items-center justify-center px-margin-mobile md:px-gutter">
        <div className="w-full max-w-[480px]">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-on-tertiary-container text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <h1 className="font-headline-md text-headline-md bg-clip-text text-transparent bg-gradient-to-r from-primary to-on-tertiary-container">
                EduCore
              </h1>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              The future of academic excellence.
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-card rounded-[20px] p-8 md:p-10 shadow-[0px_20px_25px_-5px_rgba(15,23,42,0.06),0px_10px_10px_-5px_rgba(15,23,42,0.02)]">
            <div className="mb-8">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                Welcome back
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Please enter your academic credentials.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1 uppercase tracking-wider"
                  htmlFor="email"
                >
                  Student Email
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                    mail
                  </span>
                  <input
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest/50 border border-outline-variant rounded-xl focus:border-secondary focus:ring-0 outline-none transition-all input-glow placeholder:text-outline/50"
                    id="email"
                    type="email"
                    placeholder="name@uet.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest/50 border border-outline-variant rounded-xl focus:border-secondary focus:ring-0 outline-none transition-all input-glow placeholder:text-outline/50"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-error text-body-sm font-medium px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 gradient-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="flex-shrink mx-4 font-label-md text-label-md text-outline uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200 group"
                >
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">
                    account_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Continue with Google
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New to EduCore?{" "}
              <Link
                className="font-semibold text-on-tertiary-container hover:underline underline-offset-4 transition-all ml-1"
                href="/signup"
              >
                Create a Student Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
