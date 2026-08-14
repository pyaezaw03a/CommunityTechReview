"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, ShieldX } from "lucide-react";

import type { Review, ReviewStatus } from "@/data/domain";
import { ReviewPhoto } from "@/components/review-photo";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { useReviews } from "@/components/reviews-provider";
import { Button } from "@/components/ui/button";
import { fetchAdminReviews, moderateReview } from "@/lib/reviews-api";

export function AdminModerationQueue() {
  const { refresh } = useReviews();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadQueue() {
    setLoading(true);
    setError("");
    try {
      setReviews(await fetchAdminReviews());
    } catch (requestError) {
      setReviews(null);
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: ReviewStatus) {
    setUpdatingId(id);
    setError("");
    try {
      const updated = await moderateReview(id, status);
      setReviews((current) => current?.map((review) => (review.id === updated.id ? updated : review)) ?? null);
      await refresh();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (reviews === null) {
    return (
      <section id="moderation" className="scroll-mt-24 border border-ink bg-white p-5">
        <p className="text-xs font-black uppercase text-signal">Admin-only workflow</p>
        <h2 className="mt-2 text-3xl font-black uppercase text-ink">Review Moderation</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Load submitted reviews and change their publication status with your signed-in admin account.
        </p>
        <Button type="button" className="mt-5" onClick={() => void loadQueue()} disabled={loading}>
          {loading ? "Loading..." : "Load moderation queue"}
        </Button>
        {error ? (
          <p className="mt-4 border border-signal bg-paper p-4 text-sm font-semibold text-signal" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  if (!reviews.length) return null;

  const counts = {
    under_review: reviews.filter((review) => review.status === "under_review").length,
    published: reviews.filter((review) => review.status === "published").length,
    violated: reviews.filter((review) => review.status === "violated").length
  };

  return (
    <section id="moderation" className="scroll-mt-24 grid gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase text-signal">Admin approval required</p>
          <h2 className="mt-2 text-3xl font-black uppercase text-ink">Review Moderation</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {counts.under_review ? <StatusCount label="Under review" value={counts.under_review} tone="amber" /> : null}
          {counts.published ? <StatusCount label="Published" value={counts.published} tone="olive" /> : null}
          {counts.violated ? <StatusCount label="Violated" value={counts.violated} tone="signal" /> : null}
        </div>
      </div>

      {error ? (
        <p className="border border-signal bg-white p-4 text-sm font-semibold text-signal" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {reviews.map((review) => {
          const isUpdating = updatingId === review.id;
          return (
            <article key={review.id} className="border border-ink bg-white">
              <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <ReviewStatusBadge status={review.status} />
                    <span className="text-xs font-black uppercase text-muted">@{review.username}</span>
                    <span className="text-xs font-black uppercase text-muted">
                      {new Date(review.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-black uppercase text-signal">{review.productName}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase leading-none text-ink">{review.title}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">{review.body}</p>
                  {review.photoUrl ? (
                    <ReviewPhoto
                      src={review.photoUrl}
                      alt={`${review.productName} submitted by @${review.username}`}
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="mt-5 max-w-2xl"
                    />
                  ) : null}
                </div>

                <div className="grid content-start gap-2 sm:grid-cols-3 lg:w-44 lg:grid-cols-1">
                  {review.status !== "published" ? (
                    <Button type="button" size="sm" variant="olive" disabled={isUpdating} onClick={() => void updateStatus(review.id, "published")}>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Approve
                    </Button>
                  ) : null}
                  {review.status !== "violated" ? (
                    <Button type="button" size="sm" disabled={isUpdating} onClick={() => void updateStatus(review.id, "violated")}>
                      <ShieldX className="h-4 w-4" aria-hidden="true" />
                      Mark violated
                    </Button>
                  ) : null}
                  {review.status !== "under_review" ? (
                    <Button type="button" size="sm" variant="outline" disabled={isUpdating} onClick={() => void updateStatus(review.id, "under_review")}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Review again
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StatusCount({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "amber" | "olive" | "signal";
}) {
  const className = {
    amber: "border-amber-500 bg-amber-50 text-amber-700",
    olive: "border-olive bg-olive text-white",
    signal: "border-signal bg-signal text-white"
  }[tone];

  return (
    <span className={`border px-3 py-2 text-xs font-black uppercase ${className}`}>
      {value} {label}
    </span>
  );
}
