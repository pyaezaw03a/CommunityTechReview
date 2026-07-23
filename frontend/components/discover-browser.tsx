"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { categories, type Category } from "@/data/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { useReviews } from "@/components/reviews-provider";

export function DiscoverBrowser({ initialCategory }: { initialCategory?: string }) {
  const { reviews, products, getProductStats } = useReviews();
  const normalizedInitial = initialCategory && categories.includes(initialCategory as Category) ? (initialCategory as Category) : "All";
  const [category, setCategory] = useState<Category | "All">(normalizedInitial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"rating" | "reviews" | "newest">("newest");

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...products]
      .filter(
        (product) =>
          (category === "All" || product.category === category) &&
          (!normalized || [product.name, product.brand, product.category, ...product.tags].some((value) => value.toLowerCase().includes(normalized)))
      )
      .sort((a, b) => {
        if (sort === "newest") return b.launchYear - a.launchYear;
        const left = getProductStats(a.slug);
        const right = getProductStats(b.slug);
        return sort === "reviews" ? right.count - left.count : (right.rating ?? -1) - (left.rating ?? -1);
      });
  }, [category, getProductStats, products, query, sort]);

  if (!products.length) return null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 border border-ink bg-white p-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="discover-search" className="sr-only">
            Search products
          </label>
          <Input id="discover-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search phones, headphones, laptops, brands..." className="pl-11" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(reviews.length ? (["rating", "reviews", "newest"] as const) : (["newest"] as const)).map((option) => (
            <Button key={option} type="button" size="sm" variant={sort === option ? "default" : "outline"} onClick={() => setSort(option)}>
              {option}
            </Button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {(["All", ...categories] as const).map((item) => (
          <Button key={item} type="button" size="sm" variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)}>
            {item}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
