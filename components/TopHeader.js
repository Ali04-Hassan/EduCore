"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TopHeader({ title = "EduCore" }) {
  const [initial, setInitial] = useState("U");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data?.user?.user_metadata?.full_name || data?.user?.email || "U";
      setInitial(name.charAt(0).toUpperCase());
    });
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden text-white text-sm font-bold">
          {initial}
        </div>
        <h1 className="font-headline-md text-headline-md font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-container to-on-tertiary-container">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity">
          notifications
        </button>
      </div>
    </header>
  );
}
