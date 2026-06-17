"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Login() {
  const { hydrated, household, members, currentMember, login } = useStore();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  // No household → set one up. Already signed in → into the app.
  useEffect(() => {
    if (!hydrated) return;
    if (!household) router.replace("/setup");
    else if (currentMember) router.replace("/app");
  }, [hydrated, household, currentMember, router]);

  const selected = members.find((m) => m.id === selectedId) ?? null;
  // The demo household ships with known PINs — show them as hints there only.
  const isDemo = members.some((m) => m.id === "m_maya");

  const attempt = (value: string) => {
    if (!selected) return;
    if (login(selected.username, value)) {
      router.push("/app");
    } else {
      setError(true);
      setPin("");
    }
  };

  const onPinChange = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 4);
    setPin(v);
    setError(false);
    if (v.length === 4) attempt(v);
  };

  const pick = (id: string) => {
    setSelectedId(id);
    setPin("");
    setError(false);
    setTimeout(() => pinRef.current?.focus(), 50);
  };

  return (
    <div className="relative z-10 mx-auto grid min-h-dvh max-w-md place-items-center px-5 py-10">
      <div className="w-full">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot state="balanced" size={56} />
          <p className="mt-2 text-sm text-muted-foreground">
            {household?.name ?? "Welcome back"}
          </p>
          <h1 className="font-display text-3xl">Who&apos;s this?</h1>
        </div>

        {!selected ? (
          <div className="grid grid-cols-2 gap-3">
            {members.map((m) => (
              <Card
                key={m.id}
                role="button"
                tabIndex={0}
                onClick={() => pick(m.id)}
                onKeyDown={(e) => e.key === "Enter" && pick(m.id)}
                className="flex cursor-pointer flex-col items-center gap-2 p-5 transition hover:bg-muted/60"
              >
                <Avatar member={m} size="xl" showEmoji />
                <div className="text-center">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{m.role}</p>
                  {isDemo && (
                    <p className="mt-1 text-xs tabular-nums text-primary">PIN {m.pin}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-4 p-6">
            <Avatar member={selected} size="xl" showEmoji />
            <p className="font-display text-xl">Hi {selected.name}</p>
            <input
              ref={pinRef}
              value={pin}
              onChange={(e) => onPinChange(e.target.value)}
              inputMode="numeric"
              autoFocus
              placeholder="• • • •"
              className={cn(
                "w-40 rounded-xl border bg-background px-3 py-3 text-center text-2xl tracking-[0.5em] tabular-nums outline-none focus:ring-2 focus:ring-ring",
                error ? "border-destructive" : "border-input",
              )}
            />
            {error && (
              <p className="text-sm font-medium text-destructive">
                Wrong PIN — try again.
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedId(null);
                setPin("");
                setError(false);
              }}
            >
              <ArrowLeft className="size-4" /> Pick someone else
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
