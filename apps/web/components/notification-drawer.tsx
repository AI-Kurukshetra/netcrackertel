"use client";

import { useDashboardQuery } from "@/hooks/use-dashboard-query";

export function NotificationDrawer({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open?: boolean) => void;
}) {
  const query = useDashboardQuery();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/40" onClick={() => onOpenChange(false)}>
      <aside
        className="card-surface absolute right-0 top-0 h-full w-full max-w-md rounded-none rounded-l-[2rem] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Notifications</h3>
          <button className="text-sm text-muted" onClick={() => onOpenChange(false)}>
            Close
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {query.data?.notifications?.map((item: { id: string; title: string; category: string; channel: string }) => (
            <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted">
                {item.category} • {item.channel}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
