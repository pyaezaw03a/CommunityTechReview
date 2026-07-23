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
    <div className={cn("min-w-0 overflow-hidden border border-ink bg-white p-4", className)}>
      <div className="mb-4 flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-signal">Community Sentiment</p>
          <h3 className={cn("break-words font-black uppercase leading-tight text-ink [overflow-wrap:anywhere]", compact ? "text-lg" : "text-xl sm:text-2xl")}>
            {product ? product.name : "All Gadgets"}
          </h3>
        </div>
        <span className="max-w-full shrink-0 border border-ink bg-paper px-2 py-1 text-center text-xs font-black uppercase text-muted">
          User Reviews
        </span>
      </div>
      <div className="grid min-w-0 gap-3">
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
