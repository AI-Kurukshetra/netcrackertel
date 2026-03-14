import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function AccessDenied({ title }: { title: string }) {
  return (
    <section className="card-surface rounded-[2rem] p-8 md:p-10">
      <div className="flex max-w-3xl items-start gap-4">
        <div className="rounded-2xl bg-rose-500/12 p-3 text-rose-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Access restricted</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-muted">
            Your current role does not have permission to use this workspace. Sign in with an administrator account or ask an admin to update your RBAC assignment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="action-primary px-5 py-3 text-sm">
              Return to dashboard
            </Link>
            <Link href="/login" className="action-secondary px-5 py-3 text-sm">
              Switch account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
