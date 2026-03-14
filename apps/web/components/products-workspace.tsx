"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Loader2, Sparkles } from "lucide-react";

type ProductWorkspaceResponse = {
  products: Array<{
    id: string;
    name: string;
    family: string;
    version: string;
    basePrice: number;
    slaTarget: number;
    plan?: {
      downloadMbps: number;
      uploadMbps: number;
      dataLimitGb: number;
    };
    pricingRule?: {
      expression: string;
    };
    promotion?: {
      name: string;
      discountPercent: number;
    };
  }>;
  bundles: Array<{
    id: string;
    name: string;
    price: number;
    products: string[];
  }>;
  summary: {
    totalProducts: number;
    activePromotions: number;
    avgPrice: number;
    catalogVersions: number;
  };
};

async function getProducts(search: string, family: string) {
  const response = await fetch(`/api/products?search=${encodeURIComponent(search)}&family=${encodeURIComponent(family)}`);
  if (!response.ok) throw new Error("Failed to load products");
  return response.json() as Promise<ProductWorkspaceResponse>;
}

async function createProduct(payload: Record<string, string | number>) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to create product");
  }
  return response.json();
}

export function ProductsWorkspace() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState({
    name: "",
    family: "mobile",
    version: "v1.0",
    basePrice: 49,
    slaTarget: 99.9,
    downloadMbps: 150,
    uploadMbps: 50,
    dataLimitGb: 300
  });

  const query = useQuery({
    queryKey: ["products", deferredSearch, family],
    queryFn: () => getProducts(deferredSearch, family)
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setForm({
        name: "",
        family: "mobile",
        version: "v1.0",
        basePrice: 49,
        slaTarget: 99.9,
        downloadMbps: 150,
        uploadMbps: 50,
        dataLimitGb: 300
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const data = query.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Product catalog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Build market-ready telecom offers with pricing, plans, and bundles.</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Catalog now exposes realistic mobile, broadband, IoT, private 5G, and voice offers and supports product creation from the UI.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Products</p>
              <p className="mt-3 text-3xl font-semibold">{data?.summary.totalProducts ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Promotions</p>
              <p className="mt-3 text-3xl font-semibold">{data?.summary.activePromotions ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Avg price</p>
              <p className="mt-3 text-3xl font-semibold">${data?.summary.avgPrice ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/50 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Versions</p>
              <p className="mt-3 text-3xl font-semibold">{data?.summary.catalogVersions ?? "..."}</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-coral/15 p-3 text-coral">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Create offer</p>
              <h2 className="text-xl font-semibold">New telecom product</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <input className="field-control" placeholder="Offer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-3">
              <select className="field-control" value={form.family} onChange={(event) => setForm({ ...form, family: event.target.value })}>
                <option value="mobile">Mobile</option>
                <option value="broadband">Broadband</option>
                <option value="iot">IoT</option>
                <option value="private_5g">Private 5G</option>
                <option value="voice">Voice</option>
              </select>
              <input className="field-control" placeholder="Version" value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} />
              <input className="field-control" type="number" placeholder="Base price" value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: Number(event.target.value) })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field-control" type="number" placeholder="Download Mbps" value={form.downloadMbps} onChange={(event) => setForm({ ...form, downloadMbps: Number(event.target.value) })} />
              <input className="field-control" type="number" placeholder="Upload Mbps" value={form.uploadMbps} onChange={(event) => setForm({ ...form, uploadMbps: Number(event.target.value) })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field-control" type="number" placeholder="Data limit GB" value={form.dataLimitGb} onChange={(event) => setForm({ ...form, dataLimitGb: Number(event.target.value) })} />
              <input className="field-control" type="number" step="0.01" placeholder="SLA target" value={form.slaTarget} onChange={(event) => setForm({ ...form, slaTarget: Number(event.target.value) })} />
            </div>
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="action-primary mt-2 px-4 py-3 text-base"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Boxes className="h-4 w-4" />}
              Create product
            </button>
            {mutation.isError ? <p className="text-sm text-rose-500">{mutation.error.message}</p> : null}
            {mutation.isSuccess ? <p className="text-sm text-emerald-500">Product added to catalog.</p> : null}
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted">Versioned offers</p>
            <h2 className="mt-1 text-2xl font-semibold">Catalog inventory</h2>
          </div>
          <div className="flex gap-3">
            <input className="field-control" placeholder="Search offers" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="field-control" value={family} onChange={(event) => setFamily(event.target.value)}>
              <option value="">All families</option>
              <option value="mobile">Mobile</option>
              <option value="broadband">Broadband</option>
              <option value="iot">IoT</option>
              <option value="private_5g">Private 5G</option>
              <option value="voice">Voice</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.products.map((product) => (
            <article key={product.id} className="rounded-[1.75rem] border border-white/10 bg-white/50 p-5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-500">{product.family.replace("_", " ")}</p>
                  <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-white/10">{product.version}</span>
              </div>
              <p className="mt-4 text-3xl font-semibold">${product.basePrice}</p>
              <p className="mt-1 text-sm text-muted">SLA {product.slaTarget.toFixed(2)}%</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5">
                  <p className="text-muted">Down</p>
                  <p className="mt-1 font-medium">{product.plan?.downloadMbps ?? 0}M</p>
                </div>
                <div className="rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5">
                  <p className="text-muted">Up</p>
                  <p className="mt-1 font-medium">{product.plan?.uploadMbps ?? 0}M</p>
                </div>
                <div className="rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5">
                  <p className="text-muted">Quota</p>
                  <p className="mt-1 font-medium">{product.plan?.dataLimitGb ?? 0}GB</p>
                </div>
              </div>
              {product.promotion ? <p className="mt-4 text-sm text-emerald-500">{product.promotion.name} · {product.promotion.discountPercent}% off</p> : null}
              <p className="mt-2 text-xs text-muted">{product.pricingRule?.expression}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-surface rounded-[2rem] p-6">
        <p className="text-sm text-muted">Converged bundles</p>
        <h2 className="mt-1 text-2xl font-semibold">Commercial packaging</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.bundles.map((bundle) => (
            <article key={bundle.id} className="rounded-[1.75rem] border border-white/10 bg-white/50 p-5 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{bundle.name}</h3>
                <p className="text-lg font-semibold">${bundle.price.toFixed(2)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {bundle.products.map((product) => (
                  <span key={product} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-white/10">
                    {product}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
