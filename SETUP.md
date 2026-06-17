# Sprout — setup & go-live guide

This app **runs right now with zero accounts** — open it and everything works on
local demo data. This guide explains how it's wired and how to flip on a real,
shared backend when you're ready.

---

## 1. Run it locally (already works)

```bash
npm run dev
```

Open <http://localhost:3000>. The landing page is at `/`, the app at `/app`.

- Family, tasks, points, rewards and redemptions are stored in your browser
  (localStorage, key `sprout.v1`) and update live.
- A **profile switcher** (top-right) lets you act as any family member, simulating
  "everyone on their own phone". Only **parents** can create tasks and manage rewards.
- Recurring tasks (daily / weekly) automatically roll back to "to-do" when their
  period passes. Completing a task awards points, bumps your level, and extends your
  streak. **Reset demo** (bottom of the dashboard) restores the seed data.

## 2. How it fits together

```
app/
  page.tsx              landing page
  app/layout.tsx        wraps the app in <StoreProvider> + the nav
  app/page.tsx          dashboard — your tasks, points, streak, level
  app/family/page.tsx   leaderboard (week / all-time) + everyone's open tasks
  app/rewards/page.tsx  rewards shop, cash-out, parent hand-over & pay-out queues
lib/
  types.ts              domain model (Member, Task, Reward, Redemption, Settings)
  config.ts             app name, currency, point options, the seed family
  scoring.ts            points, levels, streaks, leaderboard, recurrence logic
  store.tsx             the live local store (React + localStorage) — swap for Convex
  utils.ts              cn() + number formatting
components/             design-system kit (button, card, badge, modal, avatar,
                        mascot, count-up, nav, task-item, new-task)
app/globals.css         design tokens (OKLCH palette, fonts, soft shadows, grain)
```

## 3. Go live, one piece at a time

Everything below is **optional**. The store is the single seam — every mutation the
UI needs already lives in `lib/store.tsx` as a named action, so swapping the backend
is mostly re-pointing those functions.

| Piece | Service | What it replaces | Notes |
|---|---|---|---|
| **Shared database + realtime sync** | [Convex](https://convex.dev) | `lib/store.tsx` (localStorage) | The keystone — every family member's device sees tasks/points update live. Move `lib/types.ts` into a Convex schema and port each store action (`createTask`, `toggleTask`, `redeemReward`, `cashOut`, …) to a mutation/query. |
| **Login + the family unit** | [Clerk](https://clerk.com) | the hard-coded `SEED_MEMBERS` + profile switcher | Use **Organizations** as the household; each member is a user with a `parent`/`kid`/`helper` role. Tie the data to the org id. |
| **Notifications** | [Resend](https://resend.com) + React Email (or web push) | — | "You've got a new task", "reward redeemed — please hand it over", streak nudges. |
| **Payments** (if it becomes a paid app) | [Polar](https://polar.sh) / Stripe / Lemon Squeezy | — | Merchant-of-record options handle global VAT. A family subscription in the low-$/mo or annual band fits this kind of app. |

> Pricing and free-tier details for these services change often — check each vendor's
> current pricing page before you commit.

## 4. Suggested build order (riskiest first)

1. **Convex schema + the live, multi-device family store.** This is the heart of the
   product — prove that two phones stay in sync before polishing anything else.
2. **Clerk** login + the household/family unit + role-based permissions.
3. **Notifications** (Resend / web push) for new tasks, redemptions and streaks.
4. Polish pass: empty states, onboarding for a brand-new family, share/invite flow.
5. Payments + landing-page conversion, once a few real families are hooked.
