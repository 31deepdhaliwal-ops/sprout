"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useStore } from "@/lib/store";

/** Loads the demo family into the store, then drops you straight into the app. */
export function DemoButton({ children, ...props }: ButtonProps) {
  const { loadDemo } = useStore();
  const router = useRouter();
  return (
    <Button
      {...props}
      onClick={() => {
        loadDemo();
        router.push("/app");
      }}
    >
      {children}
    </Button>
  );
}
