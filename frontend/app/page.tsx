"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquare, Sparkles, ThumbsUp } from "lucide-react";

import { AnimatedSection } from "@/components/animated-section";
import { CompareMatrix } from "@/components/compare-matrix";
import { HeroDeviceComposition } from "@/components/product-visual";
import { ProductCard } from "@/components/product-card";
import { ReviewFeed } from "@/components/review-feed";
import { SectionHeader } from "@/components/section-header";
import { SentimentChart } from "@/components/sentiment-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HomeTrustStats, LiveActivityCard, ReviewVolumeCard } from "@/components/home-live-stats";
import { useReviews } from "@/components/reviews-provider";

export default function HomePage() {
  const { reviews, products, getProductStats } = useReviews();
  const trending = products.slice(0, 6);
  const heroProduct = trending[0];
  const heroStats = heroProduct ? getProductStats(heroProduct.slug) : null;
  const reviewedProducts = products
    .map((product) => ({ product, stats: getProductStats(product.slug) }))
    .filter((item) => item.stats.count > 0);
  const bestBy = (getValue: (item: (typeof reviewedProducts)[number]) => number) =>
    reviewedProducts.reduce<(typeof reviewedProducts)[number] | null>(
      (best, item) => (!best || getValue(item) > getValue(best) ? item : best),
      null
    );
  const bestCamera = bestBy((item) => item.stats.categoryRatings?.camera ?? 0);
  const bestBattery = bestBy((item) => item.stats.categoryRatings?.battery ?? 0);
  const mostRecommended = bestBy((item) => item.stats.rating ?? 0);
  const bestValue = bestBy((item) => item.stats.categoryRatings?.value ?? 0);
  const signalCards = [
    bestCamera && (bestCamera.stats.categoryRatings?.camera ?? 0) > 0
      ? { label: "Best Camera Phone", value: bestCamera.product.name, detail: `${((bestCamera.stats.categoryRatings?.camera ?? 0) * 20).toFixed(0)}% review score` }
      : null,
    bestBattery && (bestBattery.stats.categoryRatings?.battery ?? 0) > 0
      ? { label: "Best Battery Life", value: bestBattery.product.name, detail: `${((bestBattery.stats.categoryRatings?.battery ?? 0) * 20).toFixed(0)}% review score` }
      : null,
    mostRecommended && mostRecommended.stats.rating !== null
      ? { label: "Most Recommended", value: mostRecommended.product.name, detail: `${mostRecommended.stats.rating.toFixed(1)} average user rating` }
      : null,
    bestValue && (bestValue.stats.categoryRatings?.value ?? 0) > 0
      ? { label: "Best Value for Money", value: bestValue.product.name, detail: `${((bestValue.stats.categoryRatings?.value ?? 0) * 20).toFixed(0)}% review score` }
      : null
  ].filter((card): card is NonNullable<typeof card> => Boolean(card));
  const left = reviewedProducts[0]?.product;
  const right = reviewedProducts[1]?.product;

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className={`mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 ${heroProduct ? "lg:grid-cols-[0.86fr_1.14fr]" : ""}`}>
          <AnimatedSection as="div" className="flex flex-col justify-between gap-10">
            <div>
              <Badge variant="muted" className="border-ink bg-white">
                GadgetPulse / Community Review Lab
              </Badge>
              <h1 className="mt-8 max-w-4xl text-6xl font-black uppercase leading-[0.86] text-ink sm:text-7xl lg:text-8xl">
                Know Before You Buy.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                Real reviews, real ownership experiences, and community feedback for the gadgets you care about.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/discover">
                    Explore Reviews
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/submit-review">Write a Review</Link>
                </Button>
              </div>
            </div>
            <HomeTrustStats />
          </AnimatedSection>
          {heroProduct && heroStats && heroStats.rating !== null ? (
            <AnimatedSection as="div" transition={{ delay: 0.08, duration: 0.5 }}>
              <HeroDeviceComposition product={heroProduct} rating={heroStats.rating} reviewCount={heroStats.count} />
            </AnimatedSection>
          ) : null}
        </div>
      </section>
      {trending.length ? <section className="border-b border-ink py-6">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-sm font-black uppercase text-ink">Reviewed Products</h2>
            <Link href="/discover" className="focus-ring text-xs font-black uppercase text-signal">
              View all
            </Link>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {trending.map((product) => (
              <ProductCard key={product.slug} product={product} compact />
            ))}
          </div>
        </div>
      </section> : null}
      {reviews.length ? <AnimatedSection className="border-b border-ink py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              kicker="Community Signals"
              title="What The Community Is Saying"
              copy="A dashboard-style readout of product strengths, real ownership patterns, and where buyers are finding the most confidence."
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {signalCards.map((card) => (
                <article key={card.label} className="border border-ink bg-white p-5">
                  <Sparkles className="h-5 w-5 text-signal" aria-hidden="true" />
                  <p className="mt-8 text-xs font-black uppercase text-muted">{card.label}</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-none text-ink">{card.value}</h3>
                  <p className="mt-3 text-sm text-muted">{card.detail}</p>
                </article>
              ))}
            </div>
            <SentimentChart />
          </div>
        </div>
      </AnimatedSection> : null}
      {reviews.length ? <AnimatedSection className="border-b border-ink py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.36fr_0.64fr] lg:px-8">
          <div>
            <SectionHeader
              kicker="Latest Reviews"
              title="Latest Community Feedback"
              copy="Fresh ownership notes with pros, cons, and helpful votes from signed-in community members."
            />
            <div className="mt-8 grid gap-3">
              <ReviewVolumeCard />
              <div className="border border-ink bg-white p-4">
                <p className="text-xs font-black uppercase text-muted">Community Actions</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-black uppercase">
                  <ThumbsUp className="h-4 w-4 text-signal" aria-hidden="true" />
                  Vote, save, comment
                </p>
              </div>
            </div>
          </div>
          <ReviewFeed limit={5} />
        </div>
      </AnimatedSection> : null}
      {left && right ? <AnimatedSection className="border-b border-ink py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8">
          <div className="flex flex-col justify-between gap-6">
            <SectionHeader
              kicker="Compare"
              title="Compare Before You Commit."
              copy="Put community scores beside practical ownership categories before you spend."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {["Camera", "Performance", "Battery", "Display", "Value", "Community Score"].map((item) => (
                <div key={item} className="flex items-center justify-between border border-ink bg-white p-3">
                  <span className="text-sm font-black uppercase text-muted">{item}</span>
                  <BadgeCheck className="h-4 w-4 text-olive" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
          <CompareMatrix left={left} right={right} />
        </div>
      </AnimatedSection> : null}
      <section className="bg-signal text-white">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.42fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase text-white/70">Community CTA</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-none sm:text-6xl">
              Your Experience Can Help Someone Buy Better.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Share your honest feedback and become part of a smarter tech community.
            </p>
          </div>
          <div className="grid content-center gap-3">
            <Button asChild variant="secondary" size="lg" className="border-white">
              <Link href="/submit-review">
                Write Your Review
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <LiveActivityCard />
          </div>
        </div>
      </section>
    </div>
  );
}
