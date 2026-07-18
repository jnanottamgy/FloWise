"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { formatINR } from "@/lib/format";
import type { ForecastPoint } from "@/lib/forecast";

function Tip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 text-caption shadow-card">
      <div className="font-semibold text-ink">{label}</div>
      <div className="text-muted">{formatINR(Number(payload[0].value))}</div>
    </div>
  );
}

export default function ForecastChart({
  points,
  threshold,
}: {
  points: ForecastPoint[];
  threshold: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
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
        <YAxis hide domain={[0, "dataMax + 40000"]} />
        <Tooltip content={<Tip />} cursor={{ stroke: "rgba(0,0,0,0.1)" }} />
        <ReferenceLine
          y={threshold}
          stroke="#D06A6A"
          strokeDasharray="5 4"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#5F786A"
          strokeWidth={2.5}
          fill="url(#forecastFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
