"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const DIFFICULTY_COLOR = {
  easy: "text-good bg-good/10",
  medium: "text-on-tertiary-container bg-tertiary-container/10",
  hard: "text-error bg-error-container",
};

function Screen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [quizzesByCategory, setQuizzesByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: cats } = await supabase
          .from("quiz_categories")
          .select("*")
          .order("name");
        setCategories(cats || []);

        const { data: quizzes } = await supabase
          .from("quizzes")
          .select("*, quiz_categories(name)")
          .order("title");

        const grouped = {};
        (quizzes || []).forEach((q) => {
          grouped[q.category_id] = grouped[q.category_id] || [];
          grouped[q.category_id].push(q);
        });
        setQuizzesByCategory(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Practice Smarter</span>
        </button>
        <button
          onClick={() => router.push("/leaderboard")}
          className="text-secondary"
          title="Leaderboard"
        >
          <span className="material-symbols-outlined">leaderboard</span>
        </button>
      </header>

      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto">
        {loading && (
          <p className="text-center text-on-surface-variant font-body-md py-12">Loading...</p>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">quiz</span>
            <p className="mt-4 text-on-surface-variant font-body-md">No quiz categories yet.</p>
          </div>
        )}

        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">
                    {cat.icon || "quiz"}
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(quizzesByCategory[cat.id] || []).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => router.push(`/quiz?id=${q.id}`)}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between text-left hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-headline-sm text-body-lg font-semibold text-on-surface">
                        {q.title}
                      </p>
                      <p className="font-label-md text-label-md text-outline mt-1">
                        {q.time_limit_seconds ? `${Math.round(q.time_limit_seconds / 60)} min` : ""}
                        {q.negative_marking ? " · Negative marking" : ""}
                      </p>
                    </div>
                    <span
                      className={`text-label-md font-label-md px-3 py-1 rounded-full capitalize ${
                        DIFFICULTY_COLOR[q.difficulty] || "text-on-surface-variant bg-surface-container"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </button>
                ))}
                {(quizzesByCategory[cat.id] || []).length === 0 && (
                  <p className="text-body-sm text-on-surface-variant/60 col-span-2">
                    No quizzes in this category yet.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function QuizCategoriesPage() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
