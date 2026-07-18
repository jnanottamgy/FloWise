// Client-safe deterministic text (no server-only imports). Used as instant
// content in the UI AND as the graceful fallback inside the AI layer.
import type { EnrichedInvoice, Metrics } from "./types";
import { formatDate, formatINR } from "./format";

export function summaryTemplate(name: string, m: Metrics): string {
  return (
    `${name} has ${formatINR(m.outstanding)} outstanding across ${m.totalInvoices} invoices, ` +
    `with ${formatINR(m.overdue)} already overdue and ${m.flaggedCount} invoice${m.flaggedCount === 1 ? "" : "s"} flagged as at-risk. ` +
    `Collections are running at about ${m.collectionRatePct}% — chasing the flagged clients first will protect your cash flow.`
  );
}

export function followupTemplate(name: string, inv: EnrichedInvoice): string {
  const state = inv.overdue
    ? `overdue by ${Math.abs(inv.daysToDue)} days`
    : `due on ${formatDate(inv.dueDate)}`;
  return (
    `Subject: Payment reminder — Invoice ${inv.id}\n\n` +
    `Dear ${inv.client},\n\n` +
    `I hope you're doing well. This is a gentle reminder that invoice ${inv.id} for ${formatINR(inv.amount)}, ` +
    `${inv.overdue ? `was due on ${formatDate(inv.dueDate)} and is now ${state}` : `is ${state}`}. ` +
    `We'd be grateful if you could confirm the expected payment date at your earliest convenience.\n\n` +
    `We truly value our partnership and want to keep everything running smoothly. ` +
    `Please let me know if there's anything you need from us to help process this.\n\n` +
    `Warm regards,\nAccounts Team\n${name}`
  );
}
