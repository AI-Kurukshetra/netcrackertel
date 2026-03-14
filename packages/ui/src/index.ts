import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const surfaceClass =
  "rounded-3xl border border-white/10 bg-slate-950/60 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl";
