"use client";

import { Card } from "@/components/ui/card";
import { AnalyticsChart } from "./AnalyticsChart";
import { CollectionCard } from "./CollectionCard";
import { ProfileCard } from "./ProfileCard";
import { useSummary } from "@/lib/dashboardData";

export function CashFlowRow() {
  const { data, isLoading, isError } = useSummary();

  if (isLoading) {
    return (
      <>
        <Card className="min-h-[340px] animate-pulse bg-black/[0.02] sm:col-span-2" />
        <Card className="min-h-[340px] animate-pulse bg-black/[0.02]" />
        <Card className="min-h-[340px] animate-pulse bg-black/[0.02]" />
      </>
    );
  }

  if (isError || !data) {
    return (
      <Card className="sm:col-span-2 xl:col-span-4">
        <p className="text-body text-error">Couldn&apos;t load cash-flow data.</p>
      </Card>
    );
  }

  return (
    <>
      <AnalyticsChart metrics={data.metrics} />
      <CollectionCard metrics={data.metrics} />
      <ProfileCard business={data.business} metrics={data.metrics} />
    </>
  );
}
