"use client";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MetricRow } from "@/components/dashboard/MetricRow";
import { CashFlowRow } from "@/components/dashboard/CashFlowRow";
import { MoneySection } from "@/components/dashboard/MoneySection";
import { FlaggedInvoices } from "@/components/dashboard/FlaggedInvoices";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { InProgressTracker } from "@/components/dashboard/InProgressTracker";
import { FollowUpPanel } from "@/components/dashboard/FollowUpPanel";
import { DashboardStateProvider } from "@/lib/dashboardState";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardStateProvider>
        <DashboardShell>
          {/* Row 1 — metrics */}
          <MetricRow />

          {/* Row 2 — chart / gauge / profile */}
          <CashFlowRow />

          {/* Money band — real cash, leaks, tax drawer, all transactions */}
          <MoneySection />

          {/* Row 3 — flagged / activity / AI */}
          <FlaggedInvoices />
          <ActivityFeed />
          <AIAssistantCard />

          {/* Row 4 — In Progress */}
          <InProgressTracker />
        </DashboardShell>

        {/* Slide-in follow-up draft (overlay) */}
        <FollowUpPanel />
      </DashboardStateProvider>
    </DashboardGuard>
  );
}
