"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardState } from "@/lib/dashboardState";
import { formatINR } from "@/lib/format";
import { MODE_LABEL } from "@/lib/labels";
import type { MoneyMetrics, Transaction } from "@/lib/types";

export function MineVsBusinessCard({
  transactions,
  metrics: m,
}: {
  transactions: Transaction[];
  metrics: MoneyMetrics;
}) {
  const { setScope } = useDashboardState();
  const unsure = [...transactions]
    .filter((t) => t.scope === "unsure")
    .sort((a, b) => b.amount - a.amount);

  const total = m.businessOut + m.personalOut;
  const bizPct = total > 0 ? Math.round((m.businessOut / total) * 100) : 0;

  return (
    <Card id="sec-sort" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Mine vs Business</h3>
        {m.unsureCount === 0 && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2.5 py-1 text-caption font-medium text-success">
            <CheckCircle2 size={14} /> All sorted
          </span>
        )}
      </div>
      <p className="text-caption text-muted">
        Keep business &amp; personal apart — no separate bank account needed
      </p>

      {/* Split bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-caption">
          <span className="font-medium text-olive">
            Business {formatINR(m.businessOut)}
          </span>
          <span className="font-medium text-muted">
            Personal {formatINR(m.personalOut)}
          </span>
        </div>
        <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div className="h-full bg-olive" style={{ width: `${bizPct}%` }} />
          <div className="h-full bg-sage" style={{ width: `${100 - bizPct}%` }} />
        </div>
      </div>

      {/* Sort the unclear ones */}
      {unsure.length > 0 ? (
        <>
          <p className="mb-2 mt-4 text-caption font-semibold uppercase tracking-wide text-muted">
            Sort {unsure.length} unclear
          </p>
          <div className="flex-1 space-y-2">
            {unsure.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-border p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-ink">
                    {t.counterparty}
                  </p>
                  <p className="text-caption text-muted">
                    {formatINR(t.amount)} · {MODE_LABEL[t.mode]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setScope(t.id, "business")}
                    className="inline-flex items-center gap-1 rounded-pill bg-olive/10 px-3 py-1.5 text-caption font-medium text-olive transition hover:bg-olive/20"
                  >
                    <Briefcase size={13} /> Business
                  </button>
                  <button
                    onClick={() => setScope(t.id, "personal")}
                    className="inline-flex items-center gap-1 rounded-pill bg-black/[0.04] px-3 py-1.5 text-caption font-medium text-muted transition hover:bg-black/[0.07]"
                  >
                    <User size={13} /> Personal
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl bg-success/[0.05] py-6 text-center">
          <CheckCircle2 className="text-success" size={26} />
          <p className="mt-2 text-body font-medium text-ink">Everything is sorted</p>
          <p className="text-caption text-muted">
            {bizPct}% of your spend is business.
          </p>
        </div>
      )}
    </Card>
  );
}
