"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  series: number[];
  chart: "bar" | "area";
  highlight?: boolean;
}

function MiniChart({
  series,
  chart,
  highlight,
}: {
  series: number[];
  chart: "bar" | "area";
  highlight?: boolean;
}) {
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

export function MetricCard({
  title,
  value,
  format,
  icon: Icon,
  series,
  chart,
  highlight,
}: MetricCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Card
        className={cn(
          "flex items-center justify-between gap-3 p-5",
          highlight && "border-transparent bg-olive text-white",
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                highlight ? "bg-white/15 text-white" : "bg-olive/10 text-olive",
              )}
            >
              <Icon size={16} strokeWidth={2} />
            </span>
            <span
              className={cn(
                "truncate text-caption",
                highlight ? "text-white/80" : "text-muted",
              )}
            >
              {title}
            </span>
          </div>
          <div
            className={cn(
              "mt-3 text-[26px] font-bold leading-none tracking-tight",
              highlight ? "text-white" : "text-ink",
            )}
          >
            <CountUp value={value} format={format} />
          </div>
        </div>
        <div className="h-12 w-20 shrink-0">
          <MiniChart series={series} chart={chart} highlight={highlight} />
        </div>
      </Card>
    </motion.div>
  );
}
