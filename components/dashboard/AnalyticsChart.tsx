"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import type { Metrics } from "@/lib/types";

const CashChart = dynamic(() => import("./charts/CashChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-black/[0.02]" />,
});

type RangeKey = "Week" | "Month" | "Year";
const RANGE_WINDOW: Record<RangeKey, number> = { Week: 2, Month: 3, Year: 12 };

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
    <Card id="sec-analytics" className="scroll-mt-6 sm:col-span-2">
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
        <CashChart data={data} />
      </div>
    </Card>
  );
}
