"use client";

import { Hash, Trophy } from "lucide-react";

import { ReviewFeed } from "@/components/review-feed";
import { useReviews } from "@/components/reviews-provider";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";

export default function CommunityPage() {
  const { reviews } = useReviews();
  const activeCategories = Array.from(new Set(reviews.map((review) => review.category)));
  const popularReviewers = Array.from(
    reviews.reduce((reviewers, review) => {
      const current = reviewers.get(review.username) ?? { username: review.username, reviews: 0 };
      current.reviews += 1;
      reviewers.set(review.username, current);
      return reviewers;
    }, new Map<string, { username: string; reviews: number }>()).values()
  )
    .sort((left, right) => right.reviews - left.reviews)
    .slice(0, 5);

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Community"
            title="Real Ownership Feedback"
            copy="Browse reviews and activity created by GadgetPulse members."
          />
        </div>
      </section>
      {reviews.length ? (
        <section className="mx-auto grid max-w-[1320px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          <ReviewFeed />
          <aside className="grid content-start gap-5">
            {activeCategories.length ? (
              <div className="border border-ink bg-white p-5">
                <h2 className="flex items-center gap-2 text-2xl font-black uppercase text-ink">
                  <Hash className="h-5 w-5 text-signal" aria-hidden="true" />
                  Active Categories
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeCategories.map((category) => (
                    <Badge key={category} variant="olive">{category}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {popularReviewers.length ? (
              <div className="border border-ink bg-white p-5">
                <h2 className="flex items-center gap-2 text-2xl font-black uppercase text-ink">
                  <Trophy className="h-5 w-5 text-signal" aria-hidden="true" />
                  Active Reviewers
                </h2>
                <div className="mt-5 grid gap-3">
                  {popularReviewers.map((reviewer) => (
                    <div key={reviewer.username} className="border border-line bg-paper p-3">
                      <p className="font-black text-ink">@{reviewer.username}</p>
                      <p className="text-xs font-semibold uppercase text-muted">
                        {reviewer.reviews} {reviewer.reviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>
      ) : null}
    </div>
  );
}
