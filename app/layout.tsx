import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Display = Fraunces (soft, optical), Body/UI = Manrope. Deliberately not Inter/Geist.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sprout — the family task game",
  description:
    "Assign tasks to your partner and kids, complete them for points, and turn those points into rewards, pocket money, streaks and a family leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-dvh antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
