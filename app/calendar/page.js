"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

const TYPE_STYLE = {
  exam: { icon: "quiz", classes: "bg-error/10 text-error" },
  assignment: { icon: "assignment", classes: "bg-secondary-fixed/30 text-secondary" },
  holiday: { icon: "beach_access", classes: "bg-tertiary-fixed/40 text-on-tertiary-container" },
  general: { icon: "event", classes: "bg-surface-container text-on-surface-variant" },
};

function Screen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("calendar_events")
          .select("*, courses(title)")
          .order("event_date", { ascending: true });
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    events.forEach((e) => {
      const d = new Date(e.event_date);
      const key = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      groups[key] = groups[key] || [];
      groups[key].push(e);
    });
    return groups;
  }, [events]);

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <h1 className="font-headline-sm text-headline-sm">Academic Calendar</h1>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-container-max mx-auto space-y-8">
        {loading && (
          <p className="text-center text-on-surface-variant py-12">Loading calendar...</p>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              calendar_month
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-4">
              No events scheduled yet.
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([month, monthEvents]) => (
          <section key={month}>
            <h2 className="font-headline-sm text-headline-sm px-1 mb-4 text-primary">{month}</h2>
            <div className="space-y-3">
              {monthEvents.map((e) => {
                const style = TYPE_STYLE[e.event_type] || TYPE_STYLE.general;
                const d = new Date(e.event_date);
                return (
                  <div key={e.id} className="glass-card rounded-edu p-4 flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-surface-container shrink-0">
                      <span className="font-headline-sm text-headline-sm leading-none text-primary">
                        {d.getDate()}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-headline-sm text-body-lg font-semibold text-on-surface">
                        {e.title}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {e.courses?.title ? `${e.courses.title} · ` : ""}
                        {e.description}
                      </p>
                    </div>
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.classes}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <BottomNav />
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
