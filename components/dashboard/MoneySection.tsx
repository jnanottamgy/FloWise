"use client";

import { Card } from "@/components/ui/card";
import { RealCashCard } from "./RealCashCard";
import { LeakRadarCard } from "./LeakRadarCard";
import { TaxDrawerCard } from "./TaxDrawerCard";
import { TransactionsCard } from "./TransactionsCard";
import { useTransactions } from "@/lib/dashboardData";

// The "all your money" band: real cash + leaks + tax drawer + full ledger.
export function MoneySection() {
  const { data, isLoading, isError } = useTransactions();

  if (isLoading) {
    return (
      <>
        <Card className="min-h-[260px] animate-pulse bg-black/[0.02] sm:col-span-2" />
        <Card className="min-h-[260px] animate-pulse bg-black/[0.02]" />
        <Card className="min-h-[260px] animate-pulse bg-black/[0.02]" />
      </>
    );
  }

  if (isError || !data) {
    return (
      <Card className="sm:col-span-2 xl:col-span-4">
        <p className="text-body text-error">Couldn&apos;t load transactions.</p>
      </Card>
    );
  }

  if (data.transactions.length === 0) {
    return (
      <Card id="sec-money" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
        <h3 className="text-section font-semibold text-ink">Your money</h3>
        <p className="mt-2 text-body text-muted">
          No transactions yet for this workspace. Upload a bank/UPI statement or add
          a cash entry to see your real cash, leaks and tax drawer.
        </p>
      </Card>
    );
  }

  return (
    <>
      <RealCashCard metrics={data.metrics} />
      <LeakRadarCard metrics={data.metrics} />
      <TaxDrawerCard metrics={data.metrics} />
      <TransactionsCard transactions={data.transactions} />
    </>
  );
}
