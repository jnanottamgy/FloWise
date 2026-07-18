import type {
  ClientBreakdown,
  Invoice,
  Metrics,
  MonthlyPoint,
} from "./types";
import { TODAY, daysBetween, enrichInvoices } from "./riskEngine";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string): string {
  const m = Number(key.slice(5, 7));
  return MONTH_LABELS[m - 1] ?? key;
}

/** All month keys from `startKey` to `endKey` inclusive (YYYY-MM). */
function monthRange(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let [y, m] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return keys;
}

/**
 * All headline numbers for a business, computed purely in code from its
 * invoices (risk bands come from the risk engine, never from AI).
 */
export function computeMetrics(invoices: Invoice[]): Metrics {
  const enriched = enrichInvoices(invoices);

  const outstanding = enriched
    .filter((i) => i.status === "unpaid")
    .reduce((s, i) => s + i.amount, 0);

  const overdue = enriched
    .filter((i) => i.overdue)
    .reduce((s, i) => s + i.amount, 0);

  const flaggedCount = enriched.filter((i) => i.risk !== "green").length;

  const collected90d = enriched
    .filter((i) => {
      if (!i.paidDate) return false;
      const ago = daysBetween(i.paidDate, TODAY); // today - paidDate
      return ago >= 0 && ago <= 90;
    })
    .reduce((s, i) => s + i.amount, 0);

  const denom = collected90d + outstanding;
  const collectionRatePct = denom > 0 ? Math.round((collected90d / denom) * 100) : 0;

  // Monthly series: collected (received that month) and cumulative outstanding.
  const allDates = invoices.flatMap((i) =>
    i.paidDate ? [i.issueDate, i.paidDate] : [i.issueDate],
  );
  const startKey = allDates.reduce(
    (min, d) => (monthKey(d) < min ? monthKey(d) : min),
    monthKey(TODAY),
  );
  const monthly: MonthlyPoint[] = monthRange(startKey, monthKey(TODAY)).map(
    (key) => {
      const collected = invoices
        .filter((i) => i.paidDate && monthKey(i.paidDate) === key)
        .reduce((s, i) => s + i.amount, 0);
      const outstandingAtMonth = invoices
        .filter((i) => i.status === "unpaid" && monthKey(i.issueDate) <= key)
        .reduce((s, i) => s + i.amount, 0);
      return { month: key, label: monthLabel(key), collected, outstanding: outstandingAtMonth };
    },
  );

  // Per-client breakdown.
  const byClient = new Map<string, ClientBreakdown>();
  for (const inv of enriched) {
    const c =
      byClient.get(inv.client) ??
      {
        client: inv.client,
        outstanding: 0,
        invoiceCount: 0,
        flaggedCount: 0,
        hasLateHistory: false,
      };
    c.invoiceCount += 1;
    if (inv.status === "unpaid") c.outstanding += inv.amount;
    if (inv.risk !== "green") c.flaggedCount += 1;
    if (inv.clientHasLateHistory) c.hasLateHistory = true;
    byClient.set(inv.client, c);
  }
  const clients = [...byClient.values()].sort(
    (a, b) => b.outstanding - a.outstanding,
  );

  return {
    outstanding,
    overdue,
    flaggedCount,
    collected90d,
    collectionRatePct,
    totalInvoices: invoices.length,
    clientCount: byClient.size,
    monthly,
    clients,
  };
}
