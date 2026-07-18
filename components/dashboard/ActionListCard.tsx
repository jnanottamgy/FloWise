"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { scrollToSection } from "./Sidebar";
import { cn } from "@/lib/utils";
import type { Action, Urgency } from "@/lib/actions";

const TONE: Record<Urgency, { dot: string; icon: typeof AlertTriangle }> = {
  urgent: { dot: "bg-error", icon: AlertTriangle },
  warning: { dot: "bg-warning", icon: Clock },
  info: { dot: "bg-olive", icon: Wallet },
};

export function ActionListCard() {
  const { actions, isLoading } = useOverview();
  const { select } = useDashboardState();

  function run(a: Action) {
    if ((a.actionType === "collect" || a.actionType === "remind") && a.invoiceId) {
      select(a.invoiceId);
    } else if (a.actionType === "view") {
      scrollToSection("sec-forecast");
    } else if (a.actionType === "pay") {
      scrollToSection("sec-out");
    }
  }

  return (
    <Card id="sec-actions" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Do this today</h3>
        {actions.length > 0 && (
          <span className="rounded-pill bg-olive/10 px-2.5 py-1 text-caption font-medium text-olive">
            {actions.length} to do
          </span>
        )}
      </div>
      <p className="text-caption text-muted">Your top priorities, in order</p>

      {isLoading && (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-black/[0.03]" />
          ))}
        </div>
      )}

      {!isLoading && actions.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 className="text-success" size={30} />
          <p className="mt-2 text-body font-medium text-ink">All done for today</p>
          <p className="text-caption text-muted">Nothing needs your attention right now.</p>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {actions.map((a, i) => {
          const Icon = TONE[a.urgency].icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-white", TONE[a.urgency].dot)}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">{a.title}</p>
                <p className="truncate text-caption text-muted">{a.sub}</p>
              </div>
              <button
                onClick={() => run(a)}
                className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-olive px-4 py-2 text-caption font-semibold text-white transition hover:bg-olive-dark"
              >
                {a.actionLabel} <ArrowRight size={13} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
