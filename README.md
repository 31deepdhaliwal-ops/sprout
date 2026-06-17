# Sprout — the family task game

Chores, but make it a game everyone wants to play. A parent hands out tasks to the
whole family — partner, kids, even Nani — each task is worth **points**, and those
points turn into **rewards, pocket money, streaks and a family leaderboard**. Less
nagging, more "what can I do next?".

> **It runs with zero setup.** `npm run dev` → <http://localhost:3000>. Everything
> works on local demo data — no accounts, no keys. See [`SETUP.md`](./SETUP.md) for
> how to swap the local store for a real shared backend later.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** · **Tailwind v4**
- **Motion** for spring micro-interactions (the check-off burst, the mascot) · **lucide-react** icons
- **date-fns** for date formatting · **nanoid** for ids
- Local store today (React + `localStorage` + a profile switcher); **Convex / Clerk** drop in later

## Quick start

```bash
npm run dev
```

- `/` — landing
- `/app` — your dashboard: today's tasks, points, streak, level, **badges**, reminders, the parent **approval queue**, leaderboard peek
- `/app/calendar` — the **schedule**: open tasks grouped by overdue / today / this week, with overdue flagged
- `/app/family` — the family leaderboard (week / all-time), everyone's open tasks + earned badges
- `/app/rewards` — the rewards shop, cash-out, and parent hand-over / pay-out queues

**Earning loop:** a parent assigns a task (optionally "needs my approval"). The
assignee checks it off → if approval is on it waits in the parent's **To approve**
queue; once approved the points land, the streak ticks, and any new **badge**
unlocks with a little celebration. Overdue and due-today work surfaces as reminders.

Use the **profile switcher** (top-right) to view the app as any family member — it
simulates "everyone on their own phone". Only **parents** can create/assign tasks and
manage rewards.

## How the core ideas map to code

| Idea | File |
|---|---|
| Domain model (members, tasks, rewards, redemptions) | `lib/types.ts` |
| Seed family + rewards + app config | `lib/config.ts` |
| Points, levels, streaks, leaderboard, recurrence, due-date buckets | `lib/scoring.ts` |
| Badges / achievements (defs + earned detection) | `lib/badges.ts` |
| Live local store — tasks, **approval flow**, badge unlocks (swap for Convex) | `lib/store.tsx` |
| The mascot, avatars, task rows, **badges + toast**, **reminders**, new-task modal | `components/` |
| The schedule view | `app/app/calendar/page.tsx` |
| Design tokens (OKLCH palette, fonts, grain) | `app/globals.css` |
