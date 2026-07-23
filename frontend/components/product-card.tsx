"use client";

import Link from "next/link";
import { MessageSquare, TrendingUp } from "lucide-react";

import type { Product } from "@/data/domain";
import { Badge } from "@/components/ui/badge";
import { ProductGlyph } from "@/components/product-visual";
import { RatingPill } from "@/components/rating";
import { useReviews } from "@/components/reviews-provider";
import { formatNumber } from "@/lib/utils";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const stats = useReviews().getProductStats(product.slug);

  return (
    <Link href={`/products/${product.slug}`} className="focus-ring group grid min-w-72 border border-ink bg-white transition-all hover:-translate-y-1 hover:shadow-hard-md">
      <ProductGlyph
        category={product.category}
        accent={product.accent}
        photoUrl={product.photoUrl}
        productName={product.name}
        className={compact ? "h-24" : undefined}
      />
      <div className="grid gap-4 border-t border-ink p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-muted">{product.category}</p>
            <h3 className="mt-1 text-xl font-black uppercase leading-none text-ink">{product.name}</h3>
          </div>
          {stats.rating !== null ? <RatingPill rating={stats.rating} /> : null}
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{product.summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="signal" className="gap-1">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            {product.trend}
          </Badge>
          {stats.count ? (
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-muted">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {formatNumber(stats.count)} {stats.count === 1 ? "review" : "reviews"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
