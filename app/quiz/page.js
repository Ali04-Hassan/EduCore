"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

function QuizScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const quizId = params.get("id");

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();
        const { data: qData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order_index");

        setQuiz(quizData);
        setQuestions(qData || []);
        setTimeLeft(quizData?.time_limit_seconds || 300);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);

    let correctCount = 0;
    const detailedAnswers = questions.map((q) => {
      const selected = answers[q.id];
      const correct = selected === q.correct_index;
      if (correct) correctCount++;
      return { question_id: q.id, selected_index: selected ?? null, correct };
    });

    let score = correctCount;
    if (quiz?.negative_marking) {
      const wrongCount = detailedAnswers.filter(
        (a) => a.selected_index !== null && !a.correct
      ).length;
      score = correctCount - wrongCount * 0.25;
    }

    const timeTaken = (quiz?.time_limit_seconds || 300) - (timeLeft ?? 0);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        total_questions: questions.length,
        correct_count: correctCount,
        time_taken_seconds: timeTaken,
        answers: detailedAnswers,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      alert("Could not submit quiz: " + error.message);
      return;
    }
    router.push(`/quiz-results?attempt=${attempt.id}`);
  }, [answers, questions, quiz, quizId, timeLeft, submitting, router]);

  useEffect(() => {
    if (loading || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, handleSubmit]);

  if (!quizId) {
    return <p className="p-8 text-center">No quiz selected.</p>;
  }
  if (loading) {
    return <p className="p-8 text-center">Loading quiz...</p>;
  }
  if (questions.length === 0) {
    return <p className="p-8 text-center">This quiz has no questions yet.</p>;
  }

  const q = questions[current];
  const minutes = Math.floor((timeLeft ?? 0) / 60);
  const seconds = (timeLeft ?? 0) % 60;

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/80 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div>
          <p className="font-headline-sm text-body-lg font-semibold text-on-surface truncate max-w-[180px]">
            {quiz?.title}
          </p>
          <p className="font-label-md text-label-md text-outline">
            Question {current + 1} of {questions.length}
          </p>
        </div>
        <span
          className={`font-mono font-semibold px-3 py-1.5 rounded-lg ${
            timeLeft < 30 ? "bg-error-container text-error" : "bg-secondary-container/30 text-secondary"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto">
        <div className="w-full h-1.5 bg-surface-container rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <p className="font-headline-sm text-body-lg font-medium text-on-surface leading-relaxed mb-6">
            {q.question}
          </p>

          <div className="space-y-3">
            {(q.options || []).map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className={`w-full text-left border-2 rounded-xl px-4 py-3 font-body-md text-body-md transition-colors ${
                    selected
                      ? "border-secondary bg-secondary-container/20 text-on-secondary-container font-medium"
                      : "border-outline-variant hover:border-secondary/50 text-on-surface"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface disabled:opacity-40 font-body-md text-body-md"
          >
            Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-body-md text-body-md font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
        <QuizScreen />
      </Suspense>
    </AuthGuard>
  );
}
