"use client";

import { ArrowUpRight, Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/labels";

const FRIENDLY: Record<string, string> = {
  rent: "Shop rent",
  salaries: "Staff salaries",
  labour: "Daily labour",
  software: "App subscriptions",
  utilities: "Electricity & bills",
  tax: "GST / tax",
  materials: "Stock / supplies",
};

export function MoneyOutCard() {
  const { metrics: m } = useOverview();

  const bills = (m?.recurring ?? [])
    .filter((r) => r.scope === "business")
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  const total = bills.reduce((s, r) => s + r.monthlyAmount, 0);

  return (
    <Card id="sec-out" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-section font-semibold text-ink">Money going out</h3>
          <p className="text-caption text-muted">Bills you pay every month</p>
        </div>
        <span className="rounded-pill bg-black/[0.04] px-3 py-1 text-caption font-semibold text-ink">
          {formatINR(total)}/mo
        </span>
      </div>

      {bills.length === 0 ? (
        <p className="py-8 text-center text-caption text-muted">
          No regular bills detected yet.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {bills.map((r) => (
            <div
              key={r.counterparty}
              className="flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.04] text-muted">
                <ArrowUpRight size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">
                  {FRIENDLY[r.category] ?? r.counterparty}
                </p>
                <p className="flex items-center gap-1 text-caption text-muted">
                  <Repeat size={12} /> {categoryLabel(r.category)} · every month
                </p>
              </div>
              <span className="shrink-0 text-body font-semibold text-ink">
                {formatINR(r.monthlyAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
