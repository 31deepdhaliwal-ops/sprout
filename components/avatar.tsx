import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-3xl",
};

export function Avatar({
  member,
  size = "md",
  showEmoji = false,
  className,
}: {
  member?: Member | null;
  size?: Size;
  showEmoji?: boolean;
  className?: string;
}) {
  if (!member) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-full border border-dashed border-border bg-muted font-medium text-muted-foreground",
          sizes[size],
          className,
        )}
        aria-label="Unassigned"
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: member.color }}
      title={member.name}
      aria-label={member.name}
    >
      {showEmoji ? member.emoji : member.initials}
    </div>
  );
}
