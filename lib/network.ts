// Anonymized cross-business payment reputation ("the FloWise network").
// Pure + data-only so it works on server and client.
import networkData from "@/data/network.json";

export interface Reputation {
  client: string;
  avgDaysLate: number;
  suppliers: number;
  onTimeRate: number;
}

export type CreditTier = "good" | "watch" | "risky";

export interface CreditVerdict extends Reputation {
  tier: CreditTier;
  verdict: string;
  known: boolean;
}

const CLIENTS = (networkData as { clients: Record<string, Omit<Reputation, "client">> })
  .clients;

export function creditTier(avgDaysLate: number): CreditTier {
  if (avgDaysLate >= 15) return "risky";
  if (avgDaysLate >= 7) return "watch";
  return "good";
}

function verdictText(r: Reputation, tier: CreditTier): string {
  const onTime = Math.round(r.onTimeRate * 100);
  if (tier === "risky") {
    return `${r.client} pays about ${r.avgDaysLate} days late across ${r.suppliers} suppliers in the network (on-time only ${onTime}%). Consider advance payment or shorter credit terms before extending credit.`;
  }
  if (tier === "watch") {
    return `${r.client} sometimes pays late (~${r.avgDaysLate} days) across ${r.suppliers} suppliers. A gentle reminder up front helps keep things on track.`;
  }
  return `${r.client} has a clean record — pays on time across ${r.suppliers} suppliers (${onTime}% on-time). Safe to extend your normal terms.`;
}

/** Look up a client (case-insensitive). `known:false` when we have no data. */
export function lookupCredit(name: string): CreditVerdict {
  const trimmed = name.trim();
  const key = Object.keys(CLIENTS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase(),
  );
  if (!key) {
    return {
      client: trimmed,
      avgDaysLate: 0,
      suppliers: 0,
      onTimeRate: 0,
      tier: "good",
      verdict: `No network history for "${trimmed}" yet. Treat as a new relationship — start with modest credit and confirm terms in writing.`,
      known: false,
    };
  }
  const r: Reputation = { client: key, ...CLIENTS[key] };
  const tier = creditTier(r.avgDaysLate);
  return { ...r, tier, verdict: verdictText(r, tier), known: true };
}

/** Reputations for a set of the business's own clients. */
export function reputationsFor(clientNames: string[]): CreditVerdict[] {
  const seen = new Set<string>();
  const out: CreditVerdict[] = [];
  for (const name of clientNames) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(lookupCredit(name));
  }
  const order: Record<CreditTier, number> = { risky: 0, watch: 1, good: 2 };
  return out.sort((a, b) => order[a.tier] - order[b.tier] || b.avgDaysLate - a.avgDaysLate);
}

/** All network names (for the new-client lookup suggestions). */
export function allNetworkNames(): string[] {
  return Object.keys(CLIENTS);
}
