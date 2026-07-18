import type { EnrichedInvoice, Invoice, Risk } from "./types";

/**
 * The demo's "today". Fixed so risk bands and metrics are deterministic
 * regardless of the wall clock — a reliable hackathon demo.
 */
export const TODAY = "2026-07-18";

const MS_PER_DAY = 86_400_000;

function toUTC(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getTime();
}

/** Whole days from `fromStr` to `toStr` (toStr - fromStr). */
export function daysBetween(fromStr: string, toStr: string): number {
  return Math.round((toUTC(toStr) - toUTC(fromStr)) / MS_PER_DAY);
}

/**
 * Enrich invoices with deterministic, code-computed risk.
 *   red    = unpaid AND (overdue OR the client has any paid_late history)
 *   yellow = unpaid AND due within the next 3 days (and not red)
 *   green  = otherwise
 * PURE — no fs, no globals — so it runs identically on server and client
 * (uploaded businesses compute their own risk this way too).
 */
export function enrichInvoices(invoices: Invoice[]): EnrichedInvoice[] {
  const lateClients = new Set(
    invoices.filter((i) => i.status === "paid_late").map((i) => i.client),
  );

  return invoices.map((inv) => {
    const unpaid = inv.status === "unpaid";
    const daysToDue = daysBetween(TODAY, inv.dueDate); // dueDate - today
    const overdue = unpaid && daysToDue < 0;
    const clientHasLateHistory = lateClients.has(inv.client);

    let risk: Risk = "green";
    if (unpaid && (overdue || clientHasLateHistory)) {
      risk = "red";
    } else if (unpaid && daysToDue >= 0 && daysToDue <= 3) {
      risk = "yellow";
    }

    return {
      ...inv,
      daysToDue,
      overdue,
      clientHasLateHistory,
      risk,
      aiReason: null,
    };
  });
}

/** Invoices that need attention (risk is not green), red-first then amount desc. */
export function getFlagged(enriched: EnrichedInvoice[]): EnrichedInvoice[] {
  const order: Record<Risk, number> = { red: 0, yellow: 1, green: 2 };
  return enriched
    .filter((i) => i.risk !== "green")
    .sort((a, b) => order[a.risk] - order[b.risk] || b.amount - a.amount);
}
