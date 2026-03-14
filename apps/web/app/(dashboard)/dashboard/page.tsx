import { getDashboardSnapshot } from "@telecosync/services";
import { MetricCard } from "@/components/metric-card";
import { DataTable } from "@/components/data-table";
import { NetworkChart, RevenueChart } from "@/components/chart-card";

export default function DashboardPage() {
  const snapshot = getDashboardSnapshot();

  return (
    <div className="space-y-6">
      <section className="card-surface grid gap-6 overflow-hidden rounded-[2rem] p-6 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Executive overview</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Premium telecom operating system for customer, revenue, and network control.
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Local demo mode is active with seeded multi-tenant telecom data. Supabase production schema, RLS, auth, storage, and edge assets are included in the repository.
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-coral/10 p-5">
          <p className="text-sm text-muted">Workflow success</p>
          <p className="mt-3 text-5xl font-semibold">94.1%</p>
          <p className="mt-3 text-sm text-muted">Across onboarding, provisioning, dunning, and remediation automations.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { ...snapshot.kpis[0], href: "/billing" },
          { ...snapshot.kpis[1], href: "/analytics" },
          { ...snapshot.kpis[2], href: "/orders" },
          { ...snapshot.kpis[3], href: "/faults" }
        ].map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <RevenueChart data={snapshot.revenueSeries} />
        <NetworkChart data={snapshot.networkSeries} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DataTable title="Recent orders" subtitle="Order orchestration" rows={snapshot.recentOrders as Array<object>} />
        <DataTable title="Active alarms" subtitle="Fault management" rows={snapshot.activeAlarms as Array<object>} />
      </section>
    </div>
  );
}
