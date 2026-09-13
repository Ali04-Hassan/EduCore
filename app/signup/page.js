"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LegacyScreen from "@/components/LegacyScreen";
import { supabase } from "@/lib/supabaseClient";

const BODY_HTML = "<!-- Top Left Branding (EduCore Logo) -->\n<div class=\"fixed top-8 left-8 z-50\">\n<div class=\"flex items-center gap-3\">\n<div class=\"w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-on-tertiary-container/20\">\n<span class=\"material-symbols-outlined text-white\" style=\"font-variation-settings: 'FILL' 1;\">school</span>\n</div>\n<span class=\"font-display text-headline-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-secondary-container to-on-tertiary-container\">EduCore</span>\n</div>\n</div>\n<!-- Registration Container -->\n<main class=\"w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center\">\n<!-- Left Side: Visual/Context -->\n<div class=\"hidden lg:flex flex-col gap-8 pr-12\">\n<div class=\"relative w-full aspect-square rounded-20 overflow-hidden glass-card p-2\">\n<img class=\"w-full h-full object-cover rounded-xl opacity-90 shadow-inner\" data-alt=\"A clean, minimalist 3D render of a futuristic library or study space with floating holographic screens. The lighting is soft and atmospheric with cyan and purple neon highlights reflecting off pristine white surfaces. Professional high-end academic design aesthetic with shallow depth of field and premium textures.\" src=\"https://lh3.googleusercontent.com/aida-public/AB6AXuAeOsE0wZydhrOcUVSpZ6x0eG2HtVnk2xlIy9wKQ1q6GUlNy0_6DDHl8GCLjja_WIiafz-FhMLGun-DwDjOKT66r10EsW0It8OXuu6zFMmXf_CWa9Aq4vKB5TfRb5TaTAVSDaPR_nIa9Suv1oIkl9ahfpLogtKpyM0tPzdWjlY7nsR2F-9kHPRuOMOCl-wfw3E3qNsliZRVXg-wAAuf_2sTjpKXJbLmSfYEI-4zXp9IkNo3978JzAjfOw\"/>\n<!-- Floating Card Detail -->\n<div class=\"absolute bottom-8 right-8 glass-card p-4 rounded-xl border border-white/50 animate-float\">\n<div class=\"flex items-center gap-3\">\n<div class=\"w-10 h-10 bg-secondary-container/20 rounded-full flex items-center justify-center text-on-secondary-container\">\n<span class=\"material-symbols-outlined\">trending_up</span>\n</div>\n<div>\n<p class=\"font-label-md text-label-md text-on-surface-variant\">Active Learners</p>\n<p class=\"font-headline-sm text-headline-sm text-on-surface\">+12.4k</p>\n</div>\n</div>\n</div>\n</div>\n<div>\n<h1 class=\"font-display text-headline-lg text-primary mb-3\">Elevate Your Academic Journey.</h1>\n<p class=\"font-body-lg text-body-lg text-on-surface-variant leading-relaxed\">Join thousands of students optimizing their study workflow with EduCore's precision-engineered learning dashboard.</p>\n</div>\n</div>\n<!-- Right Side: The Form Card -->\n<div class=\"flex flex-col items-center\">\n<div class=\"glass-card w-full max-w-[520px] p-8 md:p-10 rounded-20 flex flex-col gap-8 relative overflow-hidden\">\n<!-- Subtle Gradient Glow behind card content -->\n<div class=\"absolute -top-24 -right-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl\"></div>\n<div class=\"absolute -bottom-24 -left-24 w-64 h-64 bg-on-tertiary-container/10 rounded-full blur-3xl\"></div>\n<div class=\"relative z-10\">\n<h2 class=\"font-display text-headline-md text-on-surface mb-1\">Create Account</h2>\n<p class=\"font-body-sm text-body-sm text-on-surface-variant\">Step into the future of campus productivity.</p>\n</div>\n<form id=\"signup-form\" class=\"flex flex-col gap-5 relative z-10\">\n<!-- Name & Email Row -->\n<div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Full Name</label>\n<div class=\"relative\">\n<input class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all placeholder:text-outline\" placeholder=\"Alex Rivers\" type=\"text\" id=\"signup-name\"/>\n</div>\n</div>\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Student Email</label>\n<div class=\"relative\">\n<input class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all placeholder:text-outline\" placeholder=\"alex@uni.edu\" type=\"email\" id=\"signup-email\"/>\n</div>\n</div>\n</div>\n<!-- University -->\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">University</label>\n<select class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all appearance-none cursor-pointer\">\n<option disabled=\"\" selected=\"\" value=\"\">Select Institution</option>\n<option>Central Tech University</option>\n<option>State Institute of Design</option>\n<option>Metro Medical Academy</option>\n</select>\n</div>\n<!-- Department & Semester Row -->\n<div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Department</label>\n<input class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all placeholder:text-outline\" placeholder=\"Computer Science\" type=\"text\" id=\"signup-department\"/>\n</div>\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Semester</label>\n<select class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all appearance-none cursor-pointer\">\n<option>Semester 1</option>\n<option>Semester 2</option>\n<option>Semester 3</option>\n<option>Semester 4</option>\n<option>Graduate</option>\n</select>\n</div>\n</div>\n<!-- Passwords -->\n<div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Password</label>\n<input class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all\" placeholder=\"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\" type=\"password\" id=\"signup-password\"/>\n</div>\n<div class=\"space-y-1.5\">\n<label class=\"font-label-md text-label-md text-on-surface-variant ml-1\">Confirm Password</label>\n<input class=\"w-full bg-surface-container-low/50 border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md input-focus-effect transition-all\" placeholder=\"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\" type=\"password\" id=\"signup-confirm\"/>\n</div>\n</div>\n<!-- CTA Button -->\n<button id=\"signup-submit-btn\" class=\"primary-gradient text-white font-display text-body-lg font-bold py-4 rounded-xl mt-4 shadow-xl shadow-secondary-container/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group\" type=\"button\">\n                        Create Account\n                        <span class=\"material-symbols-outlined group-hover:translate-x-1 transition-transform\">arrow_forward</span>\n</button>\n</form>\n<!-- Footer Link -->\n<div class=\"relative z-10 text-center\">\n<p class=\"font-body-sm text-body-sm text-on-surface-variant\">\n                        Already have an account? \n                        <a class=\"text-on-tertiary-container font-semibold hover:underline decoration-2 underline-offset-4 transition-all\" href=\"#\">Log In</a>\n</p>\n</div>\n</div>\n<!-- Trust Badges / Small Footer -->\n<div class=\"mt-8 flex gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500\">\n<div class=\"flex items-center gap-2\">\n<span class=\"material-symbols-outlined text-headline-sm\">verified_user</span>\n<span class=\"font-label-md text-label-md\">Secure Data</span>\n</div>\n<div class=\"flex items-center gap-2\">\n<span class=\"material-symbols-outlined text-headline-sm\">cloud_done</span>\n<span class=\"font-label-md text-label-md\">Cloud Sync</span>\n</div>\n</div>\n</div>\n</main>\n<!-- Background Decorative Elements -->\n<div class=\"fixed top-1/4 -left-20 w-80 h-80 primary-gradient opacity-10 blur-[120px] pointer-events-none rounded-full\"></div>\n<div class=\"fixed bottom-1/4 -right-20 w-80 h-80 primary-gradient opacity-10 blur-[120px] pointer-events-none rounded-full\"></div>";
const BODY_CLASS = "bg-mesh min-h-screen flex items-center justify-center p-6 font-body text-on-background";
const STYLE_CSS = "\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n            vertical-align: middle;\n        }\n        \n        .font-display { font-family: 'Poppins', sans-serif; }\n        .font-body { font-family: 'Inter', sans-serif; }\n\n        .glass-card {\n            background: rgba(255, 255, 255, 0.7);\n            backdrop-filter: blur(20px);\n            -webkit-backdrop-filter: blur(20px);\n            border: 1px solid rgba(255, 255, 255, 0.5);\n            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);\n        }\n\n        .bg-mesh {\n            background-color: #fcf8fa;\n            background-image: \n                radial-gradient(at 0% 0%, rgba(87, 223, 254, 0.15) 0px, transparent 50%),\n                radial-gradient(at 100% 0%, rgba(152, 99, 255, 0.1) 0px, transparent 50%),\n                radial-gradient(at 100% 100%, rgba(87, 223, 254, 0.1) 0px, transparent 50%),\n                radial-gradient(at 0% 100%, rgba(152, 99, 255, 0.15) 0px, transparent 50%);\n        }\n\n        .primary-gradient {\n            background: linear-gradient(135deg, #57dffe 0%, #9863ff 100%);\n        }\n\n        .input-focus-effect:focus {\n            border-color: #57dffe;\n            box-shadow: 0 0 0 4px rgba(87, 223, 254, 0.2);\n            outline: none;\n        }\n\n        /* Study Progress Bar Bloom */\n        .progress-bloom {\n            box-shadow: 0 0 12px rgba(87, 223, 254, 0.6);\n        }\n\n        @keyframes float {\n            0% { transform: translateY(0px); }\n            50% { transform: translateY(-10px); }\n            100% { transform: translateY(0px); }\n        }\n        .animate-float { animation: float 6s ease-in-out infinite; }\n    ";

export default function SignupPage() {
  const router = useRouter();
  const wrapRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    const btn = root.querySelector("#signup-submit-btn");
    if (!btn) return;

    const handler = async () => {
      setError("");
      const name = root.querySelector("#signup-name")?.value?.trim();
      const email = root.querySelector("#signup-email")?.value?.trim();
      const department = root.querySelector("#signup-department")?.value?.trim();
      const password = root.querySelector("#signup-password")?.value;
      const confirm = root.querySelector("#signup-confirm")?.value;

      if (!name || !email || !password) {
        setError("Please fill in your name, email, and password.");
        return;
      }
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
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, department } },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // email confirmation disabled on this Supabase project — logged in immediately
          router.push("/dashboard");
        } else {
          // confirmation required — send them to enter the OTP emailed to them
          sessionStorage.setItem("pending_email", email);
          router.push("/otp?purpose=signup");
        }
      } catch (err) {
        setError(err.message || "Could not create account.");
      } finally {
        setLoading(false);
      }
    };

    btn.addEventListener("click", handler);
    return () => btn.removeEventListener("click", handler);
  }, [router]);

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
              Creating your account...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
