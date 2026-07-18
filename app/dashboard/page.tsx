"use client";

import Link from "next/link";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { useBusiness } from "@/lib/businessContext";
import { Card } from "@/components/ui/card";

// Temporary dashboard body — proves onboarding + context + guard work.
// The full shell (sidebar + header + grid) lands in E4.
function DashboardInner() {
  const { activeBusiness } = useBusiness();
  return (
    <main className="min-h-screen p-8">
      <Card>
        <p className="text-caption text-muted">Active workspace</p>
        <h1 className="mt-1 text-hero font-bold text-ink">
          {activeBusiness?.name}
        </h1>
        <p className="mt-1 text-body text-muted">
          {activeBusiness?.industry}
          {activeBusiness?.isCustom ? " · custom" : ""}
        </p>
        <p className="mt-6 text-body text-muted">
          Dashboard shell arrives in E4.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-caption font-medium text-olive hover:underline"
        >
          ← Switch business
        </Link>
      </Card>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardInner />
    </DashboardGuard>
  );
}
