"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "./RiskBadge";
import { useInvoices } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { formatDate, formatINR } from "@/lib/format";
import type { EnrichedInvoice } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const rank: Record<string, number> = { red: 0, yellow: 1, green: 2 };

export function FlaggedInvoices() {
  const { data, isLoading, isError } = useInvoices();
  const { select, sentIds } = useDashboardState();

  const flagged: EnrichedInvoice[] = (data?.invoices ?? [])
    .filter((i) => i.risk !== "green" && !sentIds.has(i.id))
    .sort((a, b) => rank[a.risk] - rank[b.risk] || b.amount - a.amount);

  return (
    <Card className="sm:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Flagged invoices</h3>
        <span className="text-caption text-muted">
          {flagged.length} need attention
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-black/[0.03]" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-body text-error">Couldn&apos;t load invoices.</p>
      )}

      {!isLoading && !isError && flagged.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 className="text-success" size={28} />
          <p className="mt-2 text-body font-medium text-ink">All caught up</p>
          <p className="text-caption text-muted">
            No flagged invoices right now.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {flagged.map((inv, i) => (
          <motion.button
            key={inv.id}
            onClick={() => select(inv.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="group flex w-full items-center gap-4 rounded-2xl border border-transparent p-3 text-left transition hover:border-border hover:bg-black/[0.015]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-olive/10 text-caption font-semibold text-olive">
              {initials(inv.client)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-body font-medium text-ink">
                  {inv.client}
                </span>
                <span className="text-caption text-muted">· {inv.id}</span>
              </div>
              <p className="truncate text-caption text-muted">
                {inv.aiReason ?? `Due ${formatDate(inv.dueDate)}`}
              </p>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-body font-semibold text-ink">
                {formatINR(inv.amount)}
              </p>
              <p className="text-caption text-muted">
                due {formatDate(inv.dueDate)}
              </p>
            </div>

            <RiskBadge risk={inv.risk} />

            <span className="hidden items-center gap-1 text-caption font-medium text-olive opacity-0 transition group-hover:opacity-100 lg:inline-flex">
              Draft <ArrowRight size={14} />
            </span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
