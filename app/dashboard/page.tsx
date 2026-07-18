"use client";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MetricRow } from "@/components/dashboard/MetricRow";
import { AskFloWiseCard } from "@/components/dashboard/AskFloWiseCard";
import { CashFlowRow } from "@/components/dashboard/CashFlowRow";
import { MoneySection } from "@/components/dashboard/MoneySection";
import { FlaggedInvoices } from "@/components/dashboard/FlaggedInvoices";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { ChaseListCard } from "@/components/dashboard/ChaseListCard";
import { TemplatesCard } from "@/components/dashboard/TemplatesCard";
import { CreditCheckCard } from "@/components/dashboard/CreditCheckCard";
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

          {/* Ask FloWise — natural-language Q&A over your data */}
          <AskFloWiseCard />

          {/* Row 2 — chart / gauge / profile */}
          <CashFlowRow />

          {/* Money band — real cash, leaks, tax drawer, all transactions */}
          <MoneySection />

          {/* Row 3 — flagged / activity / AI */}
          <FlaggedInvoices />
          <ActivityFeed />
          <AIAssistantCard />

          {/* Chase list — zero-context follow-ups */}
          <ChaseListCard />

          {/* Templates — ready-made messages */}
          <TemplatesCard />

          {/* Credit check — client payment reputation */}
          <CreditCheckCard />

          {/* Row 4 — In Progress */}
          <InProgressTracker />
        </DashboardShell>

        {/* Slide-in follow-up draft (overlay) */}
        <FollowUpPanel />
      </DashboardStateProvider>
    </DashboardGuard>
  );
}
