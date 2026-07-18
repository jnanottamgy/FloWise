"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function MoneyInCard() {
  const { unpaid } = useOverview();
  const { select, sentIds } = useDashboardState();

  const rows = unpaid
    .filter((i) => !sentIds.has(i.id))
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.amount - a.amount);
  const total = rows.reduce((s, i) => s + i.amount, 0);

  return (
    <Card id="sec-in" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-section font-semibold text-ink">Money coming in</h3>
          <p className="text-caption text-muted">Customers who owe you money</p>
        </div>
        <span className="rounded-pill bg-success/10 px-3 py-1 text-caption font-semibold text-success">
          {formatINR(total)}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="text-success" size={26} />
          <p className="mt-2 text-body font-medium text-ink">Everyone has paid</p>
          <p className="text-caption text-muted">No pending collections right now.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/10 text-caption font-semibold text-success">
                {initials(inv.client)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">{inv.client}</p>
                <p
                  className={cn(
                    "text-caption",
                    inv.overdue ? "text-error" : "text-muted",
                  )}
                >
                  {formatINR(inv.amount)} ·{" "}
                  {inv.overdue
                    ? `${Math.abs(inv.daysToDue)} days overdue`
                    : `due in ${inv.daysToDue} day${inv.daysToDue === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                onClick={() => select(inv.id)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-olive px-4 py-2 text-caption font-semibold text-white transition hover:bg-olive-dark"
              >
                <MessageCircle size={14} /> Remind
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
