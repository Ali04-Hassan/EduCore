"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

function Screen() {
  const router = useRouter();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("quiz_attempts")
          .select("*, quizzes(title, quiz_categories(name))")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false });
        setAttempts(data || []);
      } catch (err) {
        console.error("Failed to load performance insights:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce((s, a) => s + a.correct_count, 0);
  const totalQuestions = attempts.reduce((s, a) => s + a.total_questions, 0);
  const avgAccuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const byCategory = {};
  attempts.forEach((a) => {
    const cat = a.quizzes?.quiz_categories?.name || "General";
    byCategory[cat] = byCategory[cat] || { correct: 0, total: 0 };
    byCategory[cat].correct += a.correct_count;
    byCategory[cat].total += a.total_questions;
  });

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/practice")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">
            Performance Insights
          </span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto">
        {loading && <p className="text-center text-on-surface-variant py-12">Loading...</p>}

        {!loading && totalAttempts === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              insights
            </span>
            <p className="mt-4 text-on-surface-variant font-body-md">
              Take a quiz to see your performance stats here.
            </p>
          </div>
        )}

        {!loading && totalAttempts > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="font-headline-md text-headline-md text-primary">{totalAttempts}</p>
                <p className="font-label-md text-label-md text-outline mt-1">Quizzes Taken</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="font-headline-md text-headline-md text-secondary">{avgAccuracy}%</p>
                <p className="font-label-md text-label-md text-outline mt-1">Avg Accuracy</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="font-headline-md text-headline-md text-on-tertiary-container">
                  {totalCorrect}
                </p>
                <p className="font-label-md text-label-md text-outline mt-1">Correct Answers</p>
              </div>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">
              Accuracy by Category
            </h2>
            <div className="glass-card rounded-2xl p-5 mb-8 space-y-4">
              {Object.entries(byCategory).map(([cat, s]) => {
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-body-sm font-body-sm mb-1">
                      <span className="text-on-surface">{cat}</span>
                      <span className="text-on-surface-variant">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pct < 60 ? "bg-error" : "bg-good"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">
              Recent Attempts
            </h2>
            <div className="space-y-2">
              {attempts.slice(0, 10).map((a) => (
                <div
                  key={a.id}
                  className="glass-card rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-body-md text-body-md text-on-surface">
                      {a.quizzes?.title || "Quiz"}
                    </p>
                    <p className="font-label-md text-label-md text-outline">
                      {new Date(a.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-headline-sm text-body-lg font-semibold text-secondary">
                    {a.correct_count}/{a.total_questions}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function PerformanceInsightsPage() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
