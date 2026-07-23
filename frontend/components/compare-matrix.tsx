"use client";

import Link from "next/link";

import type { Product } from "@/data/domain";
import { Button } from "@/components/ui/button";
import { ProductGlyph } from "@/components/product-visual";
import { useReviews } from "@/components/reviews-provider";

const rows = [
  ["Camera", "camera"],
  ["Performance", "performance"],
  ["Battery", "battery"],
  ["Display", "display"],
  ["Value", "value"],
  ["Community Score", "rating"]
] as const;

export function CompareMatrix({ left, right, cta = true }: { left: Product; right: Product; cta?: boolean }) {
  const { getProductStats } = useReviews();
  const leftStats = getProductStats(left.slug);
  const rightStats = getProductStats(right.slug);
  const visibleRows = rows.filter(([, key]) => {
    if (key === "rating") return leftStats.rating !== null || rightStats.rating !== null;
    return (leftStats.categoryRatings?.[key] ?? 0) > 0 || (rightStats.categoryRatings?.[key] ?? 0) > 0;
  });

  return (
    <div className="border border-ink bg-white">
      <div className="grid md:grid-cols-[1fr_auto_1fr]">
        <CompareProduct product={left} />
        <div className="flex items-center justify-center border-y border-ink bg-signal px-5 py-3 text-2xl font-black uppercase text-white md:border-x md:border-y-0">
          vs
        </div>
        <CompareProduct product={right} />
      </div>
      <div className="border-t border-ink">
        {visibleRows.map(([label, key]) => {
          const leftRating = key === "rating" ? leftStats.rating : leftStats.categoryRatings?.[key] || null;
          const rightRating = key === "rating" ? rightStats.rating : rightStats.categoryRatings?.[key] || null;
          const leftValue = leftRating === null ? null : leftRating * 20;
          const rightValue = rightRating === null ? null : rightRating * 20;
          return (
            <div key={label} className="grid grid-cols-[1fr_auto_1fr] border-b border-line last:border-b-0">
              <CompareScore value={leftValue} display={leftRating === null ? "—" : key === "rating" ? leftRating.toFixed(1) : `${leftValue?.toFixed(0)}%`} align="right" />
              <div className="flex min-w-28 items-center justify-center border-x border-line bg-paper px-3 py-3 text-xs font-black uppercase text-muted">
                {label}
              </div>
              <CompareScore value={rightValue} display={rightRating === null ? "—" : key === "rating" ? rightRating.toFixed(1) : `${rightValue?.toFixed(0)}%`} />
            </div>
          );
        })}
      </div>
      {cta ? (
        <div className="border-t border-ink bg-paper p-4 text-center">
          <Button asChild>
            <Link href="/compare">Compare Products</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CompareProduct({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="focus-ring grid gap-4 p-4 hover:bg-paper">
      <ProductGlyph category={product.category} accent={product.accent} className="h-24" />
      <div>
        {product.brand ? <p className="text-xs font-black uppercase text-muted">{product.brand}</p> : null}
        <h3 className="text-2xl font-black uppercase leading-none text-ink">{product.name}</h3>
      </div>
    </Link>
  );
}

function CompareScore({ value, display, align = "left" }: { value: number | null; display: string; align?: "left" | "right" }) {
  return (
    <div className="grid items-center gap-2 p-3">
      <span className={align === "right" ? "text-right text-sm font-black text-ink" : "text-sm font-black text-ink"}>{display}</span>
      <div className="h-2 border border-ink bg-paper" aria-hidden="true">
        <div className="h-full bg-olive" style={{ width: `${value === null ? 0 : Math.min(100, Math.max(0, value))}%`, marginLeft: align === "right" ? "auto" : 0 }} />
      </div>
    </div>
  );
}
