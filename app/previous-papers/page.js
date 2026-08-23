"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "previous-papers";

function Screen() {
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [year, setYear] = useState("");

  const loadPapers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("previous_papers")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      setPapers(data || []);
    } catch (err) {
      setError(err.message || "Could not load papers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      const { data: courseRows } = await supabase.from("courses").select("id, title");
      setCourses(courseRows || []);
    })();
    loadPapers();
  }, [loadPapers]);

  async function submitUpload() {
    if (!pendingFile || !userId) return;
    setUploading(true);
    setError("");
    try {
      const path = `${userId}/${Date.now()}_${pendingFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, pendingFile);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("previous_papers").insert({
        uploaded_by: userId,
        course_id: selectedCourseId || null,
        title: pendingFile.name,
        year: year || null,
        file_path: path,
      });
      if (dbError) throw dbError;

      await loadPapers();
      setShowUploadPanel(false);
      setPendingFile(null);
      setSelectedCourseId("");
      setYear("");
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleView(paper) {
    const { data, error: urlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(paper.file_path, 3600);
    if (urlError) {
      alert("Could not open file: " + urlError.message);
      return;
    }
    router.push(
      `/pdf-reader?url=${encodeURIComponent(data.signedUrl)}&name=${encodeURIComponent(
        paper.title
      )}&context=${encodeURIComponent("Previous Papers")}`
    );
  }

  async function handleDownload(paper) {
    const { data, error: urlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(paper.file_path, 60);
    if (urlError) {
      alert("Could not open file: " + urlError.message);
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(paper) {
    if (paper.uploaded_by !== userId) return;
    if (!confirm(`Delete "${paper.title}"?`)) return;
    await supabase.storage.from(BUCKET).remove([paper.file_path]);
    await supabase.from("previous_papers").delete().eq("id", paper.id);
    await loadPapers();
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <h1 className="font-headline-sm text-headline-sm">Previous Papers</h1>
        </button>
        <button
          onClick={() => setShowUploadPanel((v) => !v)}
          className="gradient-btn text-white font-label-md text-label-md px-4 py-2 rounded-full"
        >
          + Upload
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-container-max mx-auto space-y-3">
        {showUploadPanel && (
          <div className="glass-card rounded-edu p-4 space-y-3">
            <p className="font-headline-sm text-body-lg font-semibold text-on-surface">
              Upload a previous paper
            </p>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Course (optional)
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-outline/20 rounded-xl px-3 py-2 bg-white/60 outline-none focus:ring-2 focus:ring-secondary-container/50"
              >
                <option value="">General / Not course-specific</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                Year (optional)
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full border border-outline/20 rounded-xl px-3 py-2 bg-white/60 outline-none focus:ring-2 focus:ring-secondary-container/50"
              />
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-1">
                File
              </label>
              <input
                type="file"
                onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
                className="w-full text-body-sm"
              />
            </div>

            <button
              onClick={submitUpload}
              disabled={!pendingFile || uploading}
              className="w-full gradient-btn text-white font-label-md text-label-md py-2.5 rounded-xl disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </div>
        )}
        {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}

        {loading && (
          <p className="text-center text-on-surface-variant py-12">Loading papers...</p>
        )}

        {!loading && papers.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              description
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-4">
              No previous papers uploaded yet. Be the first!
            </p>
          </div>
        )}

        {papers.map((p) => (
          <div key={p.id} className="glass-card rounded-edu p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-secondary-fixed/30 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface truncate">{p.title}</p>
              <p className="text-body-sm text-on-surface-variant">
                {p.courses?.title || "General"} {p.year ? `· ${p.year}` : ""}
              </p>
            </div>
            <button
              onClick={() => handleView(p)}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
            <button
              onClick={() => handleDownload(p)}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            {p.uploaded_by === userId && (
              <button
                onClick={() => handleDelete(p)}
                className="w-9 h-9 rounded-full bg-error/10 text-error flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
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
