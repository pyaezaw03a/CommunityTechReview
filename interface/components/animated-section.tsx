"use client";

import { motion, type MotionProps } from "framer-motion";
import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type AnimatedSectionProps = PropsWithChildren<
  MotionProps &
    HTMLAttributes<HTMLElement> & {
    className?: string;
    as?: "section" | "div" | "article";
  }
>;

export function AnimatedSection({ children, className, as = "section", ...props }: AnimatedSectionProps) {
  const Comp = motion[as];

  return (
    <Comp
      className={cn(className)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      {...props}
    >
      {children}
    </Comp>
  );
}
