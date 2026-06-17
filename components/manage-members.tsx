"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { MEMBER_COLORS, MEMBER_EMOJIS } from "@/lib/config";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "kid", label: "Kid", hint: "Does tasks, earns rewards" },
  { value: "parent", label: "Partner", hint: "Can also assign & manage" },
  { value: "helper", label: "Helper", hint: "e.g. grandparent, nanny" },
];

export function ManageMembers() {
  const { members, household, addMember, removeMember } = useStore();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("kid");
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[2]);
  const [color, setColor] = useState(MEMBER_COLORS[2]);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const field =
    "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  const reset = () => {
    setName("");
    setRole("kid");
    setEmoji(MEMBER_EMOJIS[2]);
    setColor(MEMBER_COLORS[2]);
    setUsername("");
    setPin("");
    setError(null);
  };

  const submit = () => {
    const res = addMember({ name, role, emoji, color, username, pin });
    if (!res.ok) return setError(res.error ?? "Couldn't add member.");
    reset();
    setOpen(false);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Family members</h2>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <UserPlus className="size-4" /> Add member
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        You manage who&apos;s in the household. Each person signs in with their
        username and PIN.
      </p>

      <ul className="mt-4 space-y-2">
        {members.map((m) => {
          const isOwnerRow = m.id === household?.ownerId;
          return (
            <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2">
              <Avatar member={m} size="md" showEmoji />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {m.name}{" "}
                  <span className="text-xs capitalize text-muted-foreground">
                    · {isOwnerRow ? "manager" : m.role}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">@{m.username}</p>
              </div>
              {!isOwnerRow && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="text-muted-foreground transition hover:text-destructive"
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a family member">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aanya"
              className={field}
            />
          </label>

          <div>
            <p className="mb-1.5 text-sm font-medium">Role</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-center transition",
                    role === r.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span className="block text-sm font-medium">{r.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">Look</p>
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
                placeholder="aanya"
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

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit}>
              Add member
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
