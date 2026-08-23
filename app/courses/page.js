"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabaseClient";

const ICONS = ["calculate", "science", "memory", "public", "biotech", "language", "menu_book"];
const ICON_BG = [
  "bg-secondary-fixed/30 text-secondary",
  "bg-primary-container/10 text-primary-container",
  "bg-tertiary-fixed/40 text-on-tertiary-container",
];

function iconFor(index) {
  return ICONS[index % ICONS.length];
}
function bgFor(index) {
  return ICON_BG[index % ICON_BG.length];
}

function Screen() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSemester, setActiveSemester] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: courseRows } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: true });

        const { data: enrollRows } = await supabase
          .from("enrollments")
          .select("course_id, progress_percent")
          .eq("user_id", user.id);

        const progressMap = {};
        (enrollRows || []).forEach((e) => {
          progressMap[e.course_id] = e.progress_percent;
        });

        const merged = (courseRows || []).map((c) => ({
          ...c,
          progress: progressMap[c.id] ?? 0,
        }));

        setCourses(merged);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const semesters = useMemo(() => {
    const set = new Set(courses.map((c) => c.semester).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [courses]);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = activeSemester === "All" || c.semester === activeSemester;
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <h1 className="font-headline-md text-headline-md font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-container to-on-tertiary-container">
          EduCore
        </h1>
        <button
          onClick={() => router.push("/notifications")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>

      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto">
        <section className="mt-6 mb-8 flex gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/50 border border-outline/20 rounded-edu focus:ring-2 focus:ring-secondary-container/50 focus:border-secondary-container outline-none transition-all placeholder:text-outline/60"
              placeholder="Search your courses..."
              type="text"
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push("/notes")}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-secondary text-2xl">
                description
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Study Notes
              </span>
            </button>
            <button
              onClick={() => router.push("/assignments")}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-primary-container text-2xl">
                assignment
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Assignments
              </span>
            </button>
            <button
              onClick={() => router.push("/previous-papers")}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-on-tertiary-container text-2xl">
                history_edu
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Past Papers
              </span>
            </button>
            <button
              onClick={() => router.push("/calendar")}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="material-symbols-outlined text-secondary text-2xl">
                calendar_month
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Calendar
              </span>
            </button>
          </div>
        </section>

        {semesters.length > 1 && (
          <section className="mb-8 overflow-x-auto scrollbar-hide -mx-margin-mobile px-margin-mobile">
            <div className="flex gap-4 min-w-max pb-2">
              {semesters.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSemester(s)}
                  className={`px-6 py-2.5 rounded-full font-label-md text-label-md transition-colors ${
                    activeSemester === s
                      ? "bg-primary-container text-white shadow-lg shadow-primary-container/20"
                      : "bg-white border border-outline/10 text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-headline-sm text-headline-sm px-1 mb-4">
            {activeSemester === "All" ? "All Courses" : activeSemester}
          </h2>

          {loading && (
            <p className="text-center text-on-surface-variant py-12">Loading courses...</p>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-outline-variant">
                school
              </span>
              <p className="text-on-surface-variant font-body-md text-body-md mt-4">
                No courses found.
              </p>
            </div>
          )}

          {filtered.map((course, i) => (
            <button
              key={course.id}
              onClick={() => router.push(`/courses/content?id=${course.id}`)}
              className="w-full text-left glass-card rounded-edu p-5 flex flex-col gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgFor(i)}`}>
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {iconFor(i)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {course.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {course.instructor}
                      {course.course_code ? ` · ${course.course_code}` : ""}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="font-label-md text-label-md font-bold text-secondary">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-btn rounded-full progress-bloom"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full">
                  <span className="material-symbols-outlined text-sm text-outline">
                    auto_stories
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {course.credit_hours} Credit Hours
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>
      </main>

      <BottomNav />

      <button
        onClick={() => router.push("/ai-assistant")}
        className="fixed bottom-24 right-6 w-14 h-14 gradient-btn text-white rounded-full flex items-center justify-center shadow-lg shadow-on-tertiary-container/30 active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
      </button>
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
