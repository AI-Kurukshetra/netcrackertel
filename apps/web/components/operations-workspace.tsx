"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Layers3, RefreshCw, Search } from "lucide-react";

type GenericResponse = {
  data: Array<Record<string, unknown>>;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function startCase(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

async function getResource(endpoint: string, search: string) {
  const response = await fetch(`/api/${endpoint}?page=1&pageSize=24&search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error(`Failed to load ${endpoint}`);
  return response.json() as Promise<GenericResponse>;
}

export function OperationsWorkspace({
  endpoint,
  title,
  description
}: {
  endpoint: string;
  title: string;
  description: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useQuery({
    queryKey: ["resource-workspace", endpoint, deferredSearch],
    queryFn: () => getResource(endpoint, deferredSearch)
  });

  const rows = query.data?.data ?? [];
  const selected = rows.find((row) => String(row.id) === selectedId) ?? rows[0];

  const summary = useMemo(() => {
    const statusCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    for (const row of rows) {
      const statusValue = row.status ?? row.fulfillmentState ?? row.severity ?? row.metric;
      if (typeof statusValue === "string") {
        statusCounts.set(statusValue, (statusCounts.get(statusValue) ?? 0) + 1);
      }

      const categoryValue = row.category ?? row.family ?? row.channel ?? row.technology;
      if (typeof categoryValue === "string") {
        categoryCounts.set(categoryValue, (categoryCounts.get(categoryValue) ?? 0) + 1);
      }
    }

    return {
      total: query.data?.total ?? rows.length,
      primaryStatus: Array.from(statusCounts.entries()).sort((a, b) => b[1] - a[1])[0],
      primaryCategory: Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]
    };
  }, [query.data?.total, rows]);

  const headers = Object.keys(rows[0] ?? {}).filter((key) => !["tenantId", "createdAt", "updatedAt", "deletedAt"].includes(key)).slice(0, 5);
  const detailEntries = Object.entries(selected ?? {}).filter(([, value]) => value !== undefined);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Operations workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-3xl text-muted">{description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Records</p>
              <p className="mt-3 text-3xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Primary status</p>
              <p className="mt-3 text-xl font-semibold capitalize">{summary.primaryStatus ? startCase(summary.primaryStatus[0]) : "N/A"}</p>
              <p className="mt-1 text-sm text-muted">{summary.primaryStatus?.[1] ?? 0} records</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Primary category</p>
              <p className="mt-3 text-xl font-semibold capitalize">{summary.primaryCategory ? startCase(summary.primaryCategory[0]) : "N/A"}</p>
              <p className="mt-1 text-sm text-muted">{summary.primaryCategory?.[1] ?? 0} records</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Operator controls</p>
              <h2 className="text-2xl font-semibold">Explore live records</h2>
            </div>
            <button className="action-secondary px-4 py-3" onClick={() => query.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="field-control pl-11" placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-cyan-500" />
                <p className="font-semibold">Current selection</p>
              </div>
              <p className="mt-3 text-sm text-muted">
                Select any row below to inspect detailed fields. This workspace is backed by the live API route for the module.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Records</p>
              <h2 className="text-2xl font-semibold">Operational data</h2>
            </div>
            <p className="text-sm text-muted">Showing {rows.length} of {query.data?.total ?? 0}</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="pb-3 font-medium">
                      {startCase(header)}
                    </th>
                  ))}
                  <th className="pb-3 font-medium">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="py-10 text-center text-muted">
                      Loading {title.toLowerCase()}...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="py-10 text-center text-muted">
                      No records match the current search.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={String(row.id)} className="border-t border-slate-200/70 transition hover:bg-slate-100/60 dark:border-white/10 dark:hover:bg-white/5">
                      {headers.map((header) => (
                        <td key={header} className="py-4 pr-4">
                          {formatValue(row[header])}
                        </td>
                      ))}
                      <td className="py-4">
                        <button className="action-secondary px-3 py-2 text-sm" onClick={() => setSelectedId(String(row.id))}>
                          Open
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm text-muted">Record detail</p>
          <h2 className="mt-1 text-2xl font-semibold">{selected ? formatValue(selected.name ?? selected.id) : "No selection"}</h2>
          <div className="mt-5 space-y-3">
            {detailEntries.length ? (
              detailEntries.slice(0, 14).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-white/50 px-4 py-3 dark:bg-white/5">
                  <p className="text-sm text-muted">{startCase(key)}</p>
                  <p className="max-w-[60%] text-right text-sm font-medium">{formatValue(value)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Select a record to inspect its fields.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
