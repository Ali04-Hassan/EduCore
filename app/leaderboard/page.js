"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const MEDAL = ["🥇", "🥈", "🥉"];

function Screen() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setMyId(user?.id || null);

        const { data } = await supabase
          .from("leaderboard")
          .select("*")
          .order("total_correct", { ascending: false })
          .limit(50);
        setRows((data || []).filter((r) => r.quizzes_taken > 0));
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/practice")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Top Students</span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto">
        {loading && <p className="text-center text-on-surface-variant py-12">Loading...</p>}

        {!loading && rows.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              leaderboard
            </span>
            <p className="mt-4 text-on-surface-variant font-body-md">
              No quiz attempts yet — be the first!
            </p>
          </div>
        )}

        <div className="space-y-2">
          {rows.map((r, i) => {
            const isMe = r.user_id === myId;
            const accuracy = r.total_questions
              ? Math.round((r.total_correct / r.total_questions) * 100)
              : 0;
            return (
              <div
                key={r.user_id}
                className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${
                  isMe ? "ring-2 ring-secondary" : ""
                }`}
              >
                <span className="w-8 text-center font-headline-sm text-headline-sm text-on-surface-variant">
                  {i < 3 ? MEDAL[i] : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-medium text-on-surface truncate">
                    {r.full_name || "Student"} {isMe && "(You)"}
                  </p>
                  <p className="font-label-md text-label-md text-outline">
                    {r.department || ""} · {r.quizzes_taken} quizzes
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-headline-sm text-body-lg font-semibold text-secondary">
                    {r.total_correct}
                  </p>
                  <p className="font-label-md text-label-md text-outline">{accuracy}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
