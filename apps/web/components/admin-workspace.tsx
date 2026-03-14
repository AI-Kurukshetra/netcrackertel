"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, UserCog, UsersRound } from "lucide-react";

type UsersResponse = {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    title: string;
  }>;
};

async function getUsers() {
  const response = await fetch("/api/admin/users");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "Unable to load users");
  return payload as UsersResponse;
}

async function createUser(payload: Record<string, string>) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Unable to create user");
  return result;
}

export function AdminWorkspace() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Support Agent",
    title: ""
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "Support Agent",
        title: ""
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Administration</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Manage platform users and RBAC access.</h1>
          <p className="mt-3 max-w-3xl text-muted">
            Admins can provision users, assign roles, and let them log in with their own credentials.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Total users</p>
              <p className="mt-3 text-3xl font-semibold">{usersQuery.data?.users.length ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Roles</p>
              <p className="mt-3 text-3xl font-semibold">6</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Login model</p>
              <p className="mt-3 text-xl font-semibold">Cookie session</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-500">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Create user</p>
              <h2 className="text-xl font-semibold">Add role-based access</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <input className="field-control" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input className="field-control" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="field-control" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <select className="field-control" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option>Admin</option>
                <option>Network Engineer</option>
                <option>Support Agent</option>
                <option>Billing Manager</option>
                <option>Product Manager</option>
                <option>Field Technician</option>
              </select>
              <input className="field-control" placeholder="Job title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </div>
            <button className="action-primary px-4 py-3 text-base" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name || !form.email || !form.password || !form.title}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Create user
            </button>
            {mutation.isError ? <p className="text-sm text-rose-500">{mutation.error.message}</p> : null}
            {mutation.isSuccess ? <p className="text-sm text-emerald-500">User created. They can log in from the login page.</p> : null}
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[2rem] p-6">
        <div className="flex items-center gap-3">
          <UsersRound className="h-5 w-5 text-cyan-500" />
          <div>
            <p className="text-sm text-muted">Access roster</p>
            <h2 className="text-2xl font-semibold">Active platform users</h2>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Title</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.users.map((user) => (
                <tr key={user.id} className="border-t border-slate-200/70 dark:border-white/10">
                  <td className="py-4 font-medium">{user.name}</td>
                  <td className="py-4 text-muted">{user.email}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-white/10">{user.role}</span>
                  </td>
                  <td className="py-4 text-muted">{user.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
