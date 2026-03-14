"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Receipt, Search } from "lucide-react";

type BillingRecord = {
  id: string;
  customerId: string;
  customerName: string;
  recipientEmail: string;
  total: number;
  tax: number;
  subtotal: number;
  status: string;
  dueDate: string;
  paymentStatus: string;
  paymentMethod: string;
  emailStatus: string;
  sentAt: string;
  productName: string;
};

type BillingResponse = {
  invoices: BillingRecord[];
  summary: {
    totalInvoices: number;
    issuedInvoices: number;
    overdueInvoices: number;
    cashCollected: number;
  };
};

async function getBilling(search: string) {
  const response = await fetch(`/api/billing?search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error("Failed to load billing workspace");
  return response.json() as Promise<BillingResponse>;
}

export function BillingWorkspace() {
  const [search, setSearch] = useState("");
  const billingQuery = useQuery({
    queryKey: ["billing-workspace", search],
    queryFn: () => getBilling(search)
  });

  const invoices = billingQuery.data?.invoices ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0],
    [invoices, selectedId]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Billing operations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Issue invoices, email customers, and monitor collections.</h1>
          <p className="mt-3 max-w-3xl text-muted">
            Customer onboarding now generates an invoice and records billing email delivery to the customer contact automatically.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Invoices</p>
              <p className="mt-3 text-3xl font-semibold">{billingQuery.data?.summary.totalInvoices ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Issued</p>
              <p className="mt-3 text-3xl font-semibold">{billingQuery.data?.summary.issuedInvoices ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Overdue</p>
              <p className="mt-3 text-3xl font-semibold">{billingQuery.data?.summary.overdueInvoices ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Cash collected</p>
              <p className="mt-3 text-3xl font-semibold">${Math.round((billingQuery.data?.summary.cashCollected ?? 0) / 1000)}K</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Invoice email delivery</p>
              <h2 className="text-xl font-semibold">Customer billing notification</h2>
            </div>
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
            <p className="text-sm text-muted">Latest delivery</p>
            <p className="mt-2 font-semibold">{selected?.recipientEmail ?? "No invoice selected"}</p>
            <p className="mt-2 text-sm text-muted">
              {selected ? `Invoice ${selected.id} for ${selected.customerName} was marked as ${selected.emailStatus} at ${new Date(selected.sentAt).toLocaleString()}.` : "Select an invoice to inspect the delivery trail."}
            </p>
          </div>
          <div className="mt-4 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="field-control pl-11" placeholder="Search invoices or customer email" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-sm text-muted">Invoice register</p>
              <h2 className="text-2xl font-semibold">Issued invoices</h2>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Recipient</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="cursor-pointer border-t border-slate-200/70 transition hover:bg-slate-100/60 dark:border-white/10 dark:hover:bg-white/5" onClick={() => setSelectedId(invoice.id)}>
                    <td className="py-4 font-medium">{invoice.id}</td>
                    <td className="py-4 max-w-[180px] truncate">{invoice.customerName}</td>
                    <td className="py-4 text-muted max-w-[200px] truncate">{invoice.recipientEmail}</td>
                    <td className="py-4 capitalize">{invoice.status}</td>
                    <td className="py-4">${invoice.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm text-muted">Invoice preview</p>
          <h2 className="mt-1 text-2xl font-semibold">{selected?.id ?? "No invoice selected"}</h2>
          {selected ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-5 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">Bill to</p>
                    <p className="mt-1 font-semibold break-words">{selected.customerName}</p>
                    <p className="text-sm text-muted break-words">{selected.recipientEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted">Due date</p>
                    <p className="mt-1 font-semibold">{new Date(selected.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/70 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <p>{selected.productName}</p>
                    <p className="font-semibold">${selected.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
                    <p>Tax</p>
                    <p>${selected.tax.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 font-semibold dark:border-white/10">
                    <p>Total</p>
                    <p>${selected.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-5 dark:bg-white/5">
                <p className="text-sm text-muted">Payment and delivery status</p>
                <p className="mt-2">Payment: <span className="font-semibold capitalize">{selected.paymentStatus}</span> via <span className="font-semibold capitalize">{selected.paymentMethod}</span></p>
                <p className="mt-2">Email: <span className="font-semibold capitalize">{selected.emailStatus}</span></p>
                <p className="mt-2 text-sm text-muted">Sent at {new Date(selected.sentAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Select an invoice to open its preview.</p>
          )}
        </div>
      </section>
    </div>
  );
}
