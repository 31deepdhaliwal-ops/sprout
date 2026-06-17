import type { Member, Task } from "./types";

export const POINTS_PER_LEVEL = 100;

export function memberById(
  members: Member[],
  id: string | null | undefined,
): Member | undefined {
  if (!id) return undefined;
  return members.find((m) => m.id === id);
}

/* ---------- dates ---------- */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function yesterdayISO(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return toISODate(d);
}

/** Whole days from today until an ISO date (negative = in the past). */
export function daysUntil(dueISO: string, now: Date = new Date()): number {
  const due = new Date(`${dueISO}T00:00:00`).getTime();
  const today = new Date(`${toISODate(now)}T00:00:00`).getTime();
  return Math.round((due - today) / 86_400_000);
}

export type DueBucket = "overdue" | "today" | "tomorrow" | "soon" | "later";

/** Group a due date into a human bucket for the schedule view + reminders. */
export function dueBucket(dueISO: string, now: Date = new Date()): DueBucket {
  const d = daysUntil(dueISO, now);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d <= 7) return "soon";
  return "later";
}

/** Monday-based start of week. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const offset = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - offset);
  return x;
}

/* ---------- levels ---------- */

export interface LevelInfo {
  level: number;
  into: number; // points into the current level
  toNext: number; // points needed per level
  pct: number; // 0–100 progress to next level
}

export function levelFor(lifetimePoints: number): LevelInfo {
  const level = Math.floor(lifetimePoints / POINTS_PER_LEVEL) + 1;
  const into = lifetimePoints % POINTS_PER_LEVEL;
  return { level, into, toNext: POINTS_PER_LEVEL, pct: (into / POINTS_PER_LEVEL) * 100 };
}

/* ---------- leaderboard ---------- */

export function weeklyPoints(
  tasks: Task[],
  memberId: string,
  now: Date = new Date(),
): number {
  const weekStart = startOfWeek(now).getTime();
  return tasks
    .filter(
      (t) =>
        t.assigneeId === memberId &&
        t.status === "done" &&
        t.completedAt &&
        new Date(t.completedAt).getTime() >= weekStart,
    )
    .reduce((s, t) => s + t.points, 0);
}

/** How many tasks this member has actually completed (points awarded). */
export function completedCount(tasks: Task[], memberId: string): number {
  return tasks.filter((t) => t.assigneeId === memberId && t.status === "done")
    .length;
}

export interface LeaderRow {
  member: Member;
  week: number;
  lifetime: number;
}

export function leaderboard(
  members: Member[],
  tasks: Task[],
  now: Date = new Date(),
): LeaderRow[] {
  return members
    .map((m) => ({
      member: m,
      week: weeklyPoints(tasks, m.id, now),
      lifetime: m.lifetimePoints,
    }))
    .sort((a, b) => b.lifetime - a.lifetime);
}

/* ---------- recurrence ---------- */

/** Should a completed recurring task flip back to "todo" for a new period? */
export function shouldResetRecurring(task: Task, now: Date = new Date()): boolean {
  if (!task.recurrence || task.status !== "done" || !task.completedAt) return false;
  const done = new Date(task.completedAt);
  if (task.recurrence.type === "daily") {
    return toISODate(done) !== toISODate(now);
  }
  // weekly
  return startOfWeek(done).getTime() < startOfWeek(now).getTime();
}

/* ---------- streaks ---------- */

/** New streak value after a completion today, given the member's last active date. */
export function nextStreak(member: Member, now: Date = new Date()): number {
  const today = todayISO(now);
  if (member.lastActiveDate === today) return member.streakDays; // already counted today
  if (member.lastActiveDate === yesterdayISO(now)) return member.streakDays + 1;
  return 1; // streak broken or first ever
}
