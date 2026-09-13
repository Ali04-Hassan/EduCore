"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

const GRADE_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  D: 1.0, F: 0.0,
};

function emptyCourse() {
  return { name: "", credit_hours: 3, grade: "A" };
}

function Screen() {
  const router = useRouter();
  const [semester, setSemester] = useState("Semester 1");
  const [courses, setCourses] = useState([emptyCourse()]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  function updateCourse(i, field, value) {
    setCourses((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addCourse() {
    setCourses((prev) => [...prev, emptyCourse()]);
  }

  function removeCourse(i) {
    setCourses((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totalCreditHours = courses.reduce((s, c) => s + Number(c.credit_hours || 0), 0);
  const totalGradePoints = courses.reduce(
    (s, c) => s + Number(c.credit_hours || 0) * (GRADE_POINTS[c.grade] ?? 0),
    0
  );
  const gpa = totalCreditHours ? (totalGradePoints / totalCreditHours).toFixed(2) : "0.00";

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = courses.map((c) => ({
      name: c.name || "Untitled Course",
      credit_hours: Number(c.credit_hours) || 0,
      grade_point: GRADE_POINTS[c.grade] ?? 0,
    }));
    const { error } = await supabase.from("gpa_records").insert({
      user_id: user.id,
      semester,
      courses: payload,
      gpa: Number(gpa),
    });
    setSaving(false);
    setSavedMsg(error ? "Could not save: " + error.message : "Saved!");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center px-margin-mobile h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">
            GPA Calculator
          </span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-2xl mx-auto pb-8">
        <div className="mb-4">
          <label className="font-label-md text-label-md text-outline">Semester</label>
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full mt-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md outline-none focus:border-secondary"
          />
        </div>

        <div className="space-y-3 mb-4">
          {courses.map((c, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className="flex gap-3 mb-3">
                <input
                  placeholder="Course name"
                  value={c.name}
                  onChange={(e) => updateCourse(i, "name", e.target.value)}
                  className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-body-sm font-body-sm outline-none focus:border-secondary"
                />
                {courses.length > 1 && (
                  <button
                    onClick={() => removeCourse(i)}
                    className="text-error shrink-0"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-md text-label-md text-outline">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={c.credit_hours}
                    onChange={(e) => updateCourse(i, "credit_hours", e.target.value)}
                    className="w-full mt-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-outline">Grade</label>
                  <select
                    value={c.grade}
                    onChange={(e) => updateCourse(i, "grade", e.target.value)}
                    className="w-full mt-1 border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md outline-none focus:border-secondary"
                  >
                    {Object.keys(GRADE_POINTS).map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addCourse}
          className="w-full mb-6 border-2 border-dashed border-outline-variant rounded-xl py-3 font-body-md text-body-md text-on-surface-variant hover:border-secondary transition-colors"
        >
          + Add Course
        </button>

        <div className="glass-card rounded-2xl p-6 text-center mb-6">
          <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-1">
            Semester GPA
          </p>
          <p className="font-display text-display text-primary">{gpa}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {totalCreditHours} credit hours
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-on-primary font-body-md text-body-md font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save This Semester"}
        </button>
        {savedMsg && (
          <p className="text-center font-body-sm text-body-sm text-good mt-3">{savedMsg}</p>
        )}
      </main>
    </div>
  );
}

export default function GpaCalculatorPage() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
