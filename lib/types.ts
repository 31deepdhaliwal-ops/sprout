/* Domain model for the family task & rewards app. */

export type Role = "parent" | "kid" | "helper";

export interface Member {
  id: string;
  name: string;
  role: Role; // "parent" = manager (can create/assign/manage rewards) + player
  color: string; // an OKLCH string used directly as the avatar background
  initials: string;
  emoji: string;
  points: number; // spendable balance
  lifetimePoints: number; // for level + leaderboard (never spent)
  streakDays: number;
  lastActiveDate: string | null; // YYYY-MM-DD of last completion
  moneyOwed: number; // cashed-out points awaiting payout, in currency units
}

export type Recurrence =
  | { type: "daily" }
  | { type: "weekly"; weekday: number }; // 0 = Sun … 6 = Sat

export interface Task {
  id: string;
  title: string;
  detail?: string;
  points: number; // reward value when completed
  assigneeId: string;
  createdById: string;
  dueDate?: string | null; // ISO date
  status: "todo" | "done";
  completedAt?: string | null; // ISO datetime
  recurrence: Recurrence | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  emoji: string;
  cost: number; // in points
  createdById: string;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardEmoji: string;
  memberId: string;
  cost: number;
  redeemedAt: string;
  fulfilled: boolean; // parent has handed it over
}

export interface Settings {
  currency: string; // e.g. "₹"
  pointsPerCurrencyUnit: number; // points needed for 1 unit of currency
}
