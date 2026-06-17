"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/mascot";
import { useStore } from "@/lib/store";

/**
 * Guards everything under /app. Sends you to /setup if no household exists yet,
 * or to /login if a household exists but nobody's signed in. Children only
 * render once someone is authenticated, so they can safely use `useMe()`.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { hydrated, household, currentMember } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!household) router.replace("/setup");
    else if (!currentMember) router.replace("/");
  }, [hydrated, household, currentMember, router]);

  if (!hydrated || !household || !currentMember) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Mascot state="calm" size={72} className="animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
