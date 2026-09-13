"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LegacyScreen from "@/components/LegacyScreen";
import { supabase } from "@/lib/supabaseClient";

const BODY_HTML = "<!-- Top Navigation Bar (Shared Component) -->\n<header class=\"fixed top-0 left-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full h-16\">\n<div class=\"flex items-center gap-3\">\n<span class=\"material-symbols-outlined text-primary text-3xl\">school</span>\n<span class=\"font-headline-md text-headline-md font-bold text-primary\">EduCore</span>\n</div>\n<button class=\"text-on-surface-variant font-label-md hover:opacity-80 transition-opacity active:scale-95 duration-200\">\n            Skip\n        </button>\n</header>\n<!-- Main Content Canvas -->\n<main class=\"flex-grow flex items-center justify-center px-margin-mobile pt-20 pb-24 md:pt-0 md:pb-0\">\n<div class=\"w-full max-w-[480px] animate-[fadeIn_0.6s_ease-out]\">\n<!-- Verification Card -->\n<div class=\"glass-panel rounded-premium p-8 md:p-12 text-center relative overflow-hidden\">\n<!-- Atmospheric Glow -->\n<div class=\"absolute -top-24 -right-24 w-48 h-48 bg-secondary-fixed/20 blur-3xl rounded-full\"></div>\n<div class=\"absolute -bottom-24 -left-24 w-48 h-48 bg-tertiary-fixed-dim/20 blur-3xl rounded-full\"></div>\n<!-- Header -->\n<div class=\"relative z-10\">\n<div class=\"w-16 h-16 bg-secondary-fixed/20 rounded-full flex items-center justify-center mx-auto mb-6\">\n<span class=\"material-symbols-outlined text-secondary text-3xl\">mark_email_read</span>\n</div>\n<h1 class=\"font-headline-lg text-headline-lg text-on-surface mb-2\">Verify Your Email</h1>\n<p class=\"font-body-md text-on-surface-variant mb-10 max-w-[280px] mx-auto\">\n                        Enter the 6-digit code sent to your email address.\n                    </p>\n</div>\n<!-- OTP Form -->\n<form class=\"relative z-10\" id=\"otp-form\">\n<div class=\"flex justify-between gap-2 md:gap-3 mb-10\">\n<!-- Input Boxes -->\n<input autofocus=\"\" class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n<input class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n<input class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n<input class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n<input class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n<input class=\"otp-input w-full aspect-square text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-outline-variant transition-all outline-none\" maxlength=\"1\" type=\"text\"/>\n</div>\n<!-- Action Button -->\n<button class=\"premium-gradient w-full py-4 rounded-xl text-white font-headline-sm shadow-lg mb-8\" type=\"submit\">\n                        Verify\n                    </button>\n</form>\n<!-- Footer Actions -->\n<div class=\"relative z-10 flex flex-col items-center gap-4\">\n<div class=\"font-label-md text-on-surface-variant flex items-center gap-2\" id=\"countdown-container\">\n<span>Didn't receive the code?</span>\n<span class=\"text-secondary font-semibold\" id=\"timer-text\">Resend in 30s</span>\n</div>\n<button class=\"hidden text-secondary font-semibold font-label-md hover:underline transition-all\" id=\"resend-btn\">\n                        Resend OTP\n                    </button>\n</div>\n</div>\n<!-- Contextual Note -->\n<p class=\"mt-8 text-center font-body-sm text-outline px-8\">\n                By verifying, you ensure your EduCore account remains secure and your academic progress is synchronized across all devices.\n            </p>\n</div>\n</main>\n<!-- Bottom Navigation Bar (Shared Component - Conditional Visibility) -->\n<!-- Suppressed for transactional/focused screen as per mandate -->\n<div class=\"fixed bottom-0 left-0 w-full z-50 p-margin-mobile flex flex-col items-center w-full max-w-720 mx-auto\">\n<button class=\"flex items-center justify-center bg-gradient-to-r from-secondary-container to-tertiary-container text-on-primary rounded-full w-full py-4 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:brightness-110 transition-all active:scale-[0.98]\">\n<span class=\"material-symbols-outlined\" data-icon=\"arrow_forward\">arrow_forward</span>\n</button>\n</div>\n<!-- Micro-interactions Script -->\n\n<style>\n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(10px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n    </style>";
const BODY_CLASS = "flex flex-col min-h-screen";
const STYLE_CSS = "\n        .glass-panel {\n            background: rgba(255, 255, 255, 0.7);\n            backdrop-filter: blur(20px);\n            -webkit-backdrop-filter: blur(20px);\n            border: 1px solid rgba(255, 255, 255, 0.5);\n            box-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.08);\n        }\n        \n        .otp-input:focus {\n            border-color: #57dffe;\n            box-shadow: 0 0 0 4px rgba(87, 223, 254, 0.2);\n            transform: translateY(-2px);\n        }\n\n        .premium-gradient {\n            background: linear-gradient(135deg, #4cd7f6 0%, #9863ff 100%);\n            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n        }\n\n        .premium-gradient:hover {\n            filter: brightness(1.1);\n            transform: translateY(-2px);\n            box-shadow: 0 10px 20px -5px rgba(87, 223, 254, 0.4);\n        }\n\n        .premium-gradient:active {\n            transform: scale(0.98);\n        }\n\n        body {\n            background-color: #fcf8fa;\n            background-image: radial-gradient(at 0% 0%, rgba(172, 237, 255, 0.15) 0px, transparent 50%),\n                              radial-gradient(at 100% 100%, rgba(210, 187, 255, 0.15) 0px, transparent 50%);\n            min-height: 100vh;\n        }\n\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n    \n\n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(10px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n    ";

function OtpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const purpose = params.get("purpose") || "signup"; // "signup" | "recovery"
  const wrapRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const form = root.querySelector("#otp-form");
    if (!form) return;

    // Auto-advance between the 6 OTP boxes
    const boxes = Array.from(root.querySelectorAll(".otp-input"));
    const onInput = (i) => (e) => {
      if (e.target.value && i < boxes.length - 1) boxes[i + 1].focus();
    };
    const onKeyDown = (i) => (e) => {
      if (e.key === "Backspace" && !e.target.value && i > 0) boxes[i - 1].focus();
    };
    const cleanups = boxes.map((box, i) => {
      const inputHandler = onInput(i);
      const keyHandler = onKeyDown(i);
      box.addEventListener("input", inputHandler);
      box.addEventListener("keydown", keyHandler);
      return () => {
        box.removeEventListener("input", inputHandler);
        box.removeEventListener("keydown", keyHandler);
      };
    });

    const handler = async (e) => {
      e.preventDefault();
      setError("");
      const email = sessionStorage.getItem("pending_email");
      const token = boxes.map((b) => b.value).join("");

      if (!email) {
        setError("Missing email context — please restart from signup or forgot password.");
        return;
      }
      if (token.length !== 6) {
        setError("Enter all 6 digits.");
        return;
      }

      setLoading(true);
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: purpose === "recovery" ? "recovery" : "signup",
        });
        if (verifyError) throw verifyError;
        sessionStorage.removeItem("pending_email");
        router.push("/dashboard");
      } catch (err) {
        setError(err.message || "Invalid or expired code.");
      } finally {
        setLoading(false);
      }
    };

    form.addEventListener("submit", handler);
    return () => {
      form.removeEventListener("submit", handler);
      cleanups.forEach((c) => c());
    };
  }, [router, purpose]);

  return (
    <div ref={wrapRef}>
      <LegacyScreen bodyHTML={BODY_HTML} bodyClassName={BODY_CLASS} styleCss={STYLE_CSS} />
      {(error || loading) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] max-w-[90%]">
          {error && (
            <p className="bg-error-container text-on-error-container text-body-sm font-medium px-4 py-3 rounded-xl shadow-lg">
              {error}
            </p>
          )}
          {loading && !error && (
            <p className="bg-surface-container-lowest text-on-surface text-body-sm font-medium px-4 py-3 rounded-xl shadow-lg">
              Verifying...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpContent />
    </Suspense>
  );
}
