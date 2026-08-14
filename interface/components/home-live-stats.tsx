"use client";

import { MessageSquare, PackageCheck, ThumbsUp, TrendingUp } from "lucide-react";

import { useReviews } from "@/components/reviews-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { storageKeys } from "@/lib/storage-keys";
import { formatNumber } from "@/lib/utils";

function useLiveCommunityStats() {
  const { reviews, products } = useReviews();
  const [helpfulVotes] = useLocalStorage<string[]>(storageKeys.helpfulVotes, []);
  const reviewCount = reviews.length;
  const productCount = products.length;
  const reviewIds = new Set(reviews.map((review) => review.id));
  const helpfulVoteCount = helpfulVotes.filter((reviewId) => reviewIds.has(reviewId)).length;

  return {
    reviewCount,
    productCount,
    helpfulVoteCount
  };
}

export function HomeTrustStats() {
  const stats = useLiveCommunityStats();
  const cards = [
    ...(stats.reviewCount ? [{
      label: "Community Reviews",
      value: formatNumber(stats.reviewCount),
      detail: "submitted by signed-in members",
      icon: MessageSquare
    }] : []),
    ...(stats.productCount ? [{
      label: "Products",
      value: formatNumber(stats.productCount),
      detail: "created from submitted reviews",
      icon: PackageCheck
    }] : []),
    ...(stats.helpfulVoteCount ? [{
      label: "Helpful Votes",
      value: formatNumber(stats.helpfulVoteCount),
      detail: "from current community reviews",
      icon: ThumbsUp
    }] : [])
  ];

  if (!cards.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="border border-ink bg-white p-4">
          <card.icon className="mb-4 h-4 w-4 text-signal" aria-hidden="true" />
          <p className="text-3xl font-black text-signal">{card.value}</p>
          <p className="mt-2 text-xs font-black uppercase text-muted">{card.label}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function ReviewVolumeCard() {
  const stats = useLiveCommunityStats();

  if (!stats.reviewCount) return null;

  return (
    <div className="border border-ink bg-white p-4">
      <p className="text-xs font-black uppercase text-muted">Review Volume</p>
      <p className="mt-2 text-4xl font-black text-signal">{formatNumber(stats.reviewCount)}</p>
      <p className="mt-2 text-xs font-semibold uppercase text-muted">
        shared backend submissions
      </p>
    </div>
  );
}

export function LiveActivityCard() {
  const stats = useLiveCommunityStats();

  if (!stats.reviewCount) return null;
  const activity = [
    `${formatNumber(stats.reviewCount)} ${stats.reviewCount === 1 ? "review" : "reviews"}`,
    stats.helpfulVoteCount ? `${formatNumber(stats.helpfulVoteCount)} helpful votes` : null,
  ].filter(Boolean);

  return (
    <div className="border border-white/30 p-4 text-sm font-black uppercase text-white/75">
      <TrendingUp className="mb-4 h-5 w-5" aria-hidden="true" />
      {activity.join(", ")} available now.
    </div>
  );
}
