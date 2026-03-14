"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PauseCircle, PlayCircle, PlusCircle, Workflow } from "lucide-react";

type WorkflowRecord = {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "paused";
  successRate: number;
  updatedAt: string;
};

type WorkflowResponse = {
  data: WorkflowRecord[];
  total: number;
};

async function getWorkflows() {
  const response = await fetch("/api/workflows?page=1&pageSize=24");
  if (!response.ok) throw new Error("Failed to load workflows");
  return response.json() as Promise<WorkflowResponse>;
}

async function mutateWorkflow(payload: Record<string, string>) {
  const response = await fetch("/api/workflows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Workflow action failed");
  return result;
}

export function WorkflowsWorkspace() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    trigger: "customer.created"
  });
  const [lastAction, setLastAction] = useState<string>("");

  const workflowsQuery = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflows
  });

  const mutation = useMutation({
    mutationFn: mutateWorkflow,
    onSuccess: (result) => {
      setLastAction(result.message ?? "Workflow updated");
      if (result.workflow?.name && result.workflow?.trigger) {
        setForm({ name: "", trigger: "customer.created" });
      }
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const workflows = workflowsQuery.data?.data ?? [];
  const activeCount = workflows.filter((item) => item.status === "active").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Workflow automation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Automate onboarding, activation, and operational remediation.</h1>
          <p className="mt-3 max-w-3xl text-muted">
            Workflows are now actionable. Operators can create automation playbooks, pause or resume them, and execute active playbooks from the workspace.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Total workflows</p>
              <p className="mt-3 text-3xl font-semibold">{workflowsQuery.data?.total ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Active</p>
              <p className="mt-3 text-3xl font-semibold">{activeCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Last action</p>
              <p className="mt-3 text-base font-semibold">{lastAction || "No recent workflow action"}</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-500">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Create workflow</p>
              <h2 className="text-xl font-semibold">New automation</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <input className="field-control" placeholder="Workflow name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <select className="field-control" value={form.trigger} onChange={(event) => setForm({ ...form, trigger: event.target.value })}>
              <option value="customer.created">customer.created</option>
              <option value="order.created">order.created</option>
              <option value="service.approved">service.approved</option>
              <option value="alarm.opened">alarm.opened</option>
              <option value="invoice.overdue">invoice.overdue</option>
              <option value="workorder.created">workorder.created</option>
            </select>
            <button
              className="action-primary px-4 py-3 text-base"
              onClick={() => mutation.mutate({ action: "create", ...form })}
              disabled={mutation.isPending || !form.name}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Create workflow
            </button>
            {mutation.isError ? <p className="text-sm text-rose-500">{mutation.error.message}</p> : null}
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Automation catalog</p>
            <h2 className="mt-1 text-2xl font-semibold">Active playbooks</h2>
          </div>
          <button className="action-secondary px-4 py-3 text-sm" onClick={() => workflowsQuery.refetch()}>
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => (
            <article key={workflow.id} className="rounded-[1.75rem] border border-white/10 bg-white/60 p-5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-500">{workflow.trigger}</p>
                  <h3 className="mt-2 text-xl font-semibold">{workflow.name}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${workflow.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                  {workflow.status}
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold">{workflow.successRate.toFixed(1)}%</p>
              <p className="mt-1 text-sm text-muted">success rate</p>
              <p className="mt-4 text-xs text-muted">Updated {new Date(workflow.updatedAt).toLocaleString()}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="action-secondary px-4 py-2 text-sm"
                  onClick={() =>
                    mutation.mutate({
                      action: "toggle",
                      workflowId: workflow.id,
                      status: workflow.status === "active" ? "paused" : "active"
                    })
                  }
                  disabled={mutation.isPending}
                >
                  <PauseCircle className="h-4 w-4" />
                  {workflow.status === "active" ? "Pause" : "Resume"}
                </button>
                <button
                  className="action-primary px-4 py-2 text-sm"
                  onClick={() => mutation.mutate({ action: "run", workflowId: workflow.id })}
                  disabled={mutation.isPending || workflow.status !== "active"}
                >
                  <PlayCircle className="h-4 w-4" />
                  Run now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
