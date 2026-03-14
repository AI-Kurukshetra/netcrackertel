"use client";

import Link from "next/link";
import { useEffect } from "react";
import { navigation } from "@/lib/navigation";

export function CommandPalette({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open?: boolean) => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-slate-950/50 p-4 pt-24 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="card-surface w-full max-w-2xl rounded-[2rem] p-4" onClick={(event) => event.stopPropagation()}>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
          Search modules, runbook pages, and operational surfaces
        </div>
        <div className="mt-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-[1.25rem] px-4 py-3 transition hover:bg-cyan-400 hover:text-slate-950"
            >
              <span>{item.label}</span>
              <span className="text-xs uppercase tracking-[0.3em]">Open</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
