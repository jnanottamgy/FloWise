"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowDownLeft, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInvoices } from "@/lib/dashboardData";
import { useDashboardState } from "@/lib/dashboardState";
import { formatDate, formatINR, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Event {
  key: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  when: string;
  sortKey: number;
  delta?: { text: string; positive: boolean };
  tint: string;
}

export function ActivityFeed() {
  const { data } = useInvoices();
  const { sentItems } = useDashboardState();

  const events: Event[] = [];

  for (const inv of data?.invoices ?? []) {
    if (inv.paidDate) {
      events.push({
        key: `paid-${inv.id}`,
        icon: ArrowDownLeft,
        title: "Payment received",
        sub: inv.client,
        when: formatDate(inv.paidDate),
        sortKey: Date.parse(inv.paidDate),
        delta: { text: `+${formatINR(inv.amount)}`, positive: true },
        tint: "bg-success/10 text-success",
      });
    } else if (inv.risk === "red") {
      events.push({
        key: `flag-${inv.id}`,
        icon: AlertTriangle,
        title: "Invoice flagged",
        sub: inv.client,
        when: formatDate(inv.dueDate),
        sortKey: Date.parse(inv.dueDate),
        delta: { text: `-${formatINR(inv.amount)}`, positive: false },
        tint: "bg-error/10 text-error",
      });
    }
  }

  for (const s of sentItems) {
    events.push({
      key: `sent-${s.invoice.id}-${s.sentAt}`,
      icon: Send,
      title: "Follow-up sent",
      sub: s.invoice.client,
      when: relativeTime(s.sentAt),
      sortKey: Date.parse(s.sentAt),
      tint: "bg-olive/10 text-olive",
    });
  }

  events.sort((a, b) => b.sortKey - a.sortKey);
  const shown = events.slice(0, 6);

  return (
    <Card>
      <h3 className="mb-4 text-section font-semibold text-ink">Activity</h3>
      {shown.length === 0 && (
        <p className="text-caption text-muted">No recent activity.</p>
      )}
      <ul className="space-y-3.5">
        {shown.map((e, i) => {
          const Icon = e.icon;
          return (
            <motion.li
              key={e.key}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-black/[0.02]"
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  e.tint,
                )}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-caption font-medium text-ink">
                  {e.title}
                </p>
                <p className="truncate text-caption text-muted">
                  {e.sub} · {e.when}
                </p>
              </div>
              {e.delta && (
                <span
                  className={cn(
                    "shrink-0 text-caption font-medium",
                    e.delta.positive ? "text-success" : "text-error",
                  )}
                >
                  {e.delta.text}
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
