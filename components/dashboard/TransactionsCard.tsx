"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardState } from "@/lib/dashboardState";
import { formatDate, formatINR } from "@/lib/format";
import { MODE_LABEL, SCOPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Transaction, TxnScope } from "@/lib/types";

const SCOPE_CLS: Record<TxnScope, string> = {
  business: "bg-olive/10 text-olive",
  personal: "bg-black/[0.05] text-muted",
  unsure: "bg-warning/15 text-warning",
};

type Filter = "all" | "business" | "personal";

export function TransactionsCard({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { setScope } = useDashboardState();

  const rows = [...transactions]
    .filter((t) => filter === "all" || t.scope === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Card id="sec-transactions" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-section font-semibold text-ink">All transactions</h3>
          <p className="text-caption text-muted">
            UPI, bank &amp; cash — {transactions.length} entries
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-pill bg-black/[0.03] p-1">
          {(["all", "business", "personal"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-caption font-medium capitalize transition",
                filter === f ? "bg-card text-ink shadow-soft" : "text-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-caption text-muted">
          No transactions yet — upload a statement or add one to get started.
        </p>
      ) : (
        <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {rows.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-black/[0.015]"
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  t.direction === "in"
                    ? "bg-success/10 text-success"
                    : "bg-black/[0.04] text-muted",
                )}
              >
                {t.direction === "in" ? (
                  <ArrowDownLeft size={16} />
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">
                  {t.counterparty}
                </p>
                <p className="text-caption text-muted">{formatDate(t.date)}</p>
              </div>

              <span className="hidden rounded-pill bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted sm:inline">
                {MODE_LABEL[t.mode]}
              </span>
              {/* tap to switch business / personal */}
              <button
                onClick={() =>
                  setScope(t.id, t.scope === "business" ? "personal" : "business")
                }
                title="Tap to mark business or personal"
                className={cn(
                  "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-medium transition hover:ring-1 hover:ring-black/10",
                  SCOPE_CLS[t.scope],
                )}
              >
                {SCOPE_LABEL[t.scope]}
                <Pencil size={9} className="opacity-50" />
              </button>

              <span
                className={cn(
                  "w-24 shrink-0 text-right text-body font-semibold",
                  t.direction === "in" ? "text-success" : "text-ink",
                )}
              >
                {t.direction === "in" ? "+" : "−"}
                {formatINR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
