import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (later classes win on conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a load-point number with thousands separators (tabular figures in the UI). */
export function formatPoints(n: number): string {
  return Math.round(n).toLocaleString();
}
