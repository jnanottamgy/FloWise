"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BusinessMeta, Metrics } from "@/lib/types";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-section font-bold text-ink">{value}</p>
      <p className="text-caption text-muted">{label}</p>
    </div>
  );
}

export function ProfileCard({
  business,
  metrics,
}: {
  business: BusinessMeta;
  metrics: Metrics;
}) {
  return (
    <Card className="flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-olive to-sage text-section font-semibold text-white">
        {business.name.slice(0, 1)}
      </div>
      <h3 className="mt-3 text-section font-semibold text-ink">
        {business.name}
      </h3>
      <p className="text-caption text-muted">{business.industry}</p>
      <p className="text-caption text-muted">{business.email}</p>

      <div className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
        <Stat label="Invoices" value={metrics.totalInvoices} />
        <Stat label="Clients" value={metrics.clientCount} />
        <Stat label="Flagged" value={metrics.flaggedCount} />
      </div>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1 text-caption font-medium text-olive hover:underline"
      >
        Switch business <ArrowUpRight size={14} />
      </Link>
    </Card>
  );
}
