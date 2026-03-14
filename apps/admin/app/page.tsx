import { getDataset } from "@telecosync/database";
import { surfaceClass } from "@telecosync/ui";

export default function AdminApp() {
  const dataset = getDataset();

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <section className={`${surfaceClass} mx-auto max-w-5xl p-10`}>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">TelecoSync Admin</p>
        <h1 className="mt-4 text-4xl font-semibold">Tenant control plane</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Administrative companion app for tenant governance, rollout planning, and operational oversight.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Tenants</p>
            <p className="mt-2 text-3xl font-semibold">{dataset.tenants.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Users</p>
            <p className="mt-2 text-3xl font-semibold">{dataset.users.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Documents</p>
            <p className="mt-2 text-3xl font-semibold">{dataset.documents.length}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
