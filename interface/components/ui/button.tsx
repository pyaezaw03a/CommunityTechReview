"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-ink px-5 text-sm font-semibold uppercase leading-none transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-signal text-white hover:-translate-y-0.5 hover:shadow-hard-sm",
        secondary: "bg-white text-ink hover:-translate-y-0.5 hover:shadow-hard-sm",
        outline: "bg-transparent text-ink hover:bg-white",
        ghost: "border-transparent bg-transparent text-ink hover:bg-white",
        olive: "bg-olive text-white hover:-translate-y-0.5 hover:shadow-hard-sm"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6",
        icon: "h-11 w-11 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
