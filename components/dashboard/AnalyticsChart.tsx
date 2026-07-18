"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ChevronDown } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import type { Metrics } from "@/lib/types";

type RangeKey = "Week" | "Month" | "Year";
const RANGE_WINDOW: Record<RangeKey, number> = { Week: 2, Month: 3, Year: 12 };

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 text-caption shadow-card">
      <div className="mb-1 font-semibold text-ink">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-medium text-ink">
            {formatINR(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatPill({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.025] px-4 py-3">
      <p className="text-caption text-muted">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-section font-bold text-ink">{value}</span>
        <span
          className={cn(
            "text-caption font-medium",
            positive ? "text-success" : "text-error",
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

export function AnalyticsChart({ metrics }: { metrics: Metrics }) {
  const [range, setRange] = useState<RangeKey>("Year");
  const [open, setOpen] = useState(false);

  const data = metrics.monthly.slice(-RANGE_WINDOW[range]);

  return (
    <Card className="sm:col-span-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-section font-semibold text-ink">Cash Flow</h3>
          <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2.5 py-1 text-caption font-medium text-success">
            <BadgeCheck size={14} /> On track
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-caption font-medium text-ink transition hover:bg-black/[0.03]"
          >
            {range} <ChevronDown size={14} className="text-muted" />
          </button>
          <AnimatePresence>
            {open && (
              <>
                <button
                  aria-hidden
                  tabIndex={-1}
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                />
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-card"
                >
                  {(["Week", "Month", "Year"] as RangeKey[]).map((r) => (
                    <li key={r}>
                      <button
                        onClick={() => {
                          setRange(r);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full rounded-xl px-3 py-1.5 text-left text-caption transition hover:bg-black/[0.03]",
                          r === range ? "font-semibold text-olive" : "text-ink",
                        )}
                      >
                        {r}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatPill
          label="Collection rate"
          value={`${metrics.collectionRatePct}%`}
          delta="▲ receipts"
          positive
        />
        <StatPill
          label="Outstanding"
          value={formatINR(metrics.outstanding)}
          delta="▼ to collect"
        />
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5F786A" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#5F786A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="4 4"
            />
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
      </div>
    </Card>
  );
}
