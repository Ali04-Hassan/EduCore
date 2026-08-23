"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "notes";

function NotesScreen() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;
      const { data, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(uid, { sortBy: { column: "created_at", order: "desc" } });
      if (listError) throw listError;
      setFiles(data || []);
    } catch (err) {
      setError(err.message || "Could not load notes. Make sure the 'notes' storage bucket exists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) throw new Error("Not signed in.");
      const path = `${uid}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      await loadFiles();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleView(name) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    const { data, error: dlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${uid}/${name}`, 3600);
    if (dlError) {
      setError(dlError.message);
      return;
    }
    router.push(
      `/pdf-reader?url=${encodeURIComponent(data.signedUrl)}&name=${encodeURIComponent(
        name.replace(/^\d+_/, "")
      )}&context=${encodeURIComponent("My Notes")}`
    );
  }

  async function handleDownload(name) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    const { data, error: dlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${uid}/${name}`, 60);
    if (dlError) {
      setError(dlError.message);
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(name) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    const { error: delError } = await supabase.storage.from(BUCKET).remove([`${uid}/${name}`]);
    if (delError) {
      setError(delError.message);
      return;
    }
    loadFiles();
  }

  return (
    <div className="min-h-screen mesh-bg pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50">
        <span className="font-headline-sm text-headline-sm font-bold text-primary">
          Study Notes
        </span>
        <label className="gradient-primary text-white font-label-md text-label-md px-4 py-2 rounded-full cursor-pointer">
          {uploading ? "Uploading..." : "+ Upload"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </header>

      <main className="pt-24 px-margin-mobile max-w-3xl mx-auto">
        {error && (
          <p className="bg-error-container text-on-error-container text-body-sm font-medium px-4 py-3 rounded-xl mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-on-surface-variant font-body-md text-body-md">Loading notes...</p>
        ) : files.length === 0 ? (
          <div className="glass-card rounded-[20px] p-10 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              No notes uploaded yet. Tap &quot;+ Upload&quot; to add your first PDF, slide deck, or document.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {files.map((f) => (
              <div
                key={f.id || f.name}
                className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-2xl">
                    description
                  </span>
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md font-medium truncate">
                      {f.name.replace(/^\d+_/, "")}
                    </p>
                    <p className="font-label-md text-label-md text-outline">
                      {f.metadata?.size ? `${Math.round(f.metadata.size / 1024)} KB` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleView(f.name)}
                    className="text-primary hover:text-on-primary-container"
                    title="View"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button
                    onClick={() => handleDownload(f.name)}
                    className="text-secondary hover:text-on-secondary-container"
                    title="Download"
                  >
                    <span className="material-symbols-outlined">download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(f.name)}
                    className="text-error hover:opacity-70"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-6 bg-surface/70 backdrop-blur-xl border-t border-white/50 shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] rounded-t-full">
        <a href="/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-label-md">Home</span>
        </a>
        <a href="/courses" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">library_books</span>
          <span className="font-label-md text-label-md">Courses</span>
        </a>
        <a href="/notes" className="flex flex-col items-center justify-center text-primary bg-secondary-container/30 rounded-full px-4 py-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <span className="font-label-md text-label-md">Notes</span>
        </a>
        <a href="/ai-assistant" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="font-label-md text-label-md">AI</span>
        </a>
        <a href="/profile" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-md text-label-md">Profile</span>
        </a>
      </nav>
    </div>
  );
}

export default function NotesPage() {
  return (
    <AuthGuard>
      <NotesScreen />
    </AuthGuard>
  );
}
