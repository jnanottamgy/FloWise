"use client";

import { Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/labels";
import type { MoneyMetrics } from "@/lib/types";

export function LeakRadarCard({ metrics: m }: { metrics: MoneyMetrics }) {
  const pctOfOut =
    m.moneyOut > 0 ? Math.round((m.recurringMonthlyTotal / m.moneyOut) * 100) : 0;

  return (
    <Card className="flex flex-col sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Leak radar</h3>
        <span className="rounded-pill bg-warning/15 px-2.5 py-1 text-caption font-medium text-warning">
          {m.recurring.length} recurring
        </span>
      </div>
      <p className="mt-1 text-caption text-muted">Quiet monthly bleed</p>

      <p className="mt-3 text-section font-bold text-ink">
        {formatINR(m.recurringMonthlyTotal)}
        <span className="text-caption font-medium text-muted"> /month</span>
      </p>
      <p className="text-caption text-muted">≈ {pctOfOut}% of your outflow</p>

      <ul className="mt-3 flex-1 space-y-2">
        {m.recurring.slice(0, 5).map((r) => (
          <li key={r.counterparty} className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/[0.04] text-muted">
              <Repeat size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-caption font-medium text-ink">
                {r.counterparty}
              </p>
              <p className="text-[11px] text-muted">{categoryLabel(r.category)}</p>
            </div>
            <span className="shrink-0 text-caption font-semibold text-ink">
              {formatINR(r.monthlyAmount)}
            </span>
          </li>
        ))}
        {m.recurring.length === 0 && (
          <li className="text-caption text-muted">No recurring expenses found yet.</li>
        )}
      </ul>

      {m.recurring.length > 0 && (
        <p className="mt-3 text-caption text-muted">
          These repeat every month — worth a quick review.
        </p>
      )}
    </Card>
  );
}
