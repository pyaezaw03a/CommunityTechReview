"use client";

import Image from "next/image";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";

import type { Review } from "@/data/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingPill } from "@/components/rating";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { storageKeys } from "@/lib/storage-keys";
import { getInitials } from "@/lib/utils";

export function ReviewCard({ review }: { review: Review }) {
  const [helpfulVotes, setHelpfulVotes] = useLocalStorage<string[]>(storageKeys.helpfulVotes, []);
  const voted = helpfulVotes.includes(review.id);
  const helpfulCount = voted ? 1 : 0;

  function toggleHelpful() {
    setHelpfulVotes((current) => (current.includes(review.id) ? current.filter((id) => id !== review.id) : [...current, review.id]));
  }

  return (
    <article className="border border-ink bg-white">
      <div className="grid gap-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-ink bg-paper text-sm font-black">
              {getInitials(review.username.replace("-", " "))}
            </span>
            <div className="min-w-0">
              <span className="font-black text-ink">@{review.username}</span>
              <p className="text-xs font-semibold uppercase text-muted">
                {review.ownership} ownership / {new Date(review.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ReviewStatusBadge status={review.status} />
            <RatingPill rating={review.rating} />
          </div>
        </div>
        <div>
          <span className="text-xs font-black uppercase text-signal">{review.productName}</span>
          <Link href={`/reviews/${review.id}`} className="focus-ring block">
            <h3 className="mt-2 text-2xl font-black uppercase leading-none text-ink hover:text-signal">{review.title}</h3>
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted">{review.body}</p>
        </div>
        {review.photoUrl ? (
          <div className="relative h-64 w-full overflow-hidden border border-ink bg-paper sm:h-80">
            <Image
              src={review.photoUrl}
              alt={`${review.productName} uploaded by @${review.username}`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <TagGroup label="Pros" tags={review.pros} variant="olive" />
          <TagGroup label="Cons" tags={review.cons} variant="peach" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink bg-paper px-4 py-3 sm:px-5">
        <Button type="button" variant={voted ? "olive" : "outline"} size="sm" onClick={toggleHelpful}>
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          {helpfulCount ? `${helpfulCount} Helpful` : "Helpful"}
        </Button>
      </div>
    </article>
  );
}

function TagGroup({ label, tags, variant }: { label: string; tags: string[]; variant: "olive" | "peach" }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant={variant}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
