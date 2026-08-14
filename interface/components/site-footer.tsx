"use client";

import Link from "next/link";

import { useReviews } from "@/components/reviews-provider";

export function SiteFooter() {
  const { products } = useReviews();
  const activeCategories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <footer className="border-t border-ink bg-ink text-white">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-signal text-sm font-black">
              GP
            </span>
            <span className="grid leading-none">
              <span className="text-sm font-black uppercase">GadgetPulse</span>
              <span className="text-[10px] font-semibold uppercase text-white/55">Real Feedback. Better Tech Choices.</span>
            </span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            Honest community reviews, real ownership notes, comparisons, and practical product signals before you buy.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase text-white/45">2026 GadgetPulse</p>
        </div>
        <div>
          <h2 className="text-xs font-black uppercase text-white/45">Navigate</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/discover" className="w-fit text-white/72 hover:text-white">Discover</Link>
            <Link href="/categories" className="w-fit text-white/72 hover:text-white">Categories</Link>
            <Link href="/compare" className="w-fit text-white/72 hover:text-white">Comparisons</Link>
            <Link href="/community" className="w-fit text-white/72 hover:text-white">Community</Link>
            <Link href="/saved" className="w-fit text-white/72 hover:text-white">Saved Products</Link>
          </div>
        </div>
        {activeCategories.length ? <div>
          <h2 className="text-xs font-black uppercase text-white/45">Categories</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {activeCategories.map((category) => (
              <Link key={category} href={`/discover?category=${encodeURIComponent(category)}`} className="w-fit text-white/72 hover:text-white">
                {category}
              </Link>
            ))}
          </div>
        </div> : null}
      </div>
    </footer>
  );
}
