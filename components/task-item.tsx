"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Avatar } from "@/components/avatar";
import { Confetti } from "@/components/confetti";
import { PointsBadge } from "@/components/ui/badge";
import { memberById } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import type { Recurrence, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function recurrenceLabel(r: Recurrence | null): string | null {
  if (!r) return null;
  return r.type === "daily" ? "Daily" : `Weekly · ${DAYS[r.weekday]}`;
}

function prettyDate(iso: string): string {
  try {
    return format(parseISO(iso), "EEE d MMM");
  } catch {
    return iso;
  }
}

export function TaskItem({
  task,
  showAssignee = false,
}: {
  task: Task;
  showAssignee?: boolean;
}) {
  const { toggleTask, members } = useStore();
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);

  const assignee = memberById(members, task.assigneeId);
  const recur = recurrenceLabel(task.recurrence);
  const done = task.status === "done";

  const onToggle = () => {
    const completing = task.status === "todo";
    toggleTask(task.id);
    if (completing) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1000);
    }
  };

  return (
    <motion.div
      layout={!reduce}
      className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/60"
    >
      <div className="relative">
        {burst && <Confetti />}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
            done
              ? "border-positive bg-positive"
              : "border-border hover:border-primary",
          )}
        >
          <AnimatePresence>
            {done && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 16 }
                }
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* points fly up on completion */}
        <AnimatePresence>
          {burst && !reduce && (
            <motion.span
              initial={{ y: 0, opacity: 0, scale: 0.8 }}
              animate={{ y: -34, opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-positive"
            >
              +{task.points} ⭐
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium leading-snug",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.detail && (
          <p className="mt-0.5 text-sm text-muted-foreground">{task.detail}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PointsBadge points={task.points} />
          {recur && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground">
              <Repeat className="size-3" />
              {recur}
            </span>
          )}
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              {prettyDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {showAssignee && (
        <Avatar member={assignee} size="sm" className="mt-0.5 shrink-0" />
      )}
    </motion.div>
  );
}
