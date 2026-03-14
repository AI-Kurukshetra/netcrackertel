"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/metric-card";

type AnalyticsResponse = {
  summary: {
    revenueLeakageRisk: string;
    churnRiskCustomers: number;
    networkCapacityHotspots: number;
    overdueInvoices: number;
  };
  signals: Array<{
    model: string;
    score: number;
    recommendation: string;
  }>;
  generatedAt: string;
  executiveInsights: string[];
};

type GeneratedInsight = {
  title: string;
  detail: string;
  confidence: number;
};

async function getAnalytics() {
  const response = await fetch("/api/analytics");
  if (!response.ok) throw new Error("Failed to load analytics");
  return response.json() as Promise<AnalyticsResponse>;
}

async function generateInsights() {
  const response = await fetch("/api/analytics", { method: "POST" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Failed to generate insights");
  return result as Promise<{ generatedAt: string; insights: GeneratedInsight[] }>;
}

export function AnalyticsWorkspace() {
  const analyticsQuery = useQuery({
    queryKey: ["analytics-workspace"],
    queryFn: getAnalytics
  });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const generateMutation = useMutation({
    mutationFn: generateInsights
  });

  const summary = analyticsQuery.data?.summary;
  const signals = analyticsQuery.data?.signals ?? [];
  const selectedSignal = signals.find((signal) => signal.model === selectedModel) ?? signals[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Revenue and operations analytics</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Assurance, forecasting, and AI recommendations</h1>
          <p className="mt-3 max-w-3xl text-muted leading-relaxed">
            Generate fresh insights from seeded telecom operations and inspect machine-guided recommendations across billing, churn, capacity, and service assurance.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Revenue leakage risk" value={summary?.revenueLeakageRisk ?? "..."} delta="-0.4%" />
            <MetricCard label="Churn-risk customers" value={String(summary?.churnRiskCustomers ?? "...")} delta="+2.1%" />
            <MetricCard label="Capacity hotspots" value={String(summary?.networkCapacityHotspots ?? "...")} delta="+1.8%" />
            <MetricCard label="Overdue invoices" value={String(summary?.overdueInvoices ?? "...")} delta="-6.3%" />
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-500">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Insight generation</p>
              <h2 className="text-xl font-semibold">Generate executive insight pack</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">Click the action below to generate a fresh set of commercial and operational insights.</p>
          <button className="action-primary mt-5 px-4 py-3 text-base" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate insights
          </button>
          {generateMutation.data ? (
            <div className="mt-5 space-y-3">
              {generateMutation.data.insights.map((insight) => (
                <div key={insight.title} className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                  <p className="font-semibold">{insight.title}</p>
                  <p className="mt-2 text-sm text-muted">{insight.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-cyan-500">{Math.round(insight.confidence * 100)}% confidence</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {signals.map((signal) => (
            <button
              key={signal.model}
              onClick={() => setSelectedModel(signal.model)}
              className="card-surface rounded-[2rem] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-500">{signal.model}</p>
              <p className="mt-4 text-4xl font-semibold">{Math.round(signal.score * 100)}%</p>
              <p className="mt-4 text-muted leading-relaxed">{signal.recommendation}</p>
            </button>
          ))}
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm text-muted">Selected insight</p>
          <h2 className="mt-1 text-2xl font-semibold">{selectedSignal?.model ?? "No model selected"}</h2>
          <p className="mt-4 text-muted leading-relaxed">{selectedSignal?.recommendation ?? "Choose an insight card to inspect it."}</p>
          <div className="mt-6 space-y-3">
            {(analyticsQuery.data?.executiveInsights ?? []).map((insight) => (
              <div key={insight} className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
                <p className="text-sm text-muted">{insight}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-muted">
            Last baseline refresh {analyticsQuery.data ? new Date(analyticsQuery.data.generatedAt).toLocaleString() : "loading"}
          </p>
        </div>
      </section>
    </div>
  );
}
