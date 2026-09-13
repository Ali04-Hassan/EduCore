"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

function ResultsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("attempt");

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data: attemptData } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();
        if (!attemptData) return;
        setAttempt(attemptData);

        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", attemptData.quiz_id)
          .single();
        setQuiz(quizData);

        const { data: qData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", attemptData.quiz_id)
          .order("order_index");
        setQuestions(qData || []);
      } catch (err) {
        console.error("Failed to load quiz results:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) return <p className="p-8 text-center">Loading results...</p>;
  if (!attempt) return <p className="p-8 text-center">Result not found.</p>;

  const percent = Math.round((attempt.correct_count / attempt.total_questions) * 100);
  const answersMap = {};
  (attempt.answers || []).forEach((a) => (answersMap[a.question_id] = a));

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/practice")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Quiz Results</span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-center mb-6">
          <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-2">
            {quiz?.title}
          </p>
          <p className="font-display text-display text-primary">{percent}%</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {attempt.correct_count} / {attempt.total_questions} correct
            {quiz?.negative_marking && ` · Score: ${attempt.score}`}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => router.push("/performance-insights")}
              className="px-5 py-2.5 rounded-xl bg-secondary-container/30 text-on-secondary-container font-body-md text-body-md font-medium"
            >
              View Progress
            </button>
            <button
              onClick={() => router.push("/practice")}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-medium"
            >
              More Quizzes
            </button>
          </div>
        </div>

        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Review</h2>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = answersMap[q.id];
            const isCorrect = userAnswer?.correct;
            return (
              <div key={q.id} className="glass-card rounded-2xl p-5">
                <p className="font-body-md text-body-md font-medium text-on-surface mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, oi) => {
                    let style = "border-outline-variant text-on-surface";
                    if (oi === q.correct_index) style = "border-good bg-good/10 text-on-surface";
                    else if (oi === userAnswer?.selected_index)
                      style = "border-error bg-error-container text-on-surface";
                    return (
                      <div
                        key={oi}
                        className={`border rounded-lg px-3 py-2 text-body-sm font-body-sm ${style}`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <p
                    className={`text-body-sm font-body-sm mt-3 ${
                      isCorrect ? "text-good" : "text-error"
                    }`}
                  >
                    {isCorrect ? "Correct — " : "Incorrect — "}
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
        <ResultsScreen />
      </Suspense>
    </AuthGuard>
  );
}
