"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { TaskItem } from "@/components/task-item";
import { Card } from "@/components/ui/card";
import { dueBucket } from "@/lib/scoring";
import { useMe, useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type Group = {
  key: string;
  label: string;
  tone: string; // heading colour
  match: (t: Task) => boolean;
};

const GROUPS: Group[] = [
  { key: "overdue", label: "Overdue", tone: "text-destructive", match: (t) => !!t.dueDate && dueBucket(t.dueDate) === "overdue" },
  { key: "today", label: "Today", tone: "text-accent", match: (t) => !!t.dueDate && dueBucket(t.dueDate) === "today" },
  { key: "tomorrow", label: "Tomorrow", tone: "text-foreground", match: (t) => !!t.dueDate && dueBucket(t.dueDate) === "tomorrow" },
  { key: "soon", label: "This week", tone: "text-foreground", match: (t) => !!t.dueDate && dueBucket(t.dueDate) === "soon" },
  { key: "later", label: "Later", tone: "text-muted-foreground", match: (t) => !!t.dueDate && dueBucket(t.dueDate) === "later" },
  { key: "none", label: "No date", tone: "text-muted-foreground", match: (t) => !t.dueDate },
];

export default function Calendar() {
  const { tasks } = useStore();
  const me = useMe();
  const isParent = me.role === "parent";
  const [scope, setScope] = useState<"mine" | "all">("mine");

  const everyone = isParent && scope === "all";
  const open = tasks.filter((t) => {
    if (t.status === "done") return false;
    return everyone || t.assigneeId === me.id;
  });

  const groups = GROUPS.map((g) => ({
    ...g,
    items: open
      .filter(g.match)
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-3xl">
          <CalendarDays className="size-6 text-primary" /> Schedule
        </h1>
        {isParent && (
          <div className="flex rounded-full border border-border bg-card p-0.5 text-sm">
            {(["mine", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  scope === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {s === "mine" ? "Mine" : "Everyone"}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nothing on the schedule — you&apos;re all caught up! 🌿
        </Card>
      ) : (
        groups.map((g) => (
          <section key={g.key}>
            <div className="mb-1 flex items-center gap-2 px-2">
              <h2 className={cn("font-display text-lg", g.tone)}>{g.label}</h2>
              <span className="text-sm tabular-nums text-muted-foreground">
                {g.items.length}
              </span>
            </div>
            <Card className="divide-y divide-border/60 p-2">
              {g.items.map((t) => (
                <TaskItem key={t.id} task={t} showAssignee={everyone} />
              ))}
            </Card>
          </section>
        ))
      )}
    </div>
  );
}
