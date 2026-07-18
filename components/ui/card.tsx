import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The single card primitive used across FloWise.
 * 28px radius, white surface, near-invisible border, soft premium shadow.
 * Every dashboard card composes this — no duplicate card JSX elsewhere.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-card border border-border bg-card p-6 shadow-card",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 flex items-center justify-between gap-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-section font-semibold text-ink", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export { Card, CardHeader, CardTitle };
