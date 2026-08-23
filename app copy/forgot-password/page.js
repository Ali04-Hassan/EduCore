"use client";

import { useEffect, useRef, useState } from "react";
import LegacyScreen from "@/components/LegacyScreen";
import { supabase } from "@/lib/supabaseClient";

const BODY_HTML = "<div class=\"bg-glow\"></div>\n<!-- TopAppBar -->\n<header class=\"fixed top-0 w-full bg-surface/70 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16\">\n<div class=\"flex items-center gap-4 cursor-pointer active:scale-95 transition-transform\" onclick=\"window.history.back()\">\n<span class=\"material-symbols-outlined text-primary\">arrow_back</span>\n</div>\n<div class=\"font-headline-md text-headline-md font-bold text-primary\">EduCore</div>\n<div class=\"w-10\"></div> <!-- Spacer for centering title -->\n</header>\n<!-- Main Content -->\n<main class=\"flex-grow flex flex-col items-center justify-center px-margin-mobile pt-24 pb-16\">\n<div class=\"max-w-md w-full flex flex-col items-center text-center\">\n<!-- Hero Illustration -->\n<div class=\"w-full max-w-[280px] mb-8 animate-pulse\">\n<img alt=\"Forgot Password Illustration\" class=\"w-full h-auto drop-shadow-2xl\" src=\"https://lh3.googleusercontent.com/aida-public/AB6AXuBrbChQdRZSC4E6b_YgQMT5od-VciZTudjAUXRjwqIVBS2dkFUJzyJAy--IzBmR3MzUHplCkks9FbquBgy0yK70JZsoxekcN3oXK9A_cDPg7u14bDZk9c64bRT7v8kSKBIYj6rtOk1Xfoo77q0KlZzIrAxLtCKR8fDrzH0tvIsa0gD0gAJsUMeheO9LJ3XdXt_MVsYPA1nOw0BcNPwChBo1w9Bpx_yS0oEORoXePuwIS-h5YyHl__zFbA\"/>\n</div>\n<!-- Header Section -->\n<h1 class=\"font-poppins font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2\">Forgot Password?</h1>\n<p class=\"font-body-md text-on-surface-variant/80 mb-8 max-w-[320px]\">\n                Enter your registered email address to receive a one-time password (OTP).\n            </p>\n<!-- Glassmorphic Card -->\n<div class=\"glass-card w-full p-8 rounded-brand space-y-6\">\n<!-- Input Field -->\n<div class=\"space-y-2 text-left\">\n<label class=\"font-label-md text-on-surface-variant ml-1\" for=\"email\">Student Email</label>\n<div class=\"relative group\">\n<div class=\"absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none\">\n<span class=\"material-symbols-outlined text-on-surface-variant group-focus-within:text-secondary transition-colors\">mail</span>\n</div>\n<input class=\"block w-full pl-12 pr-4 py-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-brand focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md text-on-surface placeholder:text-on-surface-variant/40\" id=\"email\" name=\"email\" placeholder=\"e.g. alex@university.edu\" type=\"email\"/>\n</div>\n</div>\n<!-- Primary Button -->\n<button class=\"vibrant-gradient w-full py-4 rounded-brand text-on-primary font-bold text-body-lg shadow-lg active:scale-95 flex items-center justify-center gap-2\" id=\"forgot-submit-btn\">\n<span>Send OTP</span>\n<span class=\"material-symbols-outlined text-xl\">send</span>\n</button>\n</div>\n<!-- Footer Link -->\n<a class=\"mt-8 font-label-md text-secondary hover:text-secondary-container transition-colors flex items-center gap-1 group\" href=\"#\">\n<span class=\"material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform\">chevron_left</span>\n<span>Back to Login</span>\n</a>\n</div>\n</main>";
const BODY_CLASS = "bg-background text-on-surface font-inter min-h-screen flex flex-col";
const STYLE_CSS = "\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n        .glass-card {\n            background: rgba(255, 255, 255, 0.7);\n            backdrop-filter: blur(20px);\n            border: 1px solid rgba(255, 255, 255, 0.5);\n            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);\n        }\n        .vibrant-gradient {\n            background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);\n            transition: all 0.3s ease;\n        }\n        .vibrant-gradient:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3);\n        }\n        .bg-glow {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            z-index: -1;\n            background: radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),\n                        radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);\n            background-color: #fcf8fa;\n        }\n    ";

export default function ForgotPasswordPage() {
  const wrapRef = useRef(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const btn = root.querySelector("#forgot-submit-btn");
    if (!btn) return;

    const handler = async (e) => {
      e.preventDefault();
      setError("");
      const email = root.querySelector("#email")?.value?.trim();
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/reset-password`
              : undefined,
        });
        if (resetError) throw resetError;
        sessionStorage.setItem("pending_email", email);
        setSent(true);
      } catch (err) {
        setError(err.message || "Could not send reset email.");
      } finally {
        setLoading(false);
      }
    };

    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, []);

  return (
    <div ref={wrapRef}>
      <LegacyScreen bodyHTML={BODY_HTML} bodyClassName={BODY_CLASS} styleCss={STYLE_CSS} />
      {(error || sent || loading) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] max-w-[90%]">
          {error && (
            <p className="bg-error-container text-on-error-container text-body-sm font-medium px-4 py-3 rounded-xl shadow-lg">
              {error}
            </p>
          )}
          {sent && !error && (
            <p className="bg-secondary-container text-on-secondary-container text-body-sm font-medium px-4 py-3 rounded-xl shadow-lg">
              Check your email for a reset code / link.
            </p>
          )}
          {loading && !error && !sent && (
            <p className="bg-surface-container-lowest text-on-surface text-body-sm font-medium px-4 py-3 rounded-xl shadow-lg">
              Sending...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
