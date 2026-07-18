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

export type ReminderLang = "en" | "hi" | "hinglish";

export const REMINDER_LANGS: { key: ReminderLang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "hi", label: "हिन्दी" },
  { key: "hinglish", label: "Hinglish" },
];

/** Short WhatsApp/SMS-style reminder in the owner's chosen language. */
export function reminderTemplate(
  lang: ReminderLang,
  name: string,
  inv: EnrichedInvoice,
): string {
  const amt = formatINR(inv.amount);
  const due = formatDate(inv.dueDate);
  const overdue = inv.overdue ? Math.abs(inv.daysToDue) : 0;

  if (lang === "hi") {
    const state = overdue
      ? `${due} को देय थी और अब ${overdue} दिन बकाया है`
      : `${due} को देय है`;
    return `नमस्ते ${inv.client}, विनम्र याद — इनवॉइस ${inv.id} की राशि ${amt} ${state}। कृपया भुगतान की तारीख बताएं। धन्यवाद, ${name}।`;
  }
  if (lang === "hinglish") {
    const state = overdue
      ? `${due} ko due tha aur ab ${overdue} din late hai`
      : `${due} ko due hai`;
    return `Namaste ${inv.client}, chhoti si yaad — invoice ${inv.id} ka ${amt} ${state}. Payment date bata dijiye? Thanks, ${name}.`;
  }
  const state = overdue
    ? `was due on ${due} and is now ${overdue} days overdue`
    : `is due on ${due}`;
  return `Hi ${inv.client}, a gentle reminder — invoice ${inv.id} for ${amt} ${state}. Could you please share the expected payment date? Thanks, ${name}.`;
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
