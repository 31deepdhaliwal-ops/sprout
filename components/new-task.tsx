"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { POINT_OPTIONS } from "@/lib/config";
import { useMe, useStore } from "@/lib/store";
import type { Recurrence } from "@/lib/types";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";
type Repeat = "none" | "daily" | "weekly";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function NewTaskButton({
  label = "New task",
  variant = "primary",
  size = "md",
  className,
}: {
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { members, createTask } = useStore();
  const me = useMe();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? "");
  const [points, setPoints] = useState(10);
  const [due, setDue] = useState("");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [weekday, setWeekday] = useState(1);

  // Only parents can create/assign tasks.
  if (me.role !== "parent") return null;

  const resetForm = () => {
    setTitle("");
    setDetail("");
    setAssigneeId(members[0]?.id ?? "");
    setPoints(10);
    setDue("");
    setRepeat("none");
    setWeekday(1);
  };

  const submit = () => {
    if (!title.trim() || !assigneeId) return;
    const recurrence: Recurrence | null =
      repeat === "daily"
        ? { type: "daily" }
        : repeat === "weekly"
          ? { type: "weekly", weekday }
          : null;
    createTask({
      title,
      detail: detail || undefined,
      points,
      assigneeId,
      dueDate: due || null,
      recurrence,
    });
    resetForm();
    setOpen(false);
  };

  const field =
    "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" /> {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Send a task">
        <div className="space-y-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className={field}
          />
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Add a note (optional)"
            className={field}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium">Send to</p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAssigneeId(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm transition",
                    assigneeId === m.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Avatar member={m} size="sm" />
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">Worth</p>
            <div className="flex flex-wrap gap-2">
              {POINT_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPoints(p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm tabular-nums transition",
                    points === p
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  ⭐ {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Due (optional)</span>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Repeat</span>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as Repeat)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">One-off</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
              </select>
            </label>
            {repeat === "weekly" && (
              <label className="text-sm">
                <span className="mb-1.5 block font-medium">On</span>
                <select
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {WEEKDAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={!title.trim()}>
              Send task
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
