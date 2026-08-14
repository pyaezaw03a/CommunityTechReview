"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { ProductGlyph } from "@/components/product-visual";
import { RatingPill } from "@/components/rating";
import { ReviewFeed } from "@/components/review-feed";
import { useReviews } from "@/components/reviews-provider";
import { SaveProductButton } from "@/components/save-product-button";
import { SentimentChart } from "@/components/sentiment-chart";
import { Button } from "@/components/ui/button";

export function ProductDetail({ slug }: { slug: string }) {
  const { products, isLoading, getProductStats } = useReviews();
  const product = products.find((item) => item.slug === slug);

  if (isLoading || !product) return null;

  const stats = getProductStats(product.slug);
  if (stats.rating === null || !stats.count) return null;

  return (
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <ProductGlyph
          category={product.category}
          accent={product.accent}
          photoUrl={product.photoUrl}
          productName={product.name}
          className="min-h-72"
        />
        <div className="flex flex-col justify-between gap-8 border border-ink bg-white p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase text-signal">{product.category}</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] text-ink sm:text-7xl">{product.name}</h1>
            <p className="mt-5 text-base leading-7 text-muted">{product.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RatingPill rating={stats.rating} />
            <span className="text-sm font-black uppercase text-muted">
              {stats.count} {stats.count === 1 ? "review" : "reviews"}
            </span>
            <SaveProductButton slug={product.slug} />
            <Button asChild>
              <Link href={`/submit-review?product=${encodeURIComponent(product.slug)}`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Write A Review
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <ReviewFeed productSlug={product.slug} showFilters={false} />
        <SentimentChart product={product} />
      </section>
    </div>
  );
}
