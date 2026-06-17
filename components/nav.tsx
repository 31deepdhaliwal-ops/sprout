"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { NewTaskButton } from "@/components/new-task";
import { APP_NAME } from "@/lib/config";
import { useMe, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/calendar", label: "Schedule" },
  { href: "/app/family", label: "Family" },
  { href: "/app/rewards", label: "Rewards" },
];

function UserMenu() {
  const { household, logout } = useStore();
  const me = useMe();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = () => {
    setOpen(false);
    logout();
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm shadow-soft"
      >
        <Avatar member={me} size="sm" />
        <span className="font-medium">{me.name}</span>
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
          <div className="absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-border bg-card p-1.5 shadow-soft-lg">
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar member={me} size="md" showEmoji />
              <div className="min-w-0">
                <p className="truncate font-medium">{me.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {household?.name}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <LogOut className="size-4" /> Log out / switch user
            </button>
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
          <UserMenu />
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
