"use client";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MetricRow } from "@/components/dashboard/MetricRow";
import { cn } from "@/lib/utils";

// Labelled placeholders show the grid the content rows (E5–E8) fill.
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
      <DashboardShell>
        {/* Row 1 — metrics */}
        <MetricRow />

        {/* Row 2 — chart / gauge / profile (E6) */}
        <Slot label="Cash Flow chart (E6)" className="min-h-[280px] sm:col-span-2" />
        <Slot label="Collection gauge (E6)" className="min-h-[280px]" />
        <Slot label="Business profile (E6)" className="min-h-[280px]" />

        {/* Row 3 — flagged / activity / AI (E7) */}
        <Slot label="Flagged Invoices (E7)" className="min-h-[300px] sm:col-span-2" />
        <Slot label="Activity Feed (E7)" className="min-h-[300px]" />
        <Slot label="AI Assistant (E7)" className="min-h-[300px]" />

        {/* Row 4 — In Progress (E8) */}
        <Slot label="In Progress tracker (E8)" className="sm:col-span-2 xl:col-span-4" />
      </DashboardShell>
    </DashboardGuard>
  );
}
