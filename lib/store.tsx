"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { SEED_MEMBERS, SEED_REWARDS, SEED_TASKS, SETTINGS } from "./config";
import { nextStreak, shouldResetRecurring, todayISO } from "./scoring";
import type {
  Member,
  Recurrence,
  Redemption,
  Reward,
  Settings,
  Task,
} from "./types";

/*
 * The live family store. In production this is Convex (real multi-device sync) +
 * Clerk (members). Locally we use React state + localStorage and a profile
 * switcher to simulate "everyone on their own phone" — zero accounts.
 */

const STORAGE_KEY = "sprout.v1";

interface Persisted {
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  redemptions: Redemption[];
  currentMemberId: string;
}

export interface NewTaskInput {
  title: string;
  detail?: string;
  points: number;
  assigneeId: string;
  dueDate?: string | null;
  recurrence: Recurrence | null;
}

interface StoreValue {
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  redemptions: Redemption[];
  settings: Settings;
  currentMemberId: string;
  currentMember: Member;
  hydrated: boolean;
  switchProfile: (id: string) => void;
  createTask: (input: NewTaskInput) => void;
  toggleTask: (id: string) => void;
  redeemReward: (rewardId: string, memberId: string) => boolean;
  cashOut: (memberId: string) => void;
  addReward: (r: { name: string; emoji: string; cost: number }) => void;
  removeReward: (id: string) => void;
  markFulfilled: (redemptionId: string) => void;
  markPaid: (memberId: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [rewards, setRewards] = useState<Reward[]>(SEED_REWARDS);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string>(
    SEED_MEMBERS[0].id,
  );
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state after mount (keeps first server/client render identical).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        if (p.members) setMembers(p.members);
        if (p.tasks) setTasks(p.tasks);
        if (p.rewards) setRewards(p.rewards);
        if (p.redemptions) setRedemptions(p.redemptions);
        if (p.currentMemberId) setCurrentMemberId(p.currentMemberId);
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
        members,
        tasks,
        rewards,
        redemptions,
        currentMemberId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore quota errors */
    }
  }, [members, tasks, rewards, redemptions, currentMemberId, hydrated]);

  // Functions are recreated each render so they always see fresh state.
  const switchProfile = (id: string) => setCurrentMemberId(id);

  const createTask = (input: NewTaskInput) => {
    const task: Task = {
      id: nanoid(8),
      title: input.title.trim() || "Untitled task",
      detail: input.detail?.trim() || undefined,
      points: input.points,
      assigneeId: input.assigneeId,
      createdById: currentMemberId,
      dueDate: input.dueDate ?? null,
      status: "todo",
      completedAt: null,
      recurrence: input.recurrence,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === "todo") {
      const completedAt = new Date().toISOString();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "done" as const, completedAt } : t,
        ),
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === task.assigneeId
            ? {
                ...m,
                points: m.points + task.points,
                lifetimePoints: m.lifetimePoints + task.points,
                streakDays: nextStreak(m),
                lastActiveDate: todayISO(),
              }
            : m,
        ),
      );
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "todo" as const, completedAt: null } : t,
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
    }
  };

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
      { id: nanoid(8), createdById: currentMemberId, ...r },
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

  const reset = () => {
    setMembers(SEED_MEMBERS);
    setTasks(SEED_TASKS);
    setRewards(SEED_REWARDS);
    setRedemptions([]);
    setCurrentMemberId(SEED_MEMBERS[0].id);
  };

  const currentMember =
    members.find((m) => m.id === currentMemberId) ?? members[0];

  return (
    <StoreContext.Provider
      value={{
        members,
        tasks,
        rewards,
        redemptions,
        settings: SETTINGS,
        currentMemberId,
        currentMember,
        hydrated,
        switchProfile,
        createTask,
        toggleTask,
        redeemReward,
        cashOut,
        addReward,
        removeReward,
        markFulfilled,
        markPaid,
        reset,
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
