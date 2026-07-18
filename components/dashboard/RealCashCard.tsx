"use client";

import { useEffect, useState } from "react";
import { Landmark, Package, Repeat, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MoneyMetrics } from "@/lib/types";

function runwayTone(weeks: number) {
  if (weeks < 3) return { label: "Tight", cls: "bg-error/10 text-error" };
  if (weeks < 6) return { label: "Watch", cls: "bg-warning/15 text-warning" };
  return { label: "Healthy", cls: "bg-success/10 text-success" };
}

function Chip({
  icon: Icon,
  label,
  value,
  strong,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.025] p-3">
      <div className="flex items-center gap-1.5 text-caption text-muted">
        <Icon size={14} /> {label}
      </div>
      <p className={cn("mt-1 font-semibold", strong ? "text-body text-ink" : "text-body text-ink")}>
        {value}
      </p>
    </div>
  );
}

export function RealCashCard({ metrics: m }: { metrics: MoneyMetrics }) {
  const tone = runwayTone(m.runwayWeeks);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // No money recorded yet (e.g. a custom workspace built from invoices only):
  // show a prompt instead of "₹0 free · ∞ weeks · Healthy".
  if (m.moneyIn === 0 && m.moneyOut === 0 && m.bankBalance === 0) {
    return (
      <Card id="sec-money" className="scroll-mt-6 sm:col-span-2">
        <h3 className="text-section font-semibold text-ink">Real cash</h3>
        <p className="mt-2 text-caption leading-relaxed text-muted">
          No transaction data yet — add money or upload a bank statement to see
          your real free cash and runway.
        </p>
      </Card>
    );
  }
  const barPct = Math.max(
    4,
    Math.min(100, m.bankBalance ? (m.realFreeCash / m.bankBalance) * 100 : 0),
  );

  return (
    <Card id="sec-money" className="scroll-mt-6 sm:col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-section font-semibold text-ink">Real cash</h3>
          <p className="text-caption text-muted">
            What&apos;s actually free to spend
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-medium",
            tone.cls,
          )}
        >
          {m.runwayWeeks >= 99 ? "∞" : m.runwayWeeks} weeks runway · {tone.label}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-caption text-muted">Free right now</p>
        <p className="text-hero font-bold text-olive">{formatINR(m.realFreeCash)}</p>
        {/* free vs bank bar */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-olive transition-all duration-1000"
            style={{ width: `${mounted ? barPct : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Chip icon={Landmark} label="Bank shows" value={formatINR(m.bankBalance)} />
        <Chip icon={Package} label="Tied in stock" value={formatINR(m.lockedInStock)} />
        <Chip icon={Repeat} label="Bills due ~" value={formatINR(m.committedRecurring)} />
      </div>

      <p className="mt-4 rounded-2xl bg-olive/[0.06] p-3 text-caption leading-relaxed text-ink/80">
        Your bank shows <b>{formatINR(m.bankBalance)}</b>, but{" "}
        <b>{formatINR(m.lockedInStock)}</b> is tied up in stock you haven&apos;t sold
        yet and <b>{formatINR(m.committedRecurring)}</b> goes to regular monthly bills.
        Your real breathing room is <b>{formatINR(m.realFreeCash)}</b> — about{" "}
        <b>{m.runwayWeeks >= 99 ? "plenty of" : `${m.runwayWeeks} weeks of`}</b> runway
        at your current spend.
      </p>
    </Card>
  );
}
