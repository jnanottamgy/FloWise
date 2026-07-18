"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import type { Metrics } from "@/lib/types";

const R = 78;
const ARC = Math.PI * R; // semicircle length

export function CollectionCard({ metrics }: { metrics: Metrics }) {
  const pct = Math.max(0, Math.min(100, metrics.collectionRatePct));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Animate via CSS transition on the dash offset (robust when tab hidden:
  // the final value is applied immediately, the transition just interpolates).
  const offset = mounted ? ARC * (1 - pct / 100) : ARC;

  return (
    <Card className="flex flex-col">
      <h3 className="text-section font-semibold text-ink">Collection rate</h3>

      <div className="relative mx-auto mt-4 w-full max-w-[220px]">
        <svg viewBox="0 0 200 120" className="w-full">
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="#5F786A"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={ARC}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <span className="text-hero font-bold text-ink">{pct}%</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <p className="text-caption text-muted">Total outstanding</p>
        <p className="text-section font-bold text-olive">
          {formatINR(metrics.outstanding)}
        </p>
        <p className="mt-1 text-caption text-muted">
          {formatINR(metrics.collected90d)} collected in the last 90 days
        </p>
      </div>
    </Card>
  );
}
