import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingPill({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 border border-ink bg-white px-2 py-1 text-xs font-black text-ink", className)}
      aria-label={`Rating ${rating} out of 5`}
    >
      <Star className="h-3.5 w-3.5 fill-signal text-signal" aria-hidden="true" />
      {rating.toFixed(1)}
    </span>
  );
}

export function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const width = max === 0 ? 0 : Math.min(100, (value / max) * 100);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase text-muted">
        <span>{label}</span>
        <span className="text-ink">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 border border-ink bg-white" aria-hidden="true">
        <div className="h-full bg-signal" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
