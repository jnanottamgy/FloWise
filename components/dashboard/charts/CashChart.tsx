"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { formatINR } from "@/lib/format";
import type { MonthlyPoint } from "@/lib/types";

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 text-caption shadow-card">
      <div className="mb-1 font-semibold text-ink">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-medium text-ink">
            {formatINR(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// Lazy-loaded (next/dynamic) so Recharts stays out of the initial bundle.
export default function CashChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5F786A" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#5F786A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#777777", fontSize: 12 }}
          dy={6}
        />
        <YAxis hide domain={[0, "dataMax + 20000"]} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0,0,0,0.1)" }} />
        <Area
          type="monotone"
          dataKey="collected"
          name="Collected"
          stroke="#5F786A"
          strokeWidth={2.5}
          fill="url(#collectedFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="outstanding"
          name="Outstanding"
          stroke="#A7B6A8"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
