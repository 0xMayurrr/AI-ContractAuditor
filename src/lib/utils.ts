import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<string, string> = {
  reentrancy: "Reentrancy",
  "tx-origin": "tx.origin",
  "unsafe-external-call": "Unsafe External Call",
  "access-control": "Access Control",
  "integer-overflow": "Integer Overflow",
  "unchecked-low-level-call": "Unchecked Call",
};

export const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  critical: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  low: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  info: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/30",
    dot: "bg-zinc-500",
  },
};
