"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGlyph } from "@/components/product-visual";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/data/domain";
import { useReviews } from "@/components/reviews-provider";

export default function CategoriesPage() {
  const { reviews, products } = useReviews();

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader kicker="Categories" title="Find Feedback By Device Type" copy="Each category is built like a compact buying lab with ratings, volume, and product-level community signals." />
        </div>
      </section>
      {products.length ? <section className="mx-auto grid max-w-[1320px] gap-4 px-4 py-10 sm:px-6 md:grid-cols-2 xl:grid-cols-3 lg:px-8">
        {categories.filter((category) => products.some((product) => product.category === category)).map((category) => {
          const categoryProducts = products.filter((product) => product.category === category);
          const categoryReviews = reviews.filter((review) => review.category === category);
          const average = categoryReviews.length
            ? categoryReviews.reduce((sum, review) => sum + review.rating, 0) / categoryReviews.length
            : null;
          return (
            <Link key={category} href={`/discover?category=${encodeURIComponent(category)}`} className="focus-ring group border border-ink bg-white transition-all hover:-translate-y-1 hover:shadow-hard-md">
              <ProductGlyph category={category} accent={categoryProducts[0]?.accent ?? "signal"} className="h-40" />
              <div className="grid gap-5 border-t border-ink p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-muted">Category</p>
                    <h2 className="mt-1 text-3xl font-black uppercase leading-none text-ink">{category}</h2>
                  </div>
                  <ArrowRight className="h-5 w-5 text-signal transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="olive">{categoryProducts.length} products</Badge>
                  {average !== null ? <Badge>{average.toFixed(1)} avg user rating</Badge> : null}
                </div>
              </div>
            </Link>
          );
        })}
      </section> : null}
    </div>
  );
}
