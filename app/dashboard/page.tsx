"use client";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CashTodayHero } from "@/components/dashboard/CashTodayHero";
import { ActionListCard } from "@/components/dashboard/ActionListCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { MoneyInCard } from "@/components/dashboard/MoneyInCard";
import { MoneyOutCard } from "@/components/dashboard/MoneyOutCard";
import { AskFloWiseCard } from "@/components/dashboard/AskFloWiseCard";
import { MoreDetails } from "@/components/dashboard/MoreDetails";
import { FollowUpPanel } from "@/components/dashboard/FollowUpPanel";
import { AddTransactionFab } from "@/components/dashboard/AddTransactionFab";
import { DashboardStateProvider } from "@/lib/dashboardState";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardStateProvider>
        <DashboardShell>
          {/* 1. How much money do I have? */}
          <CashTodayHero />

          {/* 2. What should I do today? · 5. Will I run out? */}
          <ActionListCard />
          <ForecastCard />

          {/* 3. Who has to pay me? · 4. Whom do I have to pay? */}
          <MoneyInCard />
          <MoneyOutCard />

          {/* Ask anything */}
          <AskFloWiseCard />

          {/* Everything else, tucked away */}
          <MoreDetails />
        </DashboardShell>

        <FollowUpPanel />
        <AddTransactionFab />
      </DashboardStateProvider>
    </DashboardGuard>
  );
}
