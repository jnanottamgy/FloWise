"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageCircle,
  Send,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { useBusiness } from "@/lib/businessContext";
import { useLang } from "@/lib/language";
import { reminderTemplate, waLink } from "@/lib/drafts";
import { formatINR } from "@/lib/format";
import { TODAY } from "@/lib/riskEngine";
import { scrollToSection } from "./Sidebar";
import { cn } from "@/lib/utils";
import type { Action, Urgency } from "@/lib/actions";
import type { EnrichedInvoice } from "@/lib/types";

const TONE: Record<Urgency, { dot: string; icon: typeof AlertTriangle }> = {
  urgent: { dot: "bg-error", icon: AlertTriangle },
  warning: { dot: "bg-warning", icon: Clock },
  info: { dot: "bg-olive", icon: Wallet },
};

export function ActionListCard() {
  const { actions: allActions, invoices, metrics, isLoading } = useOverview();
  const { markSent, addTransactions } = useDashboardState();
  const { activeBusiness } = useBusiness();
  const { t, lang } = useLang();
  const name = activeBusiness?.name ?? "Our team";
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const actions = allActions.filter((a) => !dismissed.has(a.id));

  function chase(inv: EnrichedInvoice) {
    const msg = reminderTemplate(lang, name, inv);
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    markSent({ invoice: inv, message: msg, sentAt: new Date().toISOString() });
  }

  function run(a: Action) {
    if ((a.actionType === "collect" || a.actionType === "remind") && a.invoiceId) {
      const inv = invoices.find((i) => i.id === a.invoiceId);
      if (inv) chase(inv);
    } else if (a.actionType === "pay" && a.pay) {
      // Log the bill payment as an expense and clear it off the list.
      addTransactions([
        {
          id: `P${Date.now().toString(36)}`,
          date: TODAY,
          description: `Paid ${a.pay.name}`,
          counterparty: a.pay.name,
          amount: a.pay.amount,
          direction: "out",
          mode: "cash",
          scope: "business",
          category: a.pay.category,
          source: "manual",
          recurring: false,
          tiedToStock: false,
        },
      ]);
      setDismissed((prev) => new Set(prev).add(a.id));
    } else if (a.actionType === "view") {
      scrollToSection("sec-forecast");
    }
  }

  function briefToWhatsApp() {
    const lines = [`${t("act.greetBrief")} ${name}:`];
    actions.slice(0, 4).forEach((a, i) => lines.push(`${i + 1}. ${a.title} (${a.sub})`));
    if (metrics) lines.push(`${t("act.cashFree")}: ${formatINR(metrics.realFreeCash)}.`);
    lines.push("— via FloWise");
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <Card id="sec-actions" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-section font-semibold text-ink">{t("act.title")}</h3>
        {actions.length > 0 && (
          <button
            onClick={briefToWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-3 py-1.5 text-caption font-medium text-success transition hover:bg-success/20"
          >
            <Send size={13} /> {t("act.sendWa")}
          </button>
        )}
      </div>
      <p className="text-caption text-muted">{t("act.sub")}</p>

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
          <p className="mt-2 text-body font-medium text-ink">{t("act.allDone")}</p>
          <p className="text-caption text-muted">{t("act.nothing")}</p>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {actions.map((a, i) => {
          const Icon = TONE[a.urgency].icon;
          const isChase = a.actionType === "collect" || a.actionType === "remind";
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
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-pill px-4 py-2 text-caption font-semibold text-white transition",
                  isChase ? "bg-success hover:bg-success/90" : "bg-olive hover:bg-olive-dark",
                )}
              >
                {isChase ? <MessageCircle size={13} /> : null}
                {a.actionLabel}
                {!isChase && <ArrowRight size={13} />}
              </button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
