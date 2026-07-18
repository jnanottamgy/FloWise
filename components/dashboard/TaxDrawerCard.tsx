"use client";

import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/labels";
import type { MoneyMetrics } from "@/lib/types";

export function TaxDrawerCard({ metrics: m }: { metrics: MoneyMetrics }) {
  const total = m.byCategory.reduce((s, c) => s + c.amount, 0);
  const max = m.byCategory.reduce((mx, c) => Math.max(mx, c.amount), 1);

  return (
    <Card className="flex flex-col sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Tax drawer</h3>
        <FileText size={18} className="text-olive" />
      </div>
      <p className="mt-1 text-caption text-muted">Business spend, sorted</p>

      <p className="mt-3 text-section font-bold text-ink">{formatINR(total)}</p>
      <p className="text-caption text-muted">claimable-looking business spend</p>

      <ul className="mt-3 flex-1 space-y-2.5">
        {m.byCategory.slice(0, 6).map((c) => (
          <li key={c.category}>
            <div className="flex items-center justify-between text-caption">
              <span className="text-ink">{categoryLabel(c.category)}</span>
              <span className="font-medium text-ink">{formatINR(c.amount)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
              <div
                className="h-full rounded-full bg-olive/70"
                style={{ width: `${(c.amount / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {m.byCategory.length === 0 && (
          <li className="text-caption text-muted">No business expenses yet.</li>
        )}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Looks like business spend you can show your CA. Not tax advice.
      </p>
    </Card>
  );
}
