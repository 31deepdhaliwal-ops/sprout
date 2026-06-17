"use client";

import Link from "next/link";
import { AlarmClock, CalendarClock, Inbox } from "lucide-react";
import { dueBucket } from "@/lib/scoring";
import { useMe, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Gentle nudges at the top of the dashboard: what's overdue, what's due today,
 * and (for parents) how many tasks are waiting to be approved. */
export function Reminders() {
  const { tasks } = useStore();
  const me = useMe();

  const myOpen = tasks.filter(
    (t) => t.assigneeId === me.id && t.status !== "done",
  );
  const overdue = myOpen.filter(
    (t) => t.dueDate && dueBucket(t.dueDate) === "overdue",
  ).length;
  const today = myOpen.filter(
    (t) => t.dueDate && dueBucket(t.dueDate) === "today",
  ).length;
  const toApprove =
    me.role === "parent"
      ? tasks.filter((t) => t.status === "pending").length
      : 0;

  if (overdue === 0 && today === 0 && toApprove === 0) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {overdue > 0 && (
        <Note
          href="/app/calendar"
          tone="warn"
          icon={<AlarmClock className="size-4" />}
          text={`${overdue} task${overdue > 1 ? "s" : ""} overdue`}
        />
      )}
      {today > 0 && (
        <Note
          href="/app/calendar"
          tone="apricot"
          icon={<CalendarClock className="size-4" />}
          text={`${today} due today`}
        />
      )}
      {toApprove > 0 && (
        <Note
          href="#to-approve"
          tone="sage"
          icon={<Inbox className="size-4" />}
          text={`${toApprove} waiting for your approval`}
        />
      )}
    </div>
  );
}

const tones = {
  warn: "bg-destructive/12 text-destructive",
  apricot: "bg-apricot/30 text-foreground",
  sage: "bg-primary/12 text-primary",
} as const;

function Note({
  href,
  tone,
  icon,
  text,
}: {
  href: string;
  tone: keyof typeof tones;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition hover:opacity-90",
        tones[tone],
      )}
    >
      {icon}
      {text}
    </Link>
  );
}
