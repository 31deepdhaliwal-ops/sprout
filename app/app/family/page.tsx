"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { ManageMembers } from "@/components/manage-members";
import { TaskItem } from "@/components/task-item";
import { Card } from "@/components/ui/card";
import { leaderboard, levelFor } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Family() {
  const { members, tasks, isOwner } = useStore();
  const [range, setRange] = useState<"week" | "all">("week");

  const rows = leaderboard(members, tasks);
  const sorted = [...rows].sort((a, b) =>
    range === "week" ? b.week - a.week : b.lifetime - a.lifetime,
  );
  const max = Math.max(
    1,
    ...sorted.map((r) => (range === "week" ? r.week : r.lifetime)),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Family</h1>
        <div className="flex rounded-full border border-border bg-card p-0.5 text-sm">
          {(["week", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-3 py-1 transition",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {r === "week" ? "This week" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* leaderboard */}
      <Card className="p-5">
        <h2 className="font-display text-lg">Leaderboard</h2>
        <ul className="mt-4 space-y-3">
          {sorted.map((row, i) => {
            const val = range === "week" ? row.week : row.lifetime;
            return (
              <li key={row.member.id} className="flex items-center gap-3">
                <span className="w-5 text-center font-display text-lg text-muted-foreground">
                  {i + 1}
                </span>
                <Avatar member={row.member} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {row.member.name}{" "}
                      <span className="text-xs capitalize text-muted-foreground">
                        · {row.member.role}
                      </span>
                    </span>
                    <span className="tabular-nums text-sm text-muted-foreground">
                      {val} pts
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${(val / max) * 100}%`,
                        backgroundColor: row.member.color,
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* manager: add & manage who's in the household */}
      {isOwner && <ManageMembers />}

      {/* per-member boards */}
      <div className="grid gap-4 md:grid-cols-2">
        {members.map((m) => {
          const todo = tasks.filter(
            (t) => t.assigneeId === m.id && t.status === "todo",
          );
          return (
            <Card key={m.id} className="p-4">
              <div className="mb-2 flex items-center gap-2 px-1">
                <Avatar member={m} size="sm" />
                <span className="font-display text-lg">{m.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Lvl {levelFor(m.lifetimePoints).level}
                </span>
              </div>
              <div className="divide-y divide-border/60">
                {todo.length === 0 ? (
                  <p className="px-3 py-5 text-center text-sm text-muted-foreground">
                    All clear 🎉
                  </p>
                ) : (
                  todo.map((t) => <TaskItem key={t.id} task={t} />)
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
