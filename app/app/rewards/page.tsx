"use client";

import { useState } from "react";
import { Check, Coins, Gift, Plus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { memberById } from "@/lib/scoring";
import { useMe, useStore } from "@/lib/store";

export default function Rewards() {
  const {
    rewards,
    redemptions,
    members,
    settings,
    redeemReward,
    cashOut,
    addReward,
    removeReward,
    markFulfilled,
    markPaid,
  } = useStore();
  const currentMember = useMe();

  const isParent = currentMember.role === "parent";
  const money = Math.floor(currentMember.points / settings.pointsPerCurrencyUnit);
  const [flash, setFlash] = useState<string | null>(null);

  const redeem = (id: string) => {
    const ok = redeemReward(id, currentMember.id);
    setFlash(
      ok
        ? "Redeemed! 🎉 Ask a parent to hand it over."
        : "Not enough points yet — keep going!",
    );
    window.setTimeout(() => setFlash(null), 2400);
  };

  const pending = redemptions.filter((r) => !r.fulfilled);
  const owed = members.filter((m) => m.moneyOwed > 0);

  return (
    <div className="space-y-6">
      {/* balance */}
      <Card className="flex flex-wrap items-center gap-4 p-6">
        <Avatar member={currentMember} size="lg" showEmoji />
        <div>
          <p className="text-sm text-muted-foreground">
            {currentMember.name}&apos;s points
          </p>
          <p className="font-display text-3xl text-accent">
            {currentMember.points} ⭐
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">Cash value</p>
          <p className="font-display text-2xl tabular-nums">
            {settings.currency}
            {money}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-1"
            disabled={money < 1}
            onClick={() => cashOut(currentMember.id)}
          >
            <Coins className="size-4" /> Cash out
          </Button>
        </div>
      </Card>

      {flash && (
        <div className="rounded-2xl bg-primary/12 px-4 py-2.5 text-sm font-medium text-primary">
          {flash}
        </div>
      )}

      {/* shop */}
      <section>
        <h2 className="px-1 font-display text-xl">Rewards shop</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => {
            const afford = currentMember.points >= r.cost;
            return (
              <Card key={r.id} className="flex flex-col p-4">
                <div className="text-4xl">{r.emoji}</div>
                <p className="mt-2 font-medium">{r.name}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {r.cost} points
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" disabled={!afford} onClick={() => redeem(r.id)}>
                    {afford ? "Redeem" : "Locked"}
                  </Button>
                  {isParent && (
                    <button
                      onClick={() => removeReward(r.id)}
                      className="ml-auto text-muted-foreground transition hover:text-destructive"
                      aria-label="Remove reward"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* parent management */}
      {isParent && (
        <>
          <AddReward
            onAdd={(r) => {
              addReward(r);
              setFlash("Reward added to the shop.");
              window.setTimeout(() => setFlash(null), 2000);
            }}
          />
          <section className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Gift className="size-4 text-accent" /> To hand over
              </h3>
              {pending.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nothing pending.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {pending.map((p) => {
                    const m = memberById(members, p.memberId);
                    return (
                      <li key={p.id} className="flex items-center gap-2 text-sm">
                        <span className="text-xl">{p.rewardEmoji}</span>
                        <span>
                          <span className="font-medium">{m?.name}</span> ·{" "}
                          {p.rewardName}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="ml-auto"
                          onClick={() => markFulfilled(p.id)}
                        >
                          <Check className="size-4" /> Done
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Coins className="size-4 text-accent" /> To pay out
              </h3>
              {owed.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No pay-outs due.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {owed.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm">
                      <Avatar member={m} size="sm" />
                      <span className="font-medium">{m.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {settings.currency}
                        {m.moneyOwed}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="ml-auto"
                        onClick={() => markPaid(m.id)}
                      >
                        Mark paid
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function AddReward({
  onAdd,
}: {
  onAdd: (r: { name: string; emoji: string; cost: number }) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [cost, setCost] = useState(20);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), emoji: emoji || "🎁", cost });
    setName("");
    setEmoji("🎁");
    setCost(20);
  };

  return (
    <Card className="p-4">
      <h3 className="font-display text-lg">Add a reward</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          aria-label="Emoji"
          className="w-14 rounded-xl border border-input bg-background px-3 py-2 text-center text-lg outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Reward name"
          className="min-w-40 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          min={1}
          value={cost}
          onChange={(e) => setCost(Math.max(1, Number(e.target.value) || 1))}
          aria-label="Cost in points"
          className="w-24 rounded-xl border border-input bg-background px-3 py-2 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
        />
        <Button size="sm" onClick={submit}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </Card>
  );
}
