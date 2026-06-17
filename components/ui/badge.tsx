import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "sage"
  | "clay"
  | "apricot"
  | "muted"
  | "positive"
  | "warn";

const tones: Record<Tone, string> = {
  neutral: "bg-foreground/8 text-foreground",
  sage: "bg-primary/12 text-primary",
  clay: "bg-accent/14 text-accent",
  apricot: "bg-apricot/25 text-foreground",
  muted: "bg-muted text-muted-foreground",
  positive: "bg-positive/14 text-positive",
  warn: "bg-destructive/12 text-destructive",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "muted", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** The point value a task is worth / a member has. */
export function PointsBadge({
  points,
  className,
}: {
  points: number;
  className?: string;
}) {
  return (
    <Badge tone="apricot" className={cn("font-semibold tabular-nums", className)}>
      ⭐ {points}
    </Badge>
  );
}
