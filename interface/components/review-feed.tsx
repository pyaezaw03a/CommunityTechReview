"use client";

import { useMemo, useState } from "react";

import { categories, type Category } from "@/data/domain";
import { ReviewCard } from "@/components/review-card";
import { useReviews } from "@/components/reviews-provider";
import { Button } from "@/components/ui/button";

type ReviewFeedProps = {
  productSlug?: string;
  username?: string;
  limit?: number;
  showFilters?: boolean;
  titleId?: string;
};

export function ReviewFeed({ productSlug, username, limit, showFilters = true, titleId }: ReviewFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "All Categories">("All Categories");
  const { reviews, isLoading } = useReviews();

  const scopedReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesProduct = productSlug ? review.productSlug === productSlug : true;
        const matchesUser = username ? review.username === username : true;
        return matchesProduct && matchesUser;
      }),
    [productSlug, reviews, username]
  );

  const visibleReviews = useMemo(() => {
    const filtered = scopedReviews.filter((review) =>
      selectedCategory === "All Categories" ? true : review.category === selectedCategory
    );
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [limit, scopedReviews, selectedCategory]);

  if (isLoading || !scopedReviews.length) return null;

  return (
    <section aria-labelledby={titleId} className="grid gap-5">
      {showFilters ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter reviews by category">
          {(["All Categories", ...categories] as const).map((category) => (
            <Button
              key={category}
              type="button"
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
