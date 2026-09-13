"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [likedByMe, setLikedByMe] = useState(new Set());
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState({});
  const [commentDraft, setCommentDraft] = useState("");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const loadPosts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data: postData } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts(postData || []);

      if (postData?.length) {
        const userIds = [...new Set(postData.map((p) => p.user_id))];
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        const map = {};
        (profileData || []).forEach((p) => (map[p.id] = p.full_name));
        setProfiles(map);

        if (user) {
          const { data: likeData } = await supabase
            .from("community_likes")
            .select("post_id")
            .eq("user_id", user.id);
          setLikedByMe(new Set((likeData || []).map((l) => l.post_id)));
        }
      }
    } catch (err) {
      console.error("Failed to load community posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function submitPost() {
    if (!newPost.trim() || !userId) return;
    setPosting(true);
    const { error } = await supabase
      .from("community_posts")
      .insert({ user_id: userId, content: newPost.trim() });
    setPosting(false);
    if (!error) {
      setNewPost("");
      loadPosts();
    }
  }

  async function toggleLike(postId) {
    if (!userId) return;
    const alreadyLiked = likedByMe.has(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count + (alreadyLiked ? -1 : 1) }
          : p
      )
    );
    setLikedByMe((prev) => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(postId) : next.add(postId);
      return next;
    });

    if (alreadyLiked) {
      await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      await supabase.from("community_likes").insert({ post_id: postId, user_id: userId });
    }
  }

  async function loadComments(postId) {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    if (!comments[postId]) {
      const { data } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      let map = {};
      if (userIds.length) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        (profileData || []).forEach((p) => (map[p.id] = p.full_name));
      }
      setComments((prev) => ({ ...prev, [postId]: { list: data || [], names: map } }));
    }
  }

  async function submitComment(postId) {
    if (!commentDraft.trim() || !userId) return;
    const { error } = await supabase
      .from("community_comments")
      .insert({ post_id: postId, user_id: userId, content: commentDraft.trim() });
    if (!error) {
      setCommentDraft("");
      const { data } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((prev) => ({ ...prev, [postId]: { ...prev[postId], list: data || [] } }));
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-headline-sm text-headline-sm">Community</span>
        </button>
      </header>

      <main className="pt-20 px-margin-mobile max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Ask a question or share something with your classmates..."
            rows={3}
            className="w-full bg-transparent outline-none font-body-md text-body-md placeholder:text-outline resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitPost}
              disabled={posting || !newPost.trim()}
              className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2 rounded-full disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-on-surface-variant py-8">Loading...</p>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              forum
            </span>
            <p className="mt-4 text-on-surface-variant font-body-md text-body-md">
              No posts yet. Be the first to share something!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center font-label-md text-label-md font-bold text-on-secondary-container">
                  {(profiles[post.user_id] || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-body-sm text-body-sm font-semibold">
                    {profiles[post.user_id] || "Student"}
                  </p>
                  <p className="font-label-md text-label-md text-outline">
                    {timeAgo(post.created_at)}
                  </p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface mb-3 whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="flex items-center gap-6 border-t border-outline/10 pt-3">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 font-label-md text-label-md ${
                    likedByMe.has(post.id) ? "text-error" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {likedByMe.has(post.id) ? "favorite" : "favorite_border"}
                  </span>
                  {post.likes_count}
                </button>
                <button
                  onClick={() => loadComments(post.id)}
                  className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                  Comments
                </button>
              </div>

              {openComments === post.id && (
                <div className="mt-3 pt-3 border-t border-outline/10 space-y-3">
                  {(comments[post.id]?.list || []).map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[11px] font-bold shrink-0">
                        {(comments[post.id]?.names?.[c.user_id] || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md font-semibold">
                          {comments[post.id]?.names?.[c.user_id] || "Student"}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-surface-container rounded-full px-3 py-1.5 text-body-sm font-body-sm outline-none"
                    />
                    <button
                      onClick={() => submitComment(post.id)}
                      className="text-primary font-label-md text-label-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <AuthGuard>
      <CommunityScreen />
    </AuthGuard>
  );
}
