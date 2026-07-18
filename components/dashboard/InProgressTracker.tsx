"use client";

import { motion } from "framer-motion";
import { Clock, MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardState } from "@/lib/dashboardState";
import { formatINR, relativeTime } from "@/lib/format";

export function InProgressTracker() {
  const { sentItems } = useDashboardState();

  return (
    <Card id="sec-documents" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">In progress</h3>
        <span className="text-caption text-muted">
          {sentItems.length} follow-up{sentItems.length === 1 ? "" : "s"} sent
        </span>
      </div>

      {sentItems.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-caption text-muted">
          <Clock size={16} /> No follow-ups sent yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sentItems.map((s) => (
            <motion.div
              key={`${s.invoice.id}-${s.sentAt}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive/10 text-olive">
                <MailCheck size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-caption font-medium text-ink">
                  {s.invoice.client} · {s.invoice.id}
                </p>
                <p className="text-caption text-muted">
                  {formatINR(s.invoice.amount)} · Sent {relativeTime(s.sentAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
