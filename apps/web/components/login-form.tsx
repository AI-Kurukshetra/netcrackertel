"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useSessionQuery } from "@/hooks/use-session-query";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const sessionQuery = useSessionQuery();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.message ?? "Unable to login");
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="card-surface grid-overlay relative overflow-hidden rounded-[2rem] p-8 md:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">TelecoSync Access</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Secure operator workspace for telecom lifecycle, billing, and network control.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Sign in to manage customers, products, subscriptions, billing, order orchestration, assurance, and AI recommendations.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/70 p-5 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              <p className="font-semibold">Role-based access</p>
            </div>
            <p className="mt-3 text-sm text-muted">Admins can create users and assign RBAC roles. Each user can sign in with their own credentials.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/70 p-5 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-coral" />
              <p className="font-semibold">Secure sign-in</p>
            </div>
            <p className="mt-3 text-sm text-muted">Use your assigned operator account. Administrators can provision additional users from the admin workspace after sign-in.</p>
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[2rem] p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Login</p>
        <h2 className="mt-4 text-3xl font-semibold">Enter the platform</h2>
        <p className="mt-3 text-muted">Use an administrator account or a user created from the admin workspace. Credentials are no longer exposed on screen.</p>
        {sessionQuery.data?.user ? (
          <div className="mt-6 rounded-[1.5rem] border border-cyan-300/30 bg-cyan-400/10 p-5">
            <p className="text-sm text-muted">Active session</p>
            <p className="mt-2 font-semibold">{sessionQuery.data.user.name}</p>
            <p className="mt-1 text-sm text-muted">{sessionQuery.data.user.role}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => router.push("/dashboard")} className="action-primary px-4 py-3 text-sm">
                Continue to dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={handleLogout} className="action-secondary px-4 py-3 text-sm">
                Sign out current session
              </button>
            </div>
          </div>
        ) : null}
        <div className="mt-8 grid gap-4">
          <input className="field-control" placeholder="Work email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="field-control" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button onClick={handleLogin} disabled={loading} className="action-primary px-4 py-3 text-base">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Login to TelecoSync
          </button>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
