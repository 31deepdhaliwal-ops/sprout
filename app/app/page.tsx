"use client";

import Link from "next/link";
import { Flame, RotateCcw, Trophy } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { CountUp } from "@/components/count-up";
import { Mascot } from "@/components/mascot";
import { NewTaskButton } from "@/components/new-task";
import { TaskItem } from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { leaderboard, levelFor } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentMember, tasks, members, reset } = useStore();

  const myTodo = tasks.filter(
    (t) => t.assigneeId === currentMember.id && t.status === "todo",
  );
  const myDone = tasks.filter(
    (t) => t.assigneeId === currentMember.id && t.status === "done",
  );
  const lvl = levelFor(currentMember.lifetimePoints);
  const isParent = currentMember.role === "parent";
  const board = leaderboard(members, tasks);

  return (
    <div className="space-y-6">
      {/* header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar member={currentMember} size="xl" showEmoji />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Hi {currentMember.name} {currentMember.emoji}
            </p>
            <h1 className="font-display text-3xl leading-tight">
              {myTodo.length > 0
                ? `${myTodo.length} ${myTodo.length === 1 ? "task" : "tasks"} to go`
                : "All done — nice work!"}
            </h1>
          </div>
          <Mascot state={myTodo.length === 0 ? "celebrate" : "balanced"} size={64} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Points" value={currentMember.points} accent />
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="mt-1 flex items-center gap-1 font-display text-2xl">
              <CountUp value={currentMember.streakDays} />
              <Flame className="size-5 text-accent" />
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">Level {lvl.level}</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${lvl.pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {lvl.into}/{lvl.toNext} to next
            </p>
          </div>
        </div>
      </Card>

      {/* my tasks */}
      <section>
        <div className="mb-1 flex items-center justify-between px-2">
          <h2 className="font-display text-xl">My tasks</h2>
          {isParent && <NewTaskButton size="sm" variant="secondary" />}
        </div>
        <Card className="divide-y divide-border/60 p-2">
          {myTodo.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing to do right now — go spend your points! 🌿
            </p>
          ) : (
            myTodo.map((t) => <TaskItem key={t.id} task={t} />)
          )}
        </Card>
      </section>

      {/* parent: leaderboard peek */}
      {isParent && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <Trophy className="size-4 text-accent" /> Family leaderboard
            </h2>
            <Link href="/app/family" className="text-sm font-medium text-primary">
              See all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {board.slice(0, 3).map((row, i) => (
              <li key={row.member.id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-muted-foreground">{i + 1}</span>
                <Avatar member={row.member} size="sm" />
                <span className="font-medium">{row.member.name}</span>
                <span className="ml-auto tabular-nums text-muted-foreground">
                  {row.lifetime} pts
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {myDone.length > 0 && (
        <details className="rounded-3xl border border-border bg-card/60 px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Completed ({myDone.length})
          </summary>
          <div className="mt-2 divide-y divide-border/60">
            {myDone.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        </details>
      )}

      <div className="pt-1">
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="size-4" /> Reset demo
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", accent && "text-accent")}>
        <CountUp value={value} />
      </p>
    </div>
  );
}
