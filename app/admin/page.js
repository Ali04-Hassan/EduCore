"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AdminScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestProfiles, setRequestProfiles] = useState({});
  const [stats, setStats] = useState(null);

  const loadAdminData = useCallback(async () => {
    const [{ count: studentCount }, { count: notesCount }, { count: quizCount }, { count: courseCount }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("notes").select("*", { count: "exact", head: true }),
        supabase.from("quizzes").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
      ]);
    setStats({
      students: studentCount || 0,
      notes: notesCount || 0,
      quizzes: quizCount || 0,
      courses: courseCount || 0,
    });

    const { data: reqData } = await supabase
      .from("admin_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setRequests(reqData || []);

    if (reqData?.length) {
      const userIds = [...new Set(reqData.map((r) => r.user_id))];
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, department")
        .in("id", userIds);
      const map = {};
      (profileData || []).forEach((p) => (map[p.id] = p));
      setRequestProfiles(map);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(true);
        await loadAdminData();
      } catch (err) {
        console.error("Failed to check admin access:", err);
      } finally {
        setChecking(false);
      }
    })();
  }, [router, loadAdminData]);

  async function handleDecision(request, approve) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("admin_requests")
      .update({
        status: approve ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", request.id);

    if (approve) {
      await supabase.from("profiles").update({ role: "admin" }).eq("id", request.user_id);
    }
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant font-body-md text-body-md">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant">lock</span>
        <p className="mt-4 font-headline-sm text-headline-sm text-on-surface">
          Admin access required
        </p>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant max-w-sm">
          You don't have admin privileges. You can request access from Settings.
        </p>
        <button
          onClick={() => router.push("/settings")}
          className="mt-6 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-headline-sm text-headline-sm">Admin Dashboard</span>
        </button>
      </header>

      <main className="pt-24 px-margin-mobile max-w-4xl mx-auto">
        {/* Platform Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Students", value: stats?.students, icon: "group" },
            { label: "Courses", value: stats?.courses, icon: "school" },
            { label: "Notes Uploaded", value: stats?.notes, icon: "description" },
            { label: "Quizzes", value: stats?.quizzes, icon: "quiz" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <span className="material-symbols-outlined text-primary text-2xl">{s.icon}</span>
              <p className="font-headline-md text-headline-md font-bold mt-1">
                {s.value ?? "—"}
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Pending Admin Requests */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
            Pending Admin Requests
          </h2>

          {requests.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                No pending requests.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {requests.map((req) => {
              const profile = requestProfiles[req.user_id];
              return (
                <div key={req.id} className="glass-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-headline-sm text-body-md font-semibold">
                        {profile?.full_name || "Unknown student"}
                      </p>
                      <p className="font-label-md text-label-md text-on-surface-variant">
                        {profile?.department || "—"}
                      </p>
                      {req.reason && (
                        <p className="font-body-sm text-body-sm text-on-surface mt-2 italic">
                          "{req.reason}"
                        </p>
                      )}
                      <p className="font-label-md text-label-md text-outline mt-2">
                        Requested {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleDecision(req, true)}
                        className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200"
                        title="Approve"
                      >
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </button>
                      <button
                        onClick={() => handleDecision(req, false)}
                        className="w-9 h-9 rounded-full bg-error-container text-error flex items-center justify-center hover:opacity-80"
                        title="Reject"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return <AdminScreen />;
}
