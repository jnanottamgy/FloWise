"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInvoices } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { useBusiness } from "@/lib/businessContext";
import {
  REMINDER_LANGS,
  reminderTemplate,
  type ReminderLang,
} from "@/lib/drafts";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnrichedInvoice } from "@/lib/types";

const rank: Record<string, number> = { red: 0, yellow: 1, green: 2 };

export function ChaseListCard() {
  const { data } = useInvoices();
  const { activeBusiness } = useBusiness();
  const { sentIds, markSent } = useDashboardState();
  const [lang, setLang] = useState<ReminderLang>("en");
  const [copied, setCopied] = useState<string | null>(null);

  const name = activeBusiness?.name ?? "Our team";
  const toChase: EnrichedInvoice[] = (data?.invoices ?? [])
    .filter((i) => i.risk !== "green" && !sentIds.has(i.id))
    .sort((a, b) => rank[a.risk] - rank[b.risk] || b.amount - a.amount);
  const total = toChase.reduce((s, i) => s + i.amount, 0);

  function waLink(inv: EnrichedInvoice) {
    return `https://wa.me/?text=${encodeURIComponent(reminderTemplate(lang, name, inv))}`;
  }
  async function copy(inv: EnrichedInvoice) {
    try {
      await navigator.clipboard.writeText(reminderTemplate(lang, name, inv));
      setCopied(inv.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <Card id="sec-chase" className="scroll-mt-6 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-section font-semibold text-ink">Chase list</h3>
          <p className="text-caption text-muted">
            {toChase.length
              ? `Chase ${toChase.length} ${toChase.length === 1 ? "person" : "people"} today · ${formatINR(total)} to collect`
              : "Nothing to chase — you're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-pill bg-black/[0.03] p-1">
          {REMINDER_LANGS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-caption font-medium transition",
                lang === l.key ? "bg-card text-ink shadow-soft" : "text-muted",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {toChase.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.25) }}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink">
                {inv.client}{" "}
                <span className="text-caption font-normal text-muted">· {inv.id}</span>
              </p>
              <p className="text-caption text-muted">
                {formatINR(inv.amount)} ·{" "}
                {inv.overdue
                  ? `${Math.abs(inv.daysToDue)} days overdue`
                  : `due in ${inv.daysToDue} day${inv.daysToDue === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={waLink(inv)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-3 py-1.5 text-caption font-medium text-success transition hover:bg-success/20"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <button
                onClick={() => copy(inv)}
                aria-label="Copy message"
                className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-caption font-medium text-ink transition hover:bg-black/[0.03]"
              >
                {copied === inv.id ? <Check size={14} /> : <Copy size={14} />}
                {copied === inv.id ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() =>
                  markSent({
                    invoice: inv,
                    message: reminderTemplate(lang, name, inv),
                    sentAt: new Date().toISOString(),
                  })
                }
                className="rounded-pill bg-olive px-3 py-1.5 text-caption font-medium text-white transition hover:bg-olive-dark"
              >
                Mark sent
              </button>
            </div>
          </motion.div>
        ))}
        {toChase.length === 0 && (
          <div className="flex items-center gap-2 py-4 text-caption text-muted">
            <Check size={16} className="text-success" /> No pending reminders.
          </div>
        )}
      </div>
    </Card>
  );
}
