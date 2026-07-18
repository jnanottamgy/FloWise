// Ready-made workflow templates for owners who aren't writers. Filled with the
// business's real data where possible; [BRACKETS] are quick edit spots.
import type { Metrics } from "./types";
import { formatINR } from "./format";

export interface TemplateCtx {
  businessName: string;
  metrics?: Metrics;
}

export interface TemplateDef {
  key: string;
  label: string;
  build: (ctx: TemplateCtx) => string;
}

export const TEMPLATES: TemplateDef[] = [
  {
    key: "reminder",
    label: "Payment reminder",
    build: ({ businessName }) =>
      `Hi [Client],\n\nA gentle reminder that invoice [INV-000] for [₹ amount] was due on [date]. Could you please share the expected payment date?\n\nThank you,\n${businessName}`,
  },
  {
    key: "thankyou",
    label: "Payment thank-you",
    build: ({ businessName }) =>
      `Dear [Client],\n\nThank you for your payment of [₹ amount] against invoice [INV-000]. We really appreciate it and look forward to serving you again.\n\nWarm regards,\n${businessName}`,
  },
  {
    key: "invoice",
    label: "New invoice note",
    build: ({ businessName }) =>
      `Dear [Client],\n\nPlease find attached invoice [INV-000] for [₹ amount], due on [date]. Payment can be made via UPI to [your UPI ID] or bank transfer.\n\nThank you for your business,\n${businessName}`,
  },
  {
    key: "advance",
    label: "Advance request",
    build: ({ businessName }) =>
      `Dear [Client],\n\nThank you for your order. To begin, we request a [30]% advance of [₹ amount], with the balance due on delivery. Please confirm and we'll get started right away.\n\nRegards,\n${businessName}`,
  },
  {
    key: "monthend",
    label: "Month-end summary",
    build: ({ businessName, metrics }) =>
      metrics
        ? `Month summary — ${businessName}\n\n• Collected (last 90 days): ${formatINR(metrics.collected90d)}\n• Outstanding: ${formatINR(metrics.outstanding)}\n• Overdue: ${formatINR(metrics.overdue)}\n• Invoices to follow up: ${metrics.flaggedCount}\n• Collection rate: ${metrics.collectionRatePct}%\n\nFocus next: chase the ${metrics.flaggedCount} flagged invoices to free up cash.`
        : `Month summary — ${businessName}\n\n[Add your figures]`,
  },
];
