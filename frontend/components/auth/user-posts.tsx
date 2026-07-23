"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { RatingPill } from "@/components/rating";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { Button } from "@/components/ui/button";
import type { Review } from "@/data/domain";
import { fetchUserReviews } from "@/lib/reviews-api";

export function UserPosts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Review[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(
    async (signal?: AbortSignal) => {
      if (!currentUser) {
        setPosts(null);
        return;
      }

      setLoading(true);
      try {
        setPosts(await fetchUserReviews(signal));
        setError("");
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") {
          setError((requestError as Error).message);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  if (!currentUser || (!error && !posts?.length)) return null;

  return (
    <section id="your-posts" className="scroll-mt-24 border border-ink bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-signal">Post Status</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none text-ink">Your Posts</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Track every review you submitted and see when an admin approves it.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadPosts()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh Status
        </Button>
      </div>

      {error ? (
        <div className="mt-5 border border-signal bg-paper p-3 text-sm font-semibold text-signal" role="alert">
          {error}
        </div>
      ) : null}

      {posts?.length ? (
        <div className="mt-6 grid gap-4">
          {posts.map((post) => (
            <article key={post.id} className="border border-line bg-paper p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-signal">{post.productName}</p>
                  <h3 className="mt-2 text-xl font-black uppercase leading-tight text-ink">{post.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ReviewStatusBadge
                    status={post.status}
                    label={post.status === "published" ? "Approved by admin" : undefined}
                  />
                  <RatingPill rating={post.rating} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{post.body}</p>
              <p className="mt-4 text-xs font-bold uppercase text-muted">
                Submitted {new Date(post.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
