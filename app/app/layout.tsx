import { AuthGate } from "@/components/auth-gate";
import { BadgeToast } from "@/components/badges";
import { Nav } from "@/components/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
          {children}
        </main>
        <BadgeToast />
      </div>
    </AuthGate>
  );
}
