"use client";

import { AlarmClock, Flag, IndianRupee, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { useSummary } from "@/lib/dashboardData";
import { formatINR } from "@/lib/format";

const intFmt = (n: number) => Math.round(n).toString();

export function MetricRow() {
  const { data, isLoading, isError } = useSummary();

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[104px] animate-pulse bg-black/[0.02]" />
        ))}
      </>
    );
  }

  if (isError || !data) {
    return (
      <Card className="sm:col-span-2 xl:col-span-4">
        <p className="text-body text-error">Couldn&apos;t load metrics. Try refreshing.</p>
      </Card>
    );
  }

  const m = data.metrics;
  const collectedSeries = m.monthly.map((p) => p.collected);
  const outstandingSeries = m.monthly.map((p) => p.outstanding);

  return (
    <>
      <MetricCard
        title="Outstanding"
        value={m.outstanding}
        format={formatINR}
        icon={Wallet}
        series={outstandingSeries}
        chart="bar"
      />
      <MetricCard
        title="Flagged Invoices"
        value={m.flaggedCount}
        format={intFmt}
        icon={Flag}
        series={outstandingSeries}
        chart="area"
      />
      <MetricCard
        title="Collected (90d)"
        value={m.collected90d}
        format={formatINR}
        icon={IndianRupee}
        series={collectedSeries}
        chart="area"
      />
      <MetricCard
        title="Overdue"
        value={m.overdue}
        format={formatINR}
        icon={AlarmClock}
        series={outstandingSeries}
        chart="area"
        highlight
      />
    </>
  );
}
