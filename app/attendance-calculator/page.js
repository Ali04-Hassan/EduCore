"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const REQUIRED_PERCENT = 75; // typical university minimum attendance requirement

function Screen() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("courses(id, title)")
          .eq("user_id", user.id);

        const courseList = (enrollments || [])
          .map((e) => e.courses)
          .filter(Boolean);
        setCourses(courseList);

        const { data: existing } = await supabase
          .from("attendance_records")
          .select("*")
          .eq("user_id", user.id);

        const map = {};
        (existing || []).forEach((r) => {
          map[r.course_id] = { total: r.total_classes, attended: r.attended_classes };
        });
        setRecords(map);
      } catch (err) {
        console.error("Failed to load attendance data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updateField(courseId, field, value) {
    setRecords((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: Number(value) || 0 },
    }));
  }

  async function saveAll() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    for (const course of courses) {
      const r = records[course.id];
      if (!r) continue;
      await supabase.from("attendance_records").upsert(
        {
          user_id: user.id,
          course_id: course.id,
          total_classes: r.total || 0,
          attended_classes: r.attended || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">
            Attendance Calculator
          </span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto pb-8">
        {loading && <p className="text-center text-on-surface-variant py-12">Loading...</p>}

        {!loading && courses.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              event_available
            </span>
            <p className="mt-4 text-on-surface-variant font-body-md">
              Enroll in courses first to track attendance.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {courses.map((c) => {
            const r = records[c.id] || { total: 0, attended: 0 };
            const percent = r.total ? Math.round((r.attended / r.total) * 100) : 0;
            const safe = percent >= REQUIRED_PERCENT;
            const classesNeeded =
              r.total > 0 && !safe
                ? Math.max(
                    0,
                    Math.ceil(
                      (REQUIRED_PERCENT * r.total - 100 * r.attended) / (100 - REQUIRED_PERCENT)
                    )
                  )
                : 0;

            return (
              <div key={c.id} className="glass-card rounded-2xl p-5">
                <p className="font-headline-sm text-body-lg font-semibold text-on-surface mb-3">
                  {c.title}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="font-label-md text-label-md text-outline">
                      Classes Held
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={r.total || ""}
                      onChange={(e) => updateField(c.id, "total", e.target.value)}
                      className="w-full mt-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-outline">Attended</label>
                    <input
                      type="number"
                      min="0"
                      value={r.attended || ""}
                      onChange={(e) => updateField(c.id, "attended", e.target.value)}
                      className="w-full mt-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden mr-4">
                    <div
                      className={`h-full ${safe ? "bg-good" : "bg-error"}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`font-headline-sm text-body-lg font-semibold ${
                      safe ? "text-good" : "text-error"
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  {safe
                    ? `You're safely above the ${REQUIRED_PERCENT}% requirement.`
                    : classesNeeded > 0
                    ? `Attend the next ${classesNeeded} classes in a row to reach ${REQUIRED_PERCENT}%.`
                    : "Enter your class data above."}
                </p>
              </div>
            );
          })}
        </div>

        {courses.length > 0 && (
          <button
            onClick={saveAll}
            disabled={saving}
            className="w-full mt-6 bg-primary text-on-primary font-body-md text-body-md font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </main>
    </div>
  );
}

export default function AttendanceCalculatorPage() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
