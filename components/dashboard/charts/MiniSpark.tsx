"use client";

import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from "recharts";

export interface MiniSparkProps {
  series: number[];
  chart: "bar" | "area";
  highlight?: boolean;
}

// Lazy-loaded (next/dynamic) so Recharts stays out of the initial bundle.
export default function MiniSpark({ series, chart, highlight }: MiniSparkProps) {
  const data = (series.length ? series : [0, 0]).map((v, i) => ({ i, v }));
  const stroke = highlight ? "#FFFFFF" : "#5F786A";
  const gradId = `spark-${highlight ? "hl" : "olive"}`;

  if (chart === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, bottom: 2 }}>
          <Bar dataKey="v" fill={stroke} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, bottom: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={highlight ? 0.5 : 0.25} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
