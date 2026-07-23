"use client";

import type { Product } from "@/data/domain";
import { useReviews } from "@/components/reviews-provider";
import { cn } from "@/lib/utils";

const metricLabels = [
  ["camera", "Camera"],
  ["battery", "Battery"],
  ["performance", "Performance"],
  ["display", "Display"],
  ["value", "Value"]
] as const;

export function SentimentChart({ product, className, compact = false }: { product?: Product; className?: string; compact?: boolean }) {
  const { reviews } = useReviews();
  const relevantReviews = product ? reviews.filter((review) => review.productSlug === product.slug) : reviews;
  if (!relevantReviews.length) return null;

  const values = Object.fromEntries(
    metricLabels.map(([key]) => {
      const ratings = relevantReviews.map((review) => review.categoryRatings[key]).filter((rating) => rating > 0);
      const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      return [key, average * 20];
    })
  ) as Record<(typeof metricLabels)[number][0], number>;

  return (
    <div className={cn("border border-ink bg-white p-4", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-signal">Community Sentiment</p>
          <h3 className={cn("font-black uppercase text-ink", compact ? "text-lg" : "text-2xl")}>
            {product ? product.name : "All Gadgets"}
          </h3>
        </div>
        <span className="border border-ink bg-paper px-2 py-1 text-xs font-black uppercase text-muted">User Reviews</span>
      </div>
      <div className="grid gap-3">
        {metricLabels.map(([key, label]) => {
          const value = values[key];
          if (!value) return null;
          return (
            <div key={key} className="grid gap-1">
              <div className="flex items-center justify-between gap-4 text-xs font-black uppercase">
                <span className="text-muted">{label}</span>
                <span className="text-ink">{value.toFixed(0)}%</span>
              </div>
              <div className="h-3 border border-ink bg-paper" aria-label={`${label} review score ${value.toFixed(0)} percent`}>
                <div
                  className={cn("h-full", value >= 90 ? "bg-signal" : value >= 82 ? "bg-olive" : "bg-peach")}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
