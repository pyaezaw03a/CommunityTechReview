"use client";

import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { useReviews } from "@/components/reviews-provider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function SearchModal({ triggerClassName }: { triggerClassName?: string }) {
  const { reviews, products, getProductStats } = useReviews();
  const availableCategories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products]
  );
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) {
      return { products: products.slice(0, 4), reviews: reviews.slice(0, 3), categories: availableCategories.slice(0, 4) };
    }
    return {
      products: products
        .filter((product) => [product.name, product.brand, product.category, ...product.tags].some((value) => value.toLowerCase().includes(normalized)))
        .slice(0, 5),
      reviews: reviews
        .filter((review) => [review.title, review.productName, review.username, review.body].some((value) => value.toLowerCase().includes(normalized)))
        .slice(0, 5),
      categories: availableCategories.filter((category) => category.toLowerCase().includes(normalized))
    };
  }, [availableCategories, normalized, products, reviews]);

  if (!products.length && !reviews.length) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className={triggerClassName} aria-label="Open search">
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-14">
          <DialogTitle>Search GadgetPulse</DialogTitle>
          <DialogDescription>Find submitted products, reviews, and active categories.</DialogDescription>
        </DialogHeader>
        <div className="border-b border-ink bg-white p-4">
          <label className="sr-only" htmlFor="global-search">
            Search products, reviews, and categories
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <Input
              id="global-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products or review text..."
              className="h-14 pl-11 text-base"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-5">
          {results.products.length ? <SearchGroup title="Products">
            {results.products.map((product) => (
              <DialogClose asChild key={product.slug}>
                <Link href={`/products/${product.slug}`} className="focus-ring grid gap-1 border border-line bg-white p-3 hover:border-ink">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black text-ink">{product.name}</span>
                    {getProductStats(product.slug).rating !== null ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-signal">
                        <Star className="h-3.5 w-3.5 fill-signal" aria-hidden="true" />
                        {getProductStats(product.slug).rating?.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs uppercase text-muted">{product.category}</span>
                </Link>
              </DialogClose>
            ))}
          </SearchGroup> : null}
          {results.reviews.length ? (
            <SearchGroup title="Reviews">
              {results.reviews.map((review) => (
                <DialogClose asChild key={review.id}>
                  <Link href={`/reviews/${review.id}`} className="focus-ring block border border-line bg-white p-3 hover:border-ink">
                    <p className="font-black text-ink">{review.title}</p>
                    <p className="mt-1 text-xs uppercase text-muted">
                      {review.productName} by @{review.username}
                    </p>
                  </Link>
                </DialogClose>
              ))}
            </SearchGroup>
          ) : null}
          {results.categories.length ? <SearchGroup title="Categories">
            <div className="flex flex-wrap gap-2">
              {results.categories.map((category) => (
                <DialogClose asChild key={category}>
                  <Link href={`/discover?category=${encodeURIComponent(category)}`} className="focus-ring">
                    <Badge variant="olive">{category}</Badge>
                  </Link>
                </DialogClose>
              ))}
            </div>
          </SearchGroup> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-xs font-black uppercase text-muted">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
