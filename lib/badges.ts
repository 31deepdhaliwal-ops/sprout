/*
 * Achievements. Each badge is earned the moment a member's stats cross a
 * threshold — all derived from data we already track (points, streaks,
 * completed tasks, weekly rank), so nothing new has to be recorded except the
 * list of ids a member has unlocked (Member.badges).
 *
 * The store recomputes earned ids after every completion/approval and appends
 * any newly-crossed ones; badges are sticky (never taken away).
 */

import { completedCount, levelFor, weeklyPoints } from "./scoring";
import type { Member, Task } from "./types";

export type BadgeTone = "sage" | "clay" | "apricot" | "positive" | "neutral";

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string; // how you earn it
  tone: BadgeTone;
}

export const BADGES: BadgeDef[] = [
  { id: "first-task", name: "First Sprout", emoji: "🌱", description: "Finish your very first task", tone: "sage" },
  { id: "ten-tasks", name: "Getting It Done", emoji: "✅", description: "Finish 10 tasks", tone: "positive" },
  { id: "fifty-tasks", name: "Unstoppable", emoji: "🚀", description: "Finish 50 tasks", tone: "clay" },
  { id: "streak-3", name: "On a Roll", emoji: "🔥", description: "Keep a 3-day streak", tone: "clay" },
  { id: "streak-7", name: "Week Warrior", emoji: "⚡", description: "Keep a 7-day streak", tone: "apricot" },
  { id: "points-100", name: "Century", emoji: "💯", description: "Earn 100 points in total", tone: "apricot" },
  { id: "points-500", name: "High Roller", emoji: "🏆", description: "Earn 500 points in total", tone: "clay" },
  { id: "level-5", name: "Level 5", emoji: "🌟", description: "Reach level 5", tone: "sage" },
  { id: "mvp", name: "Family MVP", emoji: "👑", description: "Top the leaderboard this week", tone: "apricot" },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

export interface BadgeStats {
  completed: number;
  streakDays: number;
  lifetimePoints: number;
  level: number;
  weeklyRank: number | null; // 1-based; null when the member has no points this week
}

/** Gather everything the badge predicates need for one member. */
export function badgeStats(
  member: Member,
  members: Member[],
  tasks: Task[],
  now: Date = new Date(),
): BadgeStats {
  const mine = weeklyPoints(tasks, member.id, now);
  let weeklyRank: number | null = null;
  if (mine > 0) {
    const ahead = members.filter(
      (m) => m.id !== member.id && weeklyPoints(tasks, m.id, now) > mine,
    ).length;
    weeklyRank = ahead + 1;
  }
  return {
    completed: completedCount(tasks, member.id),
    streakDays: member.streakDays,
    lifetimePoints: member.lifetimePoints,
    level: levelFor(member.lifetimePoints).level,
    weeklyRank,
  };
}

function meets(id: string, s: BadgeStats): boolean {
  switch (id) {
    case "first-task": return s.completed >= 1;
    case "ten-tasks": return s.completed >= 10;
    case "fifty-tasks": return s.completed >= 50;
    case "streak-3": return s.streakDays >= 3;
    case "streak-7": return s.streakDays >= 7;
    case "points-100": return s.lifetimePoints >= 100;
    case "points-500": return s.lifetimePoints >= 500;
    case "level-5": return s.level >= 5;
    case "mvp": return s.weeklyRank === 1;
    default: return false;
  }
}

/** The ids a member currently qualifies for, given fresh stats. */
export function earnedBadgeIds(s: BadgeStats): string[] {
  return BADGES.filter((b) => meets(b.id, s)).map((b) => b.id);
}
