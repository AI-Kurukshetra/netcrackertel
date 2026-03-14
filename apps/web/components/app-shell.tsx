"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Command, LogOut, MoonStar, Search, SunMedium } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@telecosync/ui";
import { navigation } from "@/lib/navigation";
import { canAccessResource } from "@/lib/rbac";
import { CommandPalette } from "@/components/command-palette";
import { NotificationDrawer } from "@/components/notification-drawer";
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import { useSessionQuery } from "@/hooks/use-session-query";
import { useUiStore } from "@/store/ui-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { paletteOpen, togglePalette, notificationOpen, toggleNotification, setTheme, theme } = useUiStore();
  const dashboardQuery = useDashboardQuery();
  const sessionQuery = useSessionQuery();
  const currentRole = sessionQuery.isSuccess ? sessionQuery.data?.user?.role : "Admin";
  const visibleNavigation = navigation.filter((item) => canAccessResource(currentRole, item.resource));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card-surface hidden rounded-[2rem] p-4 lg:flex lg:flex-col">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-400/25 to-transparent p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">TelecoSync</p>
            <h1 className="mt-3 text-2xl font-semibold">Enterprise OSS/BSS</h1>
            <p className="mt-2 text-sm text-muted">API-first telecom operations suite with demo-ready seeded data.</p>
          </div>
          <nav className="mt-6 space-y-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition border border-transparent",
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.22)] dark:bg-cyan-300/20 dark:text-slate-50 dark:border-cyan-200/30"
                      : "text-muted hover:bg-white/60 hover:text-slate-950 dark:hover:bg-white/5 dark:hover:text-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Realtime posture</p>
            <p className="mt-3 text-3xl font-semibold">{dashboardQuery.data?.kpis?.[3]?.value ?? "8"}</p>
            <p className="mt-1 text-sm text-slate-300">critical alarms currently tracked</p>
          </div>
        </aside>
        <div className="card-surface rounded-[2rem] p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">Operations cockpit</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">TelecoSync control plane</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {sessionQuery.data?.user ? (
                <div className="hidden rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/5 md:block">
                  <span className="font-semibold">{sessionQuery.data.user.name}</span>
                  <span className="ml-2 text-muted">{sessionQuery.data.user.role}</span>
                </div>
              ) : null}
              <button
                onClick={() => togglePalette(true)}
                className="action-secondary rounded-full px-4 py-2 text-sm"
              >
                <Search className="h-4 w-4" />
                Quick search
                <span className="rounded-full border border-current px-2 py-0.5 text-[11px]">
                  <Command className="mr-1 inline h-3 w-3" />K
                </span>
              </button>
              <button
                onClick={() => toggleNotification(true)}
                className="action-secondary rounded-full p-2.5 text-muted transition hover:border-coral hover:text-coral"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="action-secondary rounded-full p-2.5 text-muted transition hover:border-cyan-400 hover:text-cyan-500"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>
              <button onClick={logout} className="action-secondary rounded-full px-4 py-2 text-sm">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {visibleNavigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                    active ? "bg-cyan-400 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.22)]" : "bg-white/70 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={togglePalette} />
      <NotificationDrawer open={notificationOpen} onOpenChange={toggleNotification} />
    </div>
  );
}
