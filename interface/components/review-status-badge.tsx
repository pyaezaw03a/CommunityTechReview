import { CheckCircle2, Clock3, ShieldX, type LucideIcon } from "lucide-react";

import type { ReviewStatus } from "@/data/domain";

const statusConfig: Record<
  ReviewStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  under_review: {
    label: "Under review",
    icon: Clock3,
    className: "border-amber-500 bg-amber-50 text-amber-700"
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    className: "border-olive bg-olive text-white"
  },
  violated: {
    label: "Violated",
    icon: ShieldX,
    className: "border-signal bg-signal text-white"
  }
};

export function ReviewStatusBadge({ status, label: customLabel }: { status: ReviewStatus; label?: string }) {
  const { label, icon: Icon, className } = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-black uppercase ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {customLabel ?? label}
    </span>
  );
}
