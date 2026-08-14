import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-1 text-xs font-semibold uppercase leading-none",
  {
    variants: {
      variant: {
        default: "border-ink bg-white text-ink",
        signal: "border-signal bg-signal text-white",
        olive: "border-olive bg-olive text-white",
        peach: "border-ink bg-peach text-ink",
        muted: "border-line bg-paper text-muted"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
