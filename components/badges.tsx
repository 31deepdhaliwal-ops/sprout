"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BADGES, badgeById, type BadgeTone } from "@/lib/badges";
import { Mascot } from "@/components/mascot";
import { useStore } from "@/lib/store";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneRing: Record<BadgeTone, string> = {
  sage: "bg-primary/12 ring-primary/30",
  clay: "bg-accent/14 ring-accent/30",
  apricot: "bg-apricot/30 ring-apricot/50",
  positive: "bg-positive/14 ring-positive/30",
  neutral: "bg-foreground/8 ring-border",
};

function earnedSet(member: Member): Set<string> {
  return new Set(member.badges ?? []);
}

/** One badge medal — full colour when earned, faded + grayscale when locked. */
function Medal({
  id,
  earned,
  size = "md",
}: {
  id: string;
  earned: boolean;
  size?: "sm" | "md";
}) {
  const def = badgeById(id);
  if (!def) return null;
  const dim = size === "sm" ? "size-9 text-lg" : "size-14 text-2xl";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full ring-2 transition",
        dim,
        earned
          ? toneRing[def.tone]
          : "bg-muted ring-border opacity-45 grayscale",
      )}
      title={earned ? `${def.name} — ${def.description}` : `Locked · ${def.description}`}
      aria-label={`${def.name}${earned ? " (earned)" : " (locked)"}`}
    >
      <span>{def.emoji}</span>
    </div>
  );
}

/** Compact row of just the badges a member has already earned. */
export function EarnedBadges({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  const earned = member.badges ?? [];
  if (earned.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {earned.map((id) => (
        <Medal key={id} id={id} earned size="sm" />
      ))}
    </div>
  );
}

/** The full trophy cabinet: every badge, earned ones lit, locked ones faded. */
export function BadgeWall({ member }: { member: Member }) {
  const earned = earnedSet(member);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Badges</h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {earned.size} / {BADGES.length}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {BADGES.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-1.5 text-center">
            <Medal id={b.id} earned={earned.has(b.id)} />
            <span className="text-xs font-medium leading-tight">{b.name}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {b.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pops up when the signed-in member just unlocked a badge. */
export function BadgeToast() {
  const { recentBadgeId, dismissBadge } = useStore();
  const reduce = useReducedMotion();
  const def = recentBadgeId ? badgeById(recentBadgeId) : null;

  useEffect(() => {
    if (!recentBadgeId) return;
    const t = window.setTimeout(dismissBadge, 4500);
    return () => window.clearTimeout(t);
  }, [recentBadgeId, dismissBadge]);

  return (
    <AnimatePresence>
      {def && (
        <motion.button
          type="button"
          onClick={dismissBadge}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 26 }}
          className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-[min(22rem,90vw)] items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left shadow-soft-lg"
        >
          <div className={cn("grid size-14 shrink-0 place-items-center rounded-full text-2xl ring-2", toneRing[def.tone])}>
            {def.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Badge unlocked!
            </p>
            <p className="truncate font-display text-lg leading-tight">{def.name}</p>
            <p className="truncate text-xs text-muted-foreground">{def.description}</p>
          </div>
          <Mascot state="celebrate" size={44} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
