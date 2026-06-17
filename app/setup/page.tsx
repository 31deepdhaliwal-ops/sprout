"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, MEMBER_COLORS, MEMBER_EMOJIS } from "@/lib/config";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Setup() {
  const { hydrated, household, createHousehold, loadDemo } = useStore();
  const router = useRouter();

  const [householdName, setHouseholdName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[0]);
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already set up? Don't show onboarding again.
  useEffect(() => {
    if (hydrated && household) router.replace("/app");
  }, [hydrated, household, router]);

  const field =
    "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  const submit = () => {
    if (!householdName.trim()) return setError("Name your household.");
    if (!managerName.trim()) return setError("Add your name.");
    if (!username.trim()) return setError("Pick a username to sign in with.");
    if (!/^\d{4}$/.test(pin)) return setError("Your PIN must be 4 digits.");
    createHousehold({ householdName, managerName, emoji, color, username, pin });
    router.push("/app");
  };

  const tryDemo = () => {
    loadDemo();
    router.push("/app");
  };

  return (
    <div className="relative z-10 mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-10">
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot state="balanced" size={64} />
          <h1 className="mt-3 font-display text-3xl">Create your {APP_NAME} household</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You&apos;re the manager. Set up the household, then add your partner and
            kids — you&apos;ll hand out tasks and they&apos;ll earn rewards.
          </p>
        </div>

        <Card className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Household name</span>
            <input
              autoFocus
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="The Sharma Family"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Your name</span>
            <input
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Maya"
              className={field}
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Your look</span>
            <div className="flex flex-wrap gap-1.5">
              {MEMBER_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl border text-lg transition",
                    emoji === em ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label="Pick colour"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 ring-offset-card transition",
                    color === c && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="mb-1.5 block text-sm font-medium">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="maya"
                autoCapitalize="none"
                className={field}
              />
            </label>
            <label className="w-28">
              <span className="mb-1.5 block text-sm font-medium">PIN</span>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="4 digits"
                className={cn(field, "tabular-nums tracking-widest")}
              />
            </label>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button className="w-full" onClick={submit}>
            Create household <ArrowRight className="size-4" />
          </Button>
        </Card>

        <div className="mt-5 text-center">
          <button
            onClick={tryDemo}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="size-4" /> Just exploring? Load a demo family
          </button>
          <p className="mt-3">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
