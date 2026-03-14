"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Building2, CircleAlert, Loader2, UserPlus } from "lucide-react";

type CustomerResponse = {
  customers: Array<{
    id: string;
    name: string;
    segment: string;
    lifecycleStage: string;
    monthlyRevenue: number;
    supportTier: string;
    city: string;
  }>;
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    channel: string;
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    monthlyCharge: number;
    usageGb: number;
  }>;
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    atRiskCustomers: number;
    totalMrr: number;
  };
};

type ProductResponse = {
  products: Array<{
    id: string;
    name: string;
    family: string;
    basePrice: number;
  }>;
};

async function getCustomers(search: string) {
  const response = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error("Failed to load customers");
  return response.json() as Promise<CustomerResponse>;
}

async function getProducts() {
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Failed to load products");
  return response.json() as Promise<ProductResponse>;
}

async function onboardCustomer(payload: Record<string, string>) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to onboard customer");
  }

  return response.json();
}

export function CustomersWorkspace() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Dallas",
    segment: "business",
    supportTier: "priority",
    productId: ""
  });
  const [lastOnboarding, setLastOnboarding] = useState<null | {
    customer: { id: string; name: string };
    subscription: { id: string; status: string };
    order: { id: string; status: string };
    invoice: { id: string; status: string; total: number };
    payment: { id: string; status: string };
    serviceInstance: { id: string; status: string };
  }>(null);

  const customersQuery = useQuery({
    queryKey: ["customers", deferredSearch],
    queryFn: () => getCustomers(deferredSearch)
  });

  const productsQuery = useQuery({
    queryKey: ["customer-onboarding-products"],
    queryFn: getProducts
  });

  const productOptions = productsQuery.data?.products ?? [];

  useEffect(() => {
    if (!form.productId && productOptions[0]?.id) {
      setForm((current) => ({ ...current, productId: productOptions[0].id }));
    }
  }, [form.productId, productOptions]);

  const mutation = useMutation({
    mutationFn: onboardCustomer,
    onSuccess: (result) => {
      setLastOnboarding(result);
      setForm({
        name: "",
        email: "",
        phone: "",
        city: "Dallas",
        segment: "business",
        supportTier: "priority",
        productId: productOptions[0]?.id ?? ""
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const data = customersQuery.data;

  const canSubmit = Boolean(form.name && form.email && form.phone && form.city && form.productId);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Customer lifecycle</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Onboard subscribers and manage service relationships.</h1>
          <p className="mt-3 max-w-2xl text-muted">
            CRM is now wired for customer onboarding. Creating a customer now activates the selected product, creates the subscription and service instance, completes the order, and issues the first invoice.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Customers</p>
              <p className="mt-3 text-3xl font-semibold">{data?.summary.totalCustomers ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Active</p>
              <p className="mt-3 text-3xl font-semibold">{data?.summary.activeCustomers ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">MRR</p>
              <p className="mt-3 text-3xl font-semibold">${Math.round((data?.summary.totalMrr ?? 0) / 1000)}K</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-500">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">New onboarding</p>
              <h2 className="text-xl font-semibold">Create customer</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <input className="field-control" placeholder="Customer or company name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field-control" placeholder="Contact email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="field-control" placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select className="field-control" value={form.segment} onChange={(event) => setForm({ ...form, segment: event.target.value })}>
                <option value="consumer">Consumer</option>
                <option value="business">Business</option>
                <option value="government">Government</option>
                <option value="iot">IoT</option>
              </select>
              <input className="field-control" placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              <select className="field-control" value={form.supportTier} onChange={(event) => setForm({ ...form, supportTier: event.target.value })}>
                <option value="standard">Standard</option>
                <option value="priority">Priority</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <select className="field-control" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}>
              <option value="">Select product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · ${product.basePrice}
                </option>
              ))}
            </select>
              <button
                onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !canSubmit}
              className="action-primary mt-2 px-4 py-3 text-base"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Onboard customer
            </button>
            {mutation.isError ? <p className="text-sm text-rose-500">{mutation.error.message}</p> : null}
            {mutation.isSuccess ? <p className="text-sm text-emerald-500">Customer onboarded successfully.</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted">Active customer estate</p>
              <h2 className="mt-1 text-2xl font-semibold">Accounts and lifecycle status</h2>
            </div>
            <input
              className="field-control"
              placeholder="Search customer, city, segment"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Segment</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">MRR</th>
                  <th className="pb-3 font-medium">Support</th>
                  <th className="pb-3 font-medium">City</th>
                </tr>
              </thead>
              <tbody>
                {customersQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">
                      Loading customers...
                    </td>
                  </tr>
                ) : (
                  data?.customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-slate-200/70 dark:border-white/10">
                      <td className="py-4 font-medium">{customer.name}</td>
                      <td className="py-4 capitalize text-muted">{customer.segment}</td>
                      <td className="py-4 capitalize">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-white/10">{customer.lifecycleStage.replace("_", " ")}</span>
                      </td>
                      <td className="py-4">${customer.monthlyRevenue.toFixed(2)}</td>
                      <td className="py-4 capitalize text-muted">{customer.supportTier}</td>
                      <td className="py-4 text-muted">{customer.city}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {lastOnboarding ? (
            <div className="card-surface rounded-[2rem] p-6">
              <div className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl font-semibold">Latest onboarding lifecycle</h2>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <p className="text-sm text-muted">{lastOnboarding.customer.name}</p>
                  <p className="mt-2 text-sm font-medium">{lastOnboarding.customer.id}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm text-muted">Subscription</p>
                    <p className="mt-2 font-medium">{lastOnboarding.subscription.id}</p>
                    <p className="mt-1 text-sm text-emerald-500">{lastOnboarding.subscription.status}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm text-muted">Service instance</p>
                    <p className="mt-2 font-medium">{lastOnboarding.serviceInstance.id}</p>
                    <p className="mt-1 text-sm text-emerald-500">{lastOnboarding.serviceInstance.status}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm text-muted">Order</p>
                    <p className="mt-2 font-medium">{lastOnboarding.order.id}</p>
                    <p className="mt-1 text-sm text-emerald-500">{lastOnboarding.order.status}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm text-muted">Invoice</p>
                    <p className="mt-2 font-medium">{lastOnboarding.invoice.id}</p>
                    <p className="mt-1 text-sm text-emerald-500">{lastOnboarding.invoice.status} · ${lastOnboarding.invoice.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <p className="text-sm text-muted">Payment</p>
                  <p className="mt-2 font-medium">{lastOnboarding.payment.id}</p>
                  <p className="mt-1 text-sm text-amber-500">{lastOnboarding.payment.status}</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="card-surface rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-cyan-500" />
              <h2 className="text-xl font-semibold">Recent subscriptions</h2>
            </div>
            <div className="mt-4 space-y-3">
              {data?.subscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{subscription.id}</p>
                    <span className="text-xs uppercase tracking-[0.25em] text-muted">{subscription.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    ${subscription.monthlyCharge.toFixed(2)} MRC · {subscription.usageGb}GB current usage profile
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="card-surface rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <CircleAlert className="h-5 w-5 text-coral" />
              <h2 className="text-xl font-semibold">Recent onboarding orders</h2>
            </div>
            <div className="mt-4 space-y-3">
              {data?.recentOrders.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{order.id}</p>
                    <span className="text-xs uppercase tracking-[0.25em] text-muted">{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {order.channel} channel · ${order.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
