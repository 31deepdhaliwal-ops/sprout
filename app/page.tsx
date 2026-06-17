"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { DemoButton } from "@/components/demo-button";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/lib/config";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Login() {
  const { hydrated, household, members, currentMember, login, startOver } =
    useStore();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  // Already signed in → straight into the app.
  useEffect(() => {
    if (hydrated && currentMember) router.replace("/app");
  }, [hydrated, currentMember, router]);

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
            {household ? household.name : APP_NAME}
          </p>
          <h1 className="font-display text-3xl">
            {selected
              ? `Hi ${selected.name}`
              : members.length > 0
                ? "Who's this?"
                : "Welcome to Sprout"}
          </h1>
        </div>

        {selected ? (
          <Card className="flex flex-col items-center gap-4 p-6">
            <Avatar member={selected} size="xl" showEmoji />
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
        ) : (
          <>
            {members.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {members.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={reduce ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                  >
                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => pick(m.id)}
                      onKeyDown={(e) => e.key === "Enter" && pick(m.id)}
                      className="flex cursor-pointer flex-col items-center gap-2 p-5 transition hover:bg-muted/60"
                    >
                      <Avatar member={m} size="xl" showEmoji />
                      <div className="text-center">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {m.role}
                        </p>
                        {isDemo && (
                          <p className="mt-1 text-xs tabular-nums text-primary">
                            PIN {m.pin}
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No household on this device yet. Create one to get started — you&apos;ll
                  be the manager.
                </p>
              </Card>
            )}

            {/* secondary actions depend on whether a household exists here */}
            {members.length === 0 ? (
              <div className="mt-5 flex flex-col items-center gap-3">
                <Link href="/setup" className="w-full">
                  <Button className="w-full">
                    Create a household <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <DemoButton variant="ghost" size="sm">
                  <Sparkles className="size-4" /> Try the demo family
                </DemoButton>
              </div>
            ) : (
              <div className="mt-5 text-center">
                <button
                  onClick={startOver}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Not your family? Start a new household
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/welcome"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                What&apos;s {APP_NAME}? →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
