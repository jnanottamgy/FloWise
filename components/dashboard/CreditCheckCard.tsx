"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInvoices } from "@/lib/dashboardData";
import {
  allNetworkNames,
  lookupCredit,
  reputationsFor,
  type CreditTier,
  type CreditVerdict,
} from "@/lib/network";
import { cn } from "@/lib/utils";

const TIER: Record<CreditTier, { label: string; cls: string; dot: string }> = {
  good: { label: "Good payer", cls: "bg-success/10 text-success", dot: "bg-success" },
  watch: { label: "Sometimes late", cls: "bg-warning/15 text-warning", dot: "bg-warning" },
  risky: { label: "Risky", cls: "bg-error/10 text-error", dot: "bg-error" },
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function CreditCheckCard() {
  const { data } = useInvoices();
  const clients = useMemo(() => {
    const names = (data?.invoices ?? []).map((i) => i.client);
    return reputationsFor(names);
  }, [data]);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CreditVerdict | null>(null);
  const names = allNetworkNames();

  function check() {
    if (!query.trim()) return;
    setResult(lookupCredit(query));
  }

  return (
    <Card id="sec-credit" className="scroll-mt-6 sm:col-span-2">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Credit check</h3>
        <ShieldCheck size={18} className="text-olive" />
      </div>
      <p className="text-caption text-muted">
        How your clients pay across the FloWise network — before you extend credit
      </p>

      {/* New-client lookup */}
      <div className="mt-4 flex gap-2">
        <input
          list="network-clients"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Check a new client…"
          className="h-11 flex-1 rounded-pill border border-border bg-bg px-4 text-body text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
        />
        <datalist id="network-clients">
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button
          onClick={check}
          className="inline-flex items-center gap-1.5 rounded-pill bg-olive px-4 text-caption font-semibold text-white transition hover:bg-olive-dark"
        >
          <Search size={15} /> Check
        </button>
      </div>

      {result && (
        <div
          className={cn(
            "mt-3 rounded-2xl p-3",
            result.tier === "risky"
              ? "bg-error/[0.06]"
              : result.tier === "watch"
                ? "bg-warning/[0.08]"
                : "bg-success/[0.06]",
          )}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("rounded-pill px-2.5 py-1 text-caption font-medium", TIER[result.tier].cls)}>
              {result.known ? TIER[result.tier].label : "New / unknown"}
            </span>
            <span className="text-caption font-medium text-ink">{result.client}</span>
          </div>
          <p className="text-caption leading-relaxed text-ink/80">{result.verdict}</p>
        </div>
      )}

      {/* Your clients' reputations */}
      <p className="mb-2 mt-5 text-caption font-semibold uppercase tracking-wide text-muted">
        Your clients
      </p>
      <div className="space-y-2">
        {clients.map((c) => (
          <div key={c.client} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-black/[0.015]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-olive/10 text-caption font-semibold text-olive">
              {initials(c.client)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink">{c.client}</p>
              <p className="text-caption text-muted">
                {c.known
                  ? `~${c.avgDaysLate}d late · ${c.suppliers} suppliers · ${Math.round(c.onTimeRate * 100)}% on-time`
                  : "No network history yet"}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-pill px-2.5 py-1 text-caption font-medium", TIER[c.tier].cls)}>
              {c.known ? TIER[c.tier].label : "New"}
            </span>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-caption text-muted">No clients yet.</p>
        )}
      </div>
    </Card>
  );
}
