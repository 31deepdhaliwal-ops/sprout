"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import {
  SEED_HOUSEHOLD,
  SEED_MEMBERS,
  SEED_REWARDS,
  SEED_TASKS,
  SETTINGS,
} from "./config";
import { nextStreak, shouldResetRecurring, todayISO } from "./scoring";
import { badgeStats, earnedBadgeIds } from "./badges";
import type {
  Household,
  Member,
  Recurrence,
  Redemption,
  Reward,
  Role,
  Settings,
  Task,
} from "./types";

/*
 * The live family store. Today this is React state + localStorage; next it
 * becomes Convex (real multi-device sync) with the manager as the account owner
 * and everyone else as members she creates. The shape below maps 1:1 to the
 * planned Convex tables so the swap is mechanical.
 *
 * Auth model (local): the manager creates the household + her own profile, then
 * adds members, each with a username + PIN. Anyone "logs in" by picking their
 * face and entering their PIN. authedMemberId is who's currently signed in.
 */

const STORAGE_KEY = "sprout.v2";

interface Persisted {
  household: Household | null;
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  redemptions: Redemption[];
  authedMemberId: string | null;
}

export interface NewTaskInput {
  title: string;
  detail?: string;
  points: number;
  assigneeId: string;
  dueDate?: string | null;
  recurrence: Recurrence | null;
  requiresApproval: boolean;
}

export interface NewMemberInput {
  name: string;
  role: Role;
  emoji: string;
  color: string;
  username: string;
  pin: string;
}

export interface CreateHouseholdInput {
  householdName: string;
  managerName: string;
  emoji: string;
  color: string;
  username: string;
  pin: string;
}

interface StoreValue {
  household: Household | null;
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  redemptions: Redemption[];
  settings: Settings;
  authedMemberId: string | null;
  currentMember: Member | null;
  isOwner: boolean;
  hydrated: boolean;
  recentBadgeId: string | null; // a badge the signed-in member just unlocked
  dismissBadge: () => void;
  // auth + household
  createHousehold: (input: CreateHouseholdInput) => void;
  loadDemo: () => void;
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  startOver: () => void;
  // members
  addMember: (input: NewMemberInput) => { ok: boolean; error?: string };
  updateMember: (id: string, patch: Partial<NewMemberInput>) => void;
  removeMember: (id: string) => void;
  // tasks + rewards
  createTask: (input: NewTaskInput) => void;
  completeTask: (id: string) => void; // assignee checks it off (-> pending or done)
  approveTask: (id: string) => void; // parent signs off a pending task (-> done)
  rejectTask: (id: string) => void; // parent sends a pending task back (-> todo)
  redeemReward: (rewardId: string, memberId: string) => boolean;
  cashOut: (memberId: string) => void;
  addReward: (r: { name: string; emoji: string; cost: number }) => void;
  removeReward: (id: string) => void;
  markFulfilled: (redemptionId: string) => void;
  markPaid: (memberId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = parts.map((p) => p[0]).join("");
  return (letters || "?").slice(0, 2).toUpperCase();
}

/** Add a member's freshly-earned badge ids to their list. Returns the updated
 * member array plus the ids that are new this time (for the celebration toast). */
function syncBadges(
  members: Member[],
  tasks: Task[],
  memberId: string,
): { members: Member[]; newly: string[] } {
  const i = members.findIndex((m) => m.id === memberId);
  if (i < 0) return { members, newly: [] };
  const member = members[i];
  const earned = earnedBadgeIds(badgeStats(member, members, tasks));
  const have = new Set(member.badges ?? []);
  const newly = earned.filter((id) => !have.has(id));
  if (newly.length === 0) return { members, newly: [] };
  const next = members.slice();
  next[i] = { ...member, badges: [...(member.badges ?? []), ...newly] };
  return { members: next, newly };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Fresh state = no household yet → the app sends you to /setup.
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [authedMemberId, setAuthedMemberId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [recentBadgeId, setRecentBadgeId] = useState<string | null>(null);

  // Load persisted state after mount (keeps first server/client render identical).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        if (p.household) setHousehold(p.household);
        // Backfill fields added in later versions so old saves still load.
        if (p.members)
          setMembers(p.members.map((m) => ({ ...m, badges: m.badges ?? [] })));
        if (p.tasks)
          setTasks(
            p.tasks.map((t) => ({
              ...t,
              status: t.status ?? "todo",
              requiresApproval: t.requiresApproval ?? false,
            })),
          );
        if (p.rewards) setRewards(p.rewards);
        if (p.redemptions) setRedemptions(p.redemptions);
        if (p.authedMemberId) setAuthedMemberId(p.authedMemberId);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Roll recurring tasks back to "todo" when their period has passed.
  useEffect(() => {
    if (!hydrated) return;
    setTasks((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (shouldResetRecurring(t)) {
          changed = true;
          return { ...t, status: "todo" as const, completedAt: null };
        }
        return t;
      });
      return changed ? next : prev;
    });
  }, [hydrated]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const p: Persisted = {
        household,
        members,
        tasks,
        rewards,
        redemptions,
        authedMemberId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore quota errors */
    }
  }, [household, members, tasks, rewards, redemptions, authedMemberId, hydrated]);

  /* ---------- auth + household ---------- */

  const createHousehold = (input: CreateHouseholdInput) => {
    const managerId = nanoid(8);
    const manager: Member = {
      id: managerId,
      name: input.managerName.trim() || "Manager",
      role: "parent",
      color: input.color,
      initials: initials(input.managerName),
      emoji: input.emoji || "🌸",
      username: input.username.trim().toLowerCase(),
      pin: input.pin,
      points: 0,
      lifetimePoints: 0,
      streakDays: 0,
      lastActiveDate: null,
      moneyOwed: 0,
      badges: [],
    };
    setHousehold({ name: input.householdName.trim() || "Our Family", ownerId: managerId });
    setMembers([manager]);
    setTasks([]);
    setRewards([]);
    setRedemptions([]);
    setAuthedMemberId(managerId);
  };

  const loadDemo = () => {
    setHousehold(SEED_HOUSEHOLD);
    setMembers(SEED_MEMBERS);
    setTasks(SEED_TASKS);
    setRewards(SEED_REWARDS);
    setRedemptions([]);
    setAuthedMemberId(SEED_HOUSEHOLD.ownerId);
  };

  const login = (username: string, pin: string): boolean => {
    const u = username.trim().toLowerCase();
    const member = members.find((m) => m.username.toLowerCase() === u && m.pin === pin);
    if (!member) return false;
    setAuthedMemberId(member.id);
    return true;
  };

  const logout = () => setAuthedMemberId(null);

  const startOver = () => {
    setHousehold(null);
    setMembers([]);
    setTasks([]);
    setRewards([]);
    setRedemptions([]);
    setAuthedMemberId(null);
  };

  /* ---------- members (manager only) ---------- */

  const addMember = (input: NewMemberInput): { ok: boolean; error?: string } => {
    const u = input.username.trim().toLowerCase();
    if (!input.name.trim()) return { ok: false, error: "Give them a name." };
    if (!u) return { ok: false, error: "Pick a username." };
    if (members.some((m) => m.username.toLowerCase() === u))
      return { ok: false, error: "That username is taken." };
    if (!/^\d{4}$/.test(input.pin)) return { ok: false, error: "PIN must be 4 digits." };
    const member: Member = {
      id: nanoid(8),
      name: input.name.trim(),
      role: input.role,
      color: input.color,
      initials: initials(input.name),
      emoji: input.emoji || "🙂",
      username: u,
      pin: input.pin,
      points: 0,
      lifetimePoints: 0,
      streakDays: 0,
      lastActiveDate: null,
      moneyOwed: 0,
      badges: [],
    };
    setMembers((prev) => [...prev, member]);
    return { ok: true };
  };

  const updateMember = (id: string, patch: Partial<NewMemberInput>) =>
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,
              username: patch.username
                ? patch.username.trim().toLowerCase()
                : m.username,
              initials: patch.name ? initials(patch.name) : m.initials,
            }
          : m,
      ),
    );

  const removeMember = (id: string) => {
    if (household && id === household.ownerId) return; // never remove the owner
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTasks((prev) => prev.filter((t) => t.assigneeId !== id));
    setRedemptions((prev) => prev.filter((r) => r.memberId !== id));
    setAuthedMemberId((cur) => (cur === id ? null : cur));
  };

  /* ---------- tasks ---------- */

  const createTask = (input: NewTaskInput) => {
    const task: Task = {
      id: nanoid(8),
      title: input.title.trim() || "Untitled task",
      detail: input.detail?.trim() || undefined,
      points: input.points,
      assigneeId: input.assigneeId,
      createdById: authedMemberId ?? input.assigneeId,
      dueDate: input.dueDate ?? null,
      status: "todo",
      requiresApproval: input.requiresApproval,
      submittedAt: null,
      completedAt: null,
      recurrence: input.recurrence,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  /* Award a task's points to its assignee, mark it done, and unlock any badges
   * the win just earned. Used by both direct completion and parent approval. */
  const finalizeDone = (task: Task) => {
    const completedAt = new Date().toISOString();
    const nextTasks = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: "done" as const, submittedAt: null, completedAt }
        : t,
    );
    const awarded = members.map((m) =>
      m.id === task.assigneeId
        ? {
            ...m,
            points: m.points + task.points,
            lifetimePoints: m.lifetimePoints + task.points,
            streakDays: nextStreak(m),
            lastActiveDate: todayISO(),
          }
        : m,
    );
    const { members: synced, newly } = syncBadges(
      awarded,
      nextTasks,
      task.assigneeId,
    );
    setTasks(nextTasks);
    setMembers(synced);
    if (newly.length > 0 && task.assigneeId === authedMemberId) {
      setRecentBadgeId(newly[0]);
    }
  };

  // The assignee checks a task off. If it needs a parent's sign-off (and the
  // assignee isn't a parent) it parks in "pending"; otherwise points land now.
  const completeTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === "done") {
      // Undo a completed task: take the points back, return it to the list.
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "todo" as const, completedAt: null }
            : t,
        ),
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === task.assigneeId
            ? {
                ...m,
                points: Math.max(0, m.points - task.points),
                lifetimePoints: Math.max(0, m.lifetimePoints - task.points),
              }
            : m,
        ),
      );
      return;
    }

    if (task.status === "pending") {
      // Assignee changes their mind before a parent approves — back to todo.
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "todo" as const, submittedAt: null } : t,
        ),
      );
      return;
    }

    // status === "todo"
    const assignee = members.find((m) => m.id === task.assigneeId);
    const needsApproval = task.requiresApproval && assignee?.role !== "parent";
    if (needsApproval) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "pending" as const,
                submittedAt: new Date().toISOString(),
              }
            : t,
        ),
      );
    } else {
      finalizeDone(task);
    }
  };

  const approveTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== "pending") return;
    finalizeDone(task);
  };

  const rejectTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "pending"
          ? { ...t, status: "todo" as const, submittedAt: null }
          : t,
      ),
    );
  };

  /* ---------- rewards ---------- */

  const redeemReward = (rewardId: string, memberId: string): boolean => {
    const reward = rewards.find((r) => r.id === rewardId);
    const member = members.find((m) => m.id === memberId);
    if (!reward || !member || member.points < reward.cost) return false;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, points: m.points - reward.cost } : m,
      ),
    );
    setRedemptions((prev) => [
      {
        id: nanoid(8),
        rewardId,
        rewardName: reward.name,
        rewardEmoji: reward.emoji,
        memberId,
        cost: reward.cost,
        redeemedAt: new Date().toISOString(),
        fulfilled: false,
      },
      ...prev,
    ]);
    return true;
  };

  const cashOut = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const units = Math.floor(m.points / SETTINGS.pointsPerCurrencyUnit);
        if (units <= 0) return m;
        return {
          ...m,
          points: m.points - units * SETTINGS.pointsPerCurrencyUnit,
          moneyOwed: m.moneyOwed + units,
        };
      }),
    );
  };

  const addReward = (r: { name: string; emoji: string; cost: number }) => {
    setRewards((prev) => [
      { id: nanoid(8), createdById: authedMemberId ?? "", ...r },
      ...prev,
    ]);
  };

  const removeReward = (id: string) =>
    setRewards((prev) => prev.filter((r) => r.id !== id));

  const markFulfilled = (redemptionId: string) =>
    setRedemptions((prev) =>
      prev.map((r) => (r.id === redemptionId ? { ...r, fulfilled: true } : r)),
    );

  const markPaid = (memberId: string) =>
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, moneyOwed: 0 } : m)),
    );

  const dismissBadge = () => setRecentBadgeId(null);

  const currentMember = members.find((m) => m.id === authedMemberId) ?? null;
  const isOwner = !!currentMember && !!household && currentMember.id === household.ownerId;

  return (
    <StoreContext.Provider
      value={{
        household,
        members,
        tasks,
        rewards,
        redemptions,
        settings: SETTINGS,
        authedMemberId,
        currentMember,
        isOwner,
        hydrated,
        recentBadgeId,
        dismissBadge,
        createHousehold,
        loadDemo,
        login,
        logout,
        startOver,
        addMember,
        updateMember,
        removeMember,
        createTask,
        completeTask,
        approveTask,
        rejectTask,
        redeemReward,
        cashOut,
        addReward,
        removeReward,
        markFulfilled,
        markPaid,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

/** For screens that only render once someone is signed in (everything under /app). */
export function useMe(): Member {
  const { currentMember } = useStore();
  if (!currentMember) throw new Error("useMe used outside an authenticated screen");
  return currentMember;
}
