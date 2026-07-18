"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { useInvoices } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { useBusiness, type ActiveBusiness } from "@/lib/businessContext";
import { postFollowup } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import type { EnrichedInvoice } from "@/lib/types";

function PanelInner({
  invoice,
  active,
  onClose,
  onSend,
}: {
  invoice: EnrichedInvoice;
  active: ActiveBusiness;
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["followup", active.id, invoice.id],
    queryFn: () => postFollowup(active, invoice.id),
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data?.draft) setMessage(data.draft);
  }, [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-label={`Follow-up for ${invoice.id}`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative flex h-full w-full max-w-[440px] flex-col bg-card shadow-card"
      >
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <p className="text-caption text-muted">Follow-up draft</p>
            <h2 className="text-section font-semibold text-ink">
              {invoice.client}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-caption text-muted">
              <span>{invoice.id}</span>
              <span>·</span>
              <span className="font-medium text-ink">
                {formatINR(invoice.amount)}
              </span>
              <span>·</span>
              <span>due {formatDate(invoice.dueDate)}</span>
            </div>
            <div className="mt-3">
              <RiskBadge risk={invoice.risk} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-black/[0.04] hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <label className="text-caption font-medium text-muted">
            Message
          </label>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded-full bg-black/[0.06]"
                />
              ))}
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={14}
              className="mt-2 w-full resize-none rounded-3xl border border-border bg-bg p-4 text-body leading-relaxed text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
            />
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border p-6">
          <button
            onClick={() => onSend(message)}
            disabled={isLoading || !message.trim()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-olive py-3 text-body font-semibold text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} /> Send
          </button>
          <button
            onClick={onClose}
            className="rounded-pill border border-border px-5 py-3 text-body font-medium text-ink transition hover:bg-black/[0.03]"
          >
            Cancel
          </button>
        </div>
      </motion.aside>
    </div>
  );
}

export function FollowUpPanel() {
  const { selectedInvoiceId, select, markSent } = useDashboardState();
  const { data } = useInvoices();
  const { activeBusiness } = useBusiness();

  const invoice =
    data?.invoices.find((i) => i.id === selectedInvoiceId) ?? null;

  return (
    <AnimatePresence>
      {selectedInvoiceId && invoice && activeBusiness && (
        <PanelInner
          key={invoice.id}
          invoice={invoice}
          active={activeBusiness}
          onClose={() => select(null)}
          onSend={(message) => {
            markSent({
              invoice,
              message,
              sentAt: new Date().toISOString(),
            });
            select(null);
          }}
        />
      )}
    </AnimatePresence>
  );
}
