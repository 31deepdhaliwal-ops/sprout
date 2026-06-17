"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, Check, Clock, Repeat, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Avatar } from "@/components/avatar";
import { Confetti } from "@/components/confetti";
import { Badge, PointsBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dueBucket, memberById } from "@/lib/scoring";
import { useMe, useStore } from "@/lib/store";
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
  const { completeTask, approveTask, rejectTask, members } = useStore();
  const me = useMe();
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);

  const assignee = memberById(members, task.assigneeId);
  const recur = recurrenceLabel(task.recurrence);
  const status = task.status;
  const done = status === "done";
  const pending = status === "pending";

  const isParent = me.role === "parent";
  const isAssignee = me.id === task.assigneeId;
  const needsApproval = task.requiresApproval && assignee?.role !== "parent";
  const overdue = !done && !!task.dueDate && dueBucket(task.dueDate) === "overdue";

  const fireBurst = () => {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 1000);
  };

  const onCircle = () => {
    if (status === "todo") {
      completeTask(task.id);
      if (!needsApproval) fireBurst(); // points land immediately
      return;
    }
    if (done) {
      completeTask(task.id); // undo
      return;
    }
    if (pending && isAssignee) {
      completeTask(task.id); // cancel my own submission
    }
  };

  const onApprove = () => {
    approveTask(task.id);
    fireBurst();
  };

  // The circle is only interactive when this person can act on it.
  const circleActive = status === "todo" || done || (pending && isAssignee);

  return (
    <motion.div
      layout={!reduce}
      className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/60"
    >
      <div className="relative">
        {burst && <Confetti />}
        <button
          type="button"
          onClick={onCircle}
          disabled={!circleActive}
          aria-pressed={done}
          aria-label={
            done
              ? "Mark as not done"
              : pending
                ? "Waiting for approval"
                : "Mark as done"
          }
          className={cn(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
            done && "border-positive bg-positive text-white",
            pending && "border-apricot bg-apricot/40 text-foreground",
            status === "todo" && "border-border hover:border-primary",
            !circleActive && "cursor-default",
          )}
        >
          <AnimatePresence mode="wait">
            {done && (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 16 }
                }
              >
                <Check className="size-4" strokeWidth={3.5} />
              </motion.span>
            )}
            {pending && (
              <motion.span
                key="clock"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Clock className="size-4" strokeWidth={2.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* points fly up when they're actually awarded */}
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
          {pending && (
            <Badge tone="apricot" className="gap-1">
              <Clock className="size-3" /> Waiting for approval
            </Badge>
          )}
          {recur && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground">
              <Repeat className="size-3" />
              {recur}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
                overdue
                  ? "bg-destructive/12 font-medium text-destructive"
                  : "bg-foreground/5 text-muted-foreground",
              )}
            >
              <CalendarDays className="size-3" />
              {overdue ? "Overdue · " : ""}
              {prettyDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* parent sign-off controls */}
        {pending && isParent && (
          <div className="mt-2.5 flex items-center gap-2">
            <Button size="sm" onClick={onApprove}>
              <Check className="size-4" /> Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => rejectTask(task.id)}>
              <X className="size-4" /> Send back
            </Button>
          </div>
        )}
      </div>

      {showAssignee && (
        <Avatar member={assignee} size="sm" className="mt-0.5 shrink-0" />
      )}
    </motion.div>
  );
}
