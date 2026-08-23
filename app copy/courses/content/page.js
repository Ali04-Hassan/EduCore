"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

function youtubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function ContentScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params.get("id");

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const [{ data: courseRow }, { data: moduleRows }, { data: videoRows }, { data: progressRows }] =
          await Promise.all([
            supabase.from("courses").select("*").eq("id", courseId).single(),
            supabase
              .from("course_modules")
              .select("*")
              .eq("course_id", courseId)
              .order("order_index", { ascending: true }),
            supabase
              .from("video_lessons")
              .select("*")
              .eq("course_id", courseId)
              .order("order_index", { ascending: true }),
            supabase.from("module_progress").select("module_id, completed").eq("user_id", user.id),
          ]);

        setCourse(courseRow);
        setModules(moduleRows || []);
        setVideos(videoRows || []);
        setCompletedIds(
          new Set((progressRows || []).filter((p) => p.completed).map((p) => p.module_id))
        );
      } catch (err) {
        console.error("Failed to load course content:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  async function toggleModule(moduleId) {
    if (!userId) return;
    const isCompleted = completedIds.has(moduleId);
    const next = new Set(completedIds);
    isCompleted ? next.delete(moduleId) : next.add(moduleId);
    setCompletedIds(next);

    await supabase.from("module_progress").upsert(
      {
        user_id: userId,
        module_id: moduleId,
        completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,module_id" }
    );

    // Keep the course's overall progress % (shown on the Courses list) in sync
    if (modules.length > 0) {
      const percent = Math.round((next.size / modules.length) * 100);
      await supabase.from("enrollments").upsert(
        { user_id: userId, course_id: courseId, progress_percent: percent },
        { onConflict: "user_id,course_id" }
      );
    }
  }

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant">
          No course selected.{" "}
          <button onClick={() => router.push("/courses")} className="text-secondary underline">
            Go to courses
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center gap-3 px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/courses")}>
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-headline-sm truncate">
          {course?.title || "Course"}
        </h1>
      </header>

      <main className="pt-24 px-margin-mobile max-w-container-max mx-auto space-y-8">
        {loading && <p className="text-center text-on-surface-variant py-12">Loading...</p>}

        {!loading && course && (
          <>
            <section className="glass-card rounded-edu p-5">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                {course.instructor} · {course.course_code}
              </p>
              <p className="font-body-md text-body-md text-on-surface">{course.description}</p>
            </section>

            {activeVideo && (
              <section className="rounded-edu overflow-hidden aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl(activeVideo)}
                  title="Video lesson"
                  allowFullScreen
                />
              </section>
            )}

            {videos.length > 0 && (
              <section>
                <h2 className="font-headline-sm text-headline-sm px-1 mb-4">Video Lessons</h2>
                <div className="space-y-3">
                  {videos.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVideo(v.youtube_url)}
                      className="w-full text-left glass-card rounded-edu p-4 flex items-center gap-4"
                    >
                      <span className="w-10 h-10 rounded-full bg-secondary-fixed/30 text-secondary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">play_arrow</span>
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-on-surface">{v.title}</p>
                        {v.duration_minutes && (
                          <p className="text-body-sm text-on-surface-variant">
                            {v.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-headline-sm text-headline-sm px-1 mb-4">Modules</h2>
              {modules.length === 0 ? (
                <p className="text-on-surface-variant px-1">No modules added yet.</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((m) => {
                    const done = completedIds.has(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleModule(m.id)}
                        className="w-full text-left glass-card rounded-edu p-4 flex items-center gap-4"
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            done ? "bg-secondary text-white" : "bg-surface-container text-outline"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {done ? "check" : "radio_button_unchecked"}
                          </span>
                        </span>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              done ? "text-on-surface-variant line-through" : "text-on-surface"
                            }`}
                          >
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-body-sm text-on-surface-variant">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
        <ContentScreen />
      </Suspense>
    </AuthGuard>
  );
}
