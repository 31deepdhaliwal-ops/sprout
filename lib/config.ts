import type { Household, Member, Reward, Settings, Task } from "./types";

export const APP_NAME = "Sprout";

export const SETTINGS: Settings = {
  currency: "₹",
  pointsPerCurrencyUnit: 10, // 10 points = ₹1
};

export const POINT_OPTIONS = [5, 10, 15, 20, 30, 50];

/* A small palette + emoji set offered when the manager adds a new member. */
export const MEMBER_COLORS = [
  "oklch(0.60 0.13 25)",
  "oklch(0.57 0.08 205)",
  "oklch(0.60 0.13 300)",
  "oklch(0.62 0.12 145)",
  "oklch(0.62 0.11 65)",
  "oklch(0.58 0.14 340)",
  "oklch(0.58 0.10 250)",
];

export const MEMBER_EMOJIS = ["🌸", "⭐", "🦊", "🐯", "👵", "🐼", "🦁", "🐸", "🦄", "🐧"];

/*
 * Demo family — loaded with one tap from the setup screen so the app has life
 * before you create your own household. In production members/tasks/points live
 * in Convex. lastActiveDate is null so the first real completion starts a clean
 * streak. PINs are intentionally simple here; they're shown as hints on /login.
 */
export const SEED_HOUSEHOLD: Household = {
  name: "The Sharma Family",
  ownerId: "m_maya",
};

export const SEED_MEMBERS: Member[] = [
  { id: "m_maya", name: "Maya", role: "parent", color: "oklch(0.60 0.13 25)", initials: "M", emoji: "🌸", username: "maya", pin: "1234", points: 60, lifetimePoints: 160, streakDays: 3, lastActiveDate: null, moneyOwed: 0, badges: [] },
  { id: "m_raj", name: "Raj", role: "parent", color: "oklch(0.57 0.08 205)", initials: "R", emoji: "⭐", username: "raj", pin: "1111", points: 40, lifetimePoints: 95, streakDays: 1, lastActiveDate: null, moneyOwed: 0, badges: [] },
  { id: "m_aanya", name: "Aanya", role: "kid", color: "oklch(0.60 0.13 300)", initials: "A", emoji: "🦊", username: "aanya", pin: "2222", points: 75, lifetimePoints: 240, streakDays: 5, lastActiveDate: null, moneyOwed: 0, badges: [] },
  { id: "m_vir", name: "Vir", role: "kid", color: "oklch(0.62 0.12 145)", initials: "V", emoji: "🐯", username: "vir", pin: "3333", points: 25, lifetimePoints: 80, streakDays: 2, lastActiveDate: null, moneyOwed: 0, badges: [] },
  { id: "m_nani", name: "Nani", role: "helper", color: "oklch(0.62 0.11 65)", initials: "N", emoji: "👵", username: "nani", pin: "4444", points: 20, lifetimePoints: 30, streakDays: 0, lastActiveDate: null, moneyOwed: 0, badges: [] },
];

export const SEED_TASKS: Task[] = [
  { id: "t1", title: "Make your bed", points: 5, assigneeId: "m_aanya", createdById: "m_maya", status: "todo", requiresApproval: true, recurrence: { type: "daily" }, dueDate: "2026-06-17", createdAt: "2026-06-12T08:00:00.000Z" },
  { id: "t2", title: "Feed the dog", points: 5, assigneeId: "m_vir", createdById: "m_maya", status: "todo", requiresApproval: true, recurrence: { type: "daily" }, dueDate: "2026-06-17", createdAt: "2026-06-12T08:01:00.000Z" },
  { id: "t3", title: "Homework — 30 minutes", detail: "Maths worksheet, pages 4–5.", points: 10, assigneeId: "m_aanya", createdById: "m_raj", status: "todo", requiresApproval: true, recurrence: null, dueDate: "2026-06-15", createdAt: "2026-06-12T08:02:00.000Z" },
  { id: "t4", title: "Tidy the playroom", points: 15, assigneeId: "m_vir", createdById: "m_maya", status: "pending", requiresApproval: true, recurrence: null, submittedAt: "2026-06-17T07:30:00.000Z", createdAt: "2026-06-12T08:03:00.000Z" },
  { id: "t5", title: "Take out the bins", points: 10, assigneeId: "m_raj", createdById: "m_maya", status: "todo", requiresApproval: false, recurrence: { type: "weekly", weekday: 1 }, createdAt: "2026-06-12T08:04:00.000Z" },
  { id: "t6", title: "Cook dinner tonight", points: 20, assigneeId: "m_maya", createdById: "m_raj", status: "todo", requiresApproval: false, recurrence: null, dueDate: "2026-06-17", createdAt: "2026-06-12T08:05:00.000Z" },
  { id: "t7", title: "Water the plants", points: 5, assigneeId: "m_nani", createdById: "m_maya", status: "todo", requiresApproval: true, recurrence: { type: "weekly", weekday: 3 }, createdAt: "2026-06-12T08:06:00.000Z" },
  { id: "t8", title: "Practice piano", points: 10, assigneeId: "m_aanya", createdById: "m_maya", status: "todo", requiresApproval: true, recurrence: null, dueDate: "2026-06-18", createdAt: "2026-06-12T08:07:00.000Z" },
];

export const SEED_REWARDS: Reward[] = [
  { id: "r1", name: "1 hour screen time", emoji: "🎮", cost: 20, createdById: "m_maya" },
  { id: "r2", name: "Ice cream trip", emoji: "🍦", cost: 30, createdById: "m_maya" },
  { id: "r3", name: "Pick movie night", emoji: "🎬", cost: 40, createdById: "m_maya" },
  { id: "r4", name: "Stay up 30 min late", emoji: "🛌", cost: 25, createdById: "m_maya" },
  { id: "r5", name: "Choose the weekend outing", emoji: "🎡", cost: 60, createdById: "m_maya" },
];
