"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductGlyph } from "@/components/product-visual";
import { RatingBar, RatingPill } from "@/components/rating";
import { ReviewCard } from "@/components/review-card";
import { useReviews } from "@/components/reviews-provider";

export function ReviewDetail({ id }: { id: string }) {
  const { reviews, products, isLoading } = useReviews();
  const review = reviews.find((item) => item.id === id);
  const product = review ? products.find((item) => item.slug === review.productSlug) : undefined;

  if (isLoading) return null;

  if (!review) return null;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="outline" className="justify-self-start">
        <Link href={`/products/${review.productSlug}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Product
        </Link>
      </Button>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-6">
          <div className="border border-ink bg-white p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <RatingPill rating={review.rating} />
              <span className="border border-ink bg-paper px-2 py-1 text-xs font-black uppercase text-muted">{review.ownership} ownership</span>
            </div>
            <p className="mt-6 text-xs font-black uppercase text-signal">{review.productName}</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] text-ink sm:text-6xl">{review.title}</h1>
            <p className="mt-5 text-lg leading-8 text-muted">{review.body}</p>
          </div>
          <ReviewCard review={review} />
        </div>
        <aside className="grid content-start gap-5">
          {product ? (
            <Link href={`/products/${product.slug}`} className="focus-ring block border border-ink bg-white hover:shadow-hard-sm">
              <ProductGlyph category={product.category} accent={product.accent} className="h-56" />
              <div className="border-t border-ink p-4">
                <p className="text-xs font-black uppercase text-muted">{product.category}</p>
                <h2 className="mt-1 text-2xl font-black uppercase leading-none text-ink">{product.name}</h2>
              </div>
            </Link>
          ) : null}
          <div className="border border-ink bg-white p-5">
            <h2 className="text-2xl font-black uppercase text-ink">Category Ratings</h2>
            <div className="mt-5 grid gap-4">
              <RatingBar label="Performance" value={review.categoryRatings.performance} />
              {review.categoryRatings.camera > 0 ? <RatingBar label="Camera" value={review.categoryRatings.camera} /> : null}
              <RatingBar label="Battery" value={review.categoryRatings.battery} />
              {review.categoryRatings.display > 0 ? <RatingBar label="Display" value={review.categoryRatings.display} /> : null}
              <RatingBar label="Value" value={review.categoryRatings.value} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
