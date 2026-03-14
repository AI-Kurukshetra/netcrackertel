"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, CreditCard, DatabaseZap, Route, Search } from "lucide-react";

type ResourcePayload = {
  data: Array<Record<string, unknown>>;
  total: number;
};

const workspaceConfig = {
  orders: {
    eyebrow: "Order orchestration",
    title: "Capture, fulfil, and monitor commercial orders.",
    description: "Track orchestration state, customer channel, and downstream monetization from newly onboarded services.",
    icon: Route,
    accent: "text-cyan-500"
  },
  billing: {
    eyebrow: "Billing operations",
    title: "Generate invoices and track revenue collection posture.",
    description: "Every customer onboarding now generates an invoice and payment record so finance teams can inspect monetization immediately.",
    icon: CreditCard,
    accent: "text-emerald-500"
  },
  services: {
    eyebrow: "Service lifecycle",
    title: "Inspect activated service instances and subscription state.",
    description: "Provisioned customers now appear as active subscriptions with linked service instances ready for assurance workflows.",
    icon: DatabaseZap,
    accent: "text-violet-500"
  }
} as const;

function startCase(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "N/A";
  return String(value);
}

async function getResource(resource: string, search = "") {
  const response = await fetch(`/api/${resource}?page=1&pageSize=18&search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error(`Failed to load ${resource}`);
  return response.json() as Promise<ResourcePayload>;
}

export function LifecycleWorkspace({ mode }: { mode: "orders" | "billing" | "services" }) {
  const [search, setSearch] = useState("");
  const config = workspaceConfig[mode];
  const Icon = config.icon;

  const ordersQuery = useQuery({
    queryKey: ["orders", search],
    queryFn: () => getResource("orders", search)
  });
  const billingQuery = useQuery({
    queryKey: ["billing", search],
    queryFn: () => getResource("billing", search)
  });
  const servicesQuery = useQuery({
    queryKey: ["services", search],
    queryFn: () => getResource("services", search)
  });

  const activeQuery = mode === "orders" ? ordersQuery : mode === "billing" ? billingQuery : servicesQuery;
  const rows = activeQuery.data?.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((row) => String(row.id) === selectedId) ?? rows[0];

  const summaries = useMemo(() => {
    const orders = ordersQuery.data?.data ?? [];
    const invoices = billingQuery.data?.data ?? [];
    const services = servicesQuery.data?.data ?? [];

    return {
      orders: {
        total: ordersQuery.data?.total ?? orders.length,
        completed: orders.filter((item) => item.status === "completed").length
      },
      billing: {
        total: billingQuery.data?.total ?? invoices.length,
        issued: invoices.filter((item) => item.status === "issued").length
      },
      services: {
        total: servicesQuery.data?.total ?? services.length,
        active: services.filter((item) => item.status === "active").length
      }
    };
  }, [billingQuery.data, ordersQuery.data, servicesQuery.data]);

  const tableFields = {
    orders: ["id", "customerId", "status", "total", "channel"],
    billing: ["id", "customerId", "status", "total", "tax"],
    services: ["id", "subscriptionId", "status", "uptime", "serviceId"]
  }[mode];

  const linkedPanels = [
    {
      title: "Orders",
      value: summaries.orders.total,
      detail: `${summaries.orders.completed} completed`,
      active: mode === "orders"
    },
    {
      title: "Invoices",
      value: summaries.billing.total,
      detail: `${summaries.billing.issued} issued`,
      active: mode === "billing"
    },
    {
      title: "Services",
      value: summaries.services.total,
      detail: `${summaries.services.active} active`,
      active: mode === "services"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className={`text-sm uppercase tracking-[0.35em] ${config.accent}`}>{config.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-muted">{config.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {linkedPanels.map((panel) => (
              <div key={panel.title} className={`rounded-[1.5rem] border p-4 ${panel.active ? "border-cyan-300/60 bg-cyan-400/12" : "border-white/10 bg-white/60 dark:bg-white/5"}`}>
                <p className="text-sm text-muted">{panel.title}</p>
                <p className="mt-3 text-3xl font-semibold">{panel.value}</p>
                <p className="mt-1 text-sm text-muted">{panel.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl bg-white/70 p-3 dark:bg-white/5 ${config.accent}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Lifecycle correlation</p>
              <h2 className="text-2xl font-semibold">Trace fulfilment to revenue</h2>
            </div>
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-transparent p-5">
            <div className="flex items-center gap-3 text-sm font-medium">
              <span>Customer</span>
              <ArrowRightLeft className="h-4 w-4 text-cyan-500" />
              <span>Order</span>
              <ArrowRightLeft className="h-4 w-4 text-cyan-500" />
              <span>Service</span>
              <ArrowRightLeft className="h-4 w-4 text-cyan-500" />
              <span>Invoice</span>
            </div>
            <p className="mt-4 text-sm text-muted">
              New customer onboarding generates synchronized downstream records. Use this workspace to validate that commercial activation, service provisioning, and revenue capture remain aligned.
            </p>
          </div>
          <div className="mt-4 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field-control pl-11"
              placeholder={`Search ${mode}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Operational records</p>
              <h2 className="text-2xl font-semibold">{startCase(mode)}</h2>
            </div>
            <p className="text-sm text-muted">Showing {rows.length} of {activeQuery.data?.total ?? 0}</p>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  {tableFields.map((field) => (
                    <th key={field} className="pb-3 font-medium">{startCase(field)}</th>
                  ))}
                  <th className="pb-3 font-medium">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {activeQuery.isLoading ? (
                  <tr>
                    <td colSpan={tableFields.length + 1} className="py-10 text-center text-muted">Loading {mode}...</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={String(row.id)} className="border-t border-slate-200/70 dark:border-white/10">
                      {tableFields.map((field) => (
                        <td key={field} className="py-4 pr-4">{formatValue(row[field])}</td>
                      ))}
                      <td className="py-4">
                        <button className="action-secondary px-3 py-2 text-sm" onClick={() => setSelectedId(String(row.id))}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface rounded-[2rem] p-6">
            <p className="text-sm text-muted">Selected record</p>
            <h2 className="mt-1 text-2xl font-semibold">{selected ? formatValue(selected.id) : "No selection"}</h2>
            <div className="mt-5 space-y-3">
              {selected ? Object.entries(selected).slice(0, 10).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-white/60 px-4 py-3 dark:bg-white/5">
                  <p className="text-sm text-muted">{startCase(key)}</p>
                  <p className="max-w-[60%] text-right text-sm font-medium">{formatValue(value)}</p>
                </div>
              )) : <p className="text-sm text-muted">No record selected.</p>}
            </div>
          </div>

          <div className="card-surface rounded-[2rem] p-6">
            <p className="text-sm text-muted">Lifecycle health</p>
            <h2 className="mt-1 text-2xl font-semibold">Cross-module posture</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Order completion</p>
                <p className="mt-2 text-xl font-semibold">{summaries.orders.completed} / {summaries.orders.total}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Invoices issued</p>
                <p className="mt-2 text-xl font-semibold">{summaries.billing.issued} / {summaries.billing.total}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">Active services</p>
                <p className="mt-2 text-xl font-semibold">{summaries.services.active} / {summaries.services.total}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
