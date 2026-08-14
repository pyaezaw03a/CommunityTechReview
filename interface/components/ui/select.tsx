"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("focus-ring h-11 w-full border border-ink bg-white px-3 text-sm font-medium text-ink", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
