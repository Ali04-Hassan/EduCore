"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function Screen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data: assignmentRows } = await supabase
          .from("assignments")
          .select("*, courses(title)")
          .order("due_date", { ascending: true });

        const { data: submissionRows } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("user_id", user.id);

        const subMap = {};
        (submissionRows || []).forEach((s) => {
          subMap[s.assignment_id] = s;
        });

        setAssignments(assignmentRows || []);
        setSubmissions(subMap);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(assignmentId, file) {
    if (!file || !userId) return;
    setUploadingId(assignmentId);
    try {
      const path = `${userId}/${assignmentId}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from("assignment_submissions")
        .upsert(
          { assignment_id: assignmentId, user_id: userId, file_path: path, status: "submitted" },
          { onConflict: "assignment_id,user_id" }
        )
        .select()
        .single();
      if (dbError) throw dbError;

      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit: " + err.message);
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <h1 className="font-headline-sm text-headline-sm">Assignments</h1>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-container-max mx-auto space-y-4">
        {loading && (
          <p className="text-center text-on-surface-variant py-12">Loading assignments...</p>
        )}

        {!loading && assignments.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              assignment
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-4">
              No assignments yet.
            </p>
          </div>
        )}

        {assignments.map((a) => {
          const submission = submissions[a.id];
          const days = daysUntil(a.due_date);
          const overdue = days !== null && days < 0 && !submission;

          return (
            <div key={a.id} className="glass-card rounded-edu p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{a.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {a.courses?.title || "General"} · {a.points} pts
                  </p>
                </div>
                {submission ? (
                  <span className="px-3 py-1 bg-secondary-fixed/30 text-secondary rounded-full text-label-md font-label-md">
                    {submission.status === "graded" ? `Graded: ${submission.grade}` : "Submitted"}
                  </span>
                ) : overdue ? (
                  <span className="px-3 py-1 bg-error/10 text-error rounded-full text-label-md font-label-md">
                    Overdue
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-md font-label-md">
                    {days !== null ? `${days}d left` : "No due date"}
                  </span>
                )}
              </div>

              {a.description && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {a.description}
                </p>
              )}

              {a.due_date && (
                <p className="font-label-md text-label-md text-outline">
                  Due: {new Date(a.due_date).toLocaleString()}
                </p>
              )}

              {!submission && (
                <label className="mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-outline/30 rounded-xl py-3 cursor-pointer hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-outline">upload_file</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {uploadingId === a.id ? "Uploading..." : "Upload submission"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploadingId === a.id}
                    onChange={(e) => handleSubmit(a.id, e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          );
        })}
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
