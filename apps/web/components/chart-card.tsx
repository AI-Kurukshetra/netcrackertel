"use client";

import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="card-surface rounded-[2rem] p-5">
      <div className="mb-4">
        <p className="text-sm text-muted">Revenue analytics</p>
        <h3 className="mt-1 text-xl font-semibold">Monthly recognized revenue</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#revenueGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function NetworkChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="card-surface rounded-[2rem] p-5">
      <div className="mb-4">
        <p className="text-sm text-muted">Network analytics</p>
        <h3 className="mt-1 text-xl font-semibold">Capacity distribution</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={65} outerRadius={95} paddingAngle={2} fill="#f97316" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
