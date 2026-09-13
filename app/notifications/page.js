"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const TYPE_ICON = {
  general: "notifications",
  assignment: "assignment",
  quiz: "quiz",
  announcement: "campaign",
};

function Screen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function markAsRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-on-surface"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-headline-sm text-headline-sm">Notifications</span>
        </button>
        <button
          onClick={markAllRead}
          className="font-label-md text-label-md text-secondary hover:underline"
        >
          Mark all read
        </button>
      </header>

      <main className="pt-24 px-4 md:px-margin-desktop max-w-2xl mx-auto space-y-3">
        {loading && (
          <p className="text-on-surface-variant font-body-md text-body-md text-center py-12">
            Loading...
          </p>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              notifications_off
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-4">
              No notifications yet.
            </p>
          </div>
        )}

        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && markAsRead(n.id)}
            className={`w-full text-left glass-card rounded-xl p-4 flex items-start gap-4 transition-colors ${
              n.read ? "opacity-60" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                n.read
                  ? "bg-surface-container text-on-surface-variant"
                  : "bg-secondary-container/30 text-secondary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {TYPE_ICON[n.type] || "notifications"}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline-sm text-body-lg font-semibold text-on-surface">
                {n.title}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {n.message}
              </p>
              <p className="font-label-md text-label-md text-outline mt-2">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-secondary mt-1 shrink-0" />}
          </button>
        ))}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
