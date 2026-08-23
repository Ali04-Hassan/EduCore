"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const NAV_KEYWORDS = [
  { match: ["back to login", "already have an account", "log in", "login"], route: "/login" },
  { match: ["create a student account", "create account", "sign up"], route: "/signup" },
  { match: ["forgot password"], route: "/forgot-password" },
  { match: ["logout", "log out", "sign out"], route: "__LOGOUT__" },
  { match: ["home", "dashboard"], route: "/dashboard" },
  { match: ["my courses", "courses"], route: "/courses" },
  { match: ["ai assistant", "ai learning", " ai "], route: "/ai-assistant" },
  { match: ["profile"], route: "/profile" },
  { match: ["settings"], route: "/settings" },
  { match: ["notifications"], route: "/notifications" },
  { match: ["study notes", "notes"], route: "/notes" },
  { match: ["practice", "quiz"], route: "/practice" },
  { match: ["assignments"], route: "/assignments" },
  { match: ["academic calendar", "calendar"], route: "/calendar" },
  { match: ["previous papers", "past papers"], route: "/previous-papers" },
  { match: ["get started"], route: "/signup" },
];

function resolveRoute(label) {
  const padded = ` ${label} `;
  for (const entry of NAV_KEYWORDS) {
    for (const kw of entry.match) {
      if (padded.includes(kw)) return entry.route;
    }
  }
  return null;
}

function visibleLabel(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll(".material-symbols-outlined").forEach((icon) => icon.remove());
  return (clone.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Renders a screen migrated from the Stitch export.
 * - injects the screen's local <style> block
 * - injects the body's inner HTML with the original className
 * - re-creates and appends the original <script> so it actually executes
 * - wires bottom-nav / menu items (by visible label text) to real routes,
 *   regardless of whether Stitch emitted <a> or <button> for them
 */
export default function LegacyScreen({ bodyHTML, bodyClassName, styleCss, scriptJs }) {
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!scriptJs || !scriptJs.trim()) return;
    const script = document.createElement("script");
    script.text = scriptJs;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const candidates = root.querySelectorAll("a, button");
    const handlers = [];

    candidates.forEach((el) => {
      // Elements with their own working behavior are left alone.
      // An explicit id means the containing page wires this element itself
      // (real form submit / auth logic) — auto-wiring it here would attach
      // a second, conflicting click handler and break that logic.
      if (el.hasAttribute("id")) return;
      if (el.hasAttribute("onclick")) return;
      if (el.tagName === "A" && el.getAttribute("href") && el.getAttribute("href") !== "#") {
        return;
      }

      const label = visibleLabel(el);
      if (!label) return;
      const route = resolveRoute(label);
      if (!route) return;

      const handler = async (e) => {
        e.preventDefault();
        if (route === "__LOGOUT__") {
          await supabase.auth.signOut();
          router.push("/login");
        } else {
          router.push(route);
        }
      };
      el.addEventListener("click", handler);
      handlers.push([el, handler]);
    });

    return () => {
      handlers.forEach(([el, handler]) => el.removeEventListener("click", handler));
    };
  }, [bodyHTML, router]);

  return (
    <>
      {styleCss && styleCss.trim() && (
        <style dangerouslySetInnerHTML={{ __html: styleCss }} />
      )}
      <div
        ref={containerRef}
        className={bodyClassName}
        dangerouslySetInnerHTML={{ __html: bodyHTML }}
      />
    </>
  );
}
