"use client";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MetricRow } from "@/components/dashboard/MetricRow";
import { CashFlowRow } from "@/components/dashboard/CashFlowRow";
import { FlaggedInvoices } from "@/components/dashboard/FlaggedInvoices";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { DashboardStateProvider } from "@/lib/dashboardState";
import { cn } from "@/lib/utils";

// Labelled placeholders show the grid the remaining rows fill.
function Slot({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid min-h-[120px] place-items-center rounded-card border border-dashed border-black/10 bg-black/[0.015] text-caption text-muted",
        className,
      )}
    >
      {label}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardStateProvider>
        <DashboardShell>
          {/* Row 1 — metrics */}
          <MetricRow />

          {/* Row 2 — chart / gauge / profile */}
          <CashFlowRow />

          {/* Row 3 — flagged / activity / AI */}
          <FlaggedInvoices />
          <ActivityFeed />
          <AIAssistantCard />

          {/* Row 4 — In Progress (E8) */}
          <Slot
            label="In Progress tracker (E8)"
            className="sm:col-span-2 xl:col-span-4"
          />
        </DashboardShell>
      </DashboardStateProvider>
    </DashboardGuard>
  );
}
