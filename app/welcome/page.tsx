import Link from "next/link";
import { ArrowRight, Gift, ListChecks, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DemoButton } from "@/components/demo-button";
import { Mascot } from "@/components/mascot";
import { APP_NAME } from "@/lib/config";

const STEPS = [
  {
    icon: Send,
    title: "Assign it",
    body: "A parent creates a task and sends it to anyone — partner, kid, or helper. One-off or repeating.",
  },
  {
    icon: ListChecks,
    title: "Do it",
    body: "It lands on their own screen. They tap it done — points are awarded instantly, no nagging.",
  },
  {
    icon: Gift,
    title: "Earn rewards",
    body: "Points become real rewards, pocket money, streaks and a family leaderboard everyone wants to top.",
  },
];

export default function Welcome() {
  return (
    <div className="relative z-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Mascot state="balanced" size={36} />
          <span className="font-display text-xl">{APP_NAME}</span>
        </div>
        <Link href="/">
          <Button variant="secondary" size="sm">
            Log in
          </Button>
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 pb-10 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-sm font-medium text-primary">
            For the whole family
          </span>
          <h1 className="mt-5 text-balance font-display text-5xl leading-[1.05] md:text-6xl">
            Chores, but make it a game{" "}
            <span className="text-primary">everyone wants to play.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Hand out tasks to your partner and kids, watch them get done, and let
            points turn into rewards, pocket money, and bragging rights — all in one
            calm app.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/setup">
              <Button size="lg">
                Create your household <ArrowRight className="size-4" />
              </Button>
            </Link>
            <DemoButton variant="ghost" size="lg">
              Try the demo family
            </DemoButton>
          </div>
        </div>

        <div className="relative">
          <Card className="ml-auto flex aspect-square max-w-sm items-center justify-center bg-gradient-to-br from-card to-muted shadow-soft-lg">
            <Mascot state="celebrate" size={210} />
          </Card>
          <Card className="absolute -bottom-4 -left-2 px-4 py-3 shadow-soft-lg">
            <p className="text-xs text-muted-foreground">Top of the board</p>
            <p className="font-display text-lg">🦊 Aanya · 240 pts</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="font-display text-2xl">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <s.icon className="size-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <Card className="bg-accent/8 p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl leading-tight">
              Less nagging. More{" "}
              <span className="text-accent">&ldquo;what can I do next?&rdquo;</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              When effort turns into points, rewards and streaks, kids chase the
              next task instead of dodging it — and the household runs itself a
              little more.
            </p>
            <Link href="/setup" className="mt-6 inline-block">
              <Button>
                Start playing <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Card>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {APP_NAME} — a calmer, more fun way to run a family. Built with Next.js.
        </p>
      </section>
    </div>
  );
}
