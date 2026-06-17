"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { NewTaskButton } from "@/components/new-task";
import { APP_NAME } from "@/lib/config";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/family", label: "Family" },
  { href: "/app/rewards", label: "Rewards" },
];

function ProfileSwitcher() {
  const { members, currentMember, switchProfile } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm shadow-soft"
      >
        <Avatar member={currentMember} size="sm" />
        <span className="font-medium">{currentMember.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-30 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-soft-lg">
            <p className="px-2 py-1 text-xs text-muted-foreground">
              Viewing as (simulated phone)
            </p>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  switchProfile(m.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition",
                  m.id === currentMember.id
                    ? "bg-primary/12 text-primary"
                    : "hover:bg-muted",
                )}
              >
                <Avatar member={m} size="sm" />
                <span className="font-medium">{m.name}</span>
                <span className="ml-auto text-xs capitalize text-muted-foreground">
                  {m.role}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 pt-3">
        <Link href="/app" className="flex items-center gap-2">
          <Mascot state="balanced" size={32} />
          <span className="font-display text-lg">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-2">
          <NewTaskButton size="sm" label="Task" />
          <ProfileSwitcher />
        </div>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 px-4 py-2">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
