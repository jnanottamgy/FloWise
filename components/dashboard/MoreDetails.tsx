"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutList } from "lucide-react";
import { MetricRow } from "./MetricRow";
import { CashFlowRow } from "./CashFlowRow";
import { MoneySection } from "./MoneySection";
import { FlaggedInvoices } from "./FlaggedInvoices";
import { ActivityFeed } from "./ActivityFeed";
import { ChaseListCard } from "./ChaseListCard";
import { TemplatesCard } from "./TemplatesCard";
import { CreditCheckCard } from "./CreditCheckCard";
import { InProgressTracker } from "./InProgressTracker";
import { cn } from "@/lib/utils";

// Everything power-users want, tucked away so the default view stays calm.
export function MoreDetails() {
  const [open, setOpen] = useState(false);

  return (
    <div id="sec-more" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-card border border-border bg-card p-4 shadow-card transition hover:shadow-soft"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-olive/10 text-olive">
            <LayoutList size={18} />
          </span>
          <span className="text-left">
            <span className="block text-body font-semibold text-ink">
              More details
            </span>
            <span className="block text-caption text-muted">
              Charts, all transactions, tax drawer, reminders, templates &amp; credit
            </span>
          </span>
        </span>
        <ChevronDown
          size={20}
          className={cn("text-muted transition", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <MetricRow />
              <CashFlowRow />
              <MoneySection />
              <FlaggedInvoices />
              <ActivityFeed />
              <ChaseListCard />
              <TemplatesCard />
              <CreditCheckCard />
              <InProgressTracker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
