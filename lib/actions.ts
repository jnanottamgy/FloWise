// Auto-generated "what should I do today" list — the heart of the redesign.
import type { EnrichedInvoice, MoneyMetrics } from "./types";
import type { Forecast } from "./forecast";
import { formatINR } from "./format";

export type ActionType = "collect" | "remind" | "pay" | "view";
export type Urgency = "urgent" | "warning" | "info";

export interface Action {
  id: string;
  urgency: Urgency;
  title: string;
  sub: string;
  actionLabel: string;
  actionType: ActionType;
  invoiceId?: string;
  pay?: { name: string; amount: number; category: string };
}

const rank: Record<Urgency, number> = { urgent: 0, warning: 1, info: 2 };

export function buildActions(
  invoices: EnrichedInvoice[],
  money: MoneyMetrics | null,
  forecast: Forecast | null,
  sentIds: Set<string>,
): Action[] {
  const actions: Action[] = [];
  const open = invoices.filter((i) => i.risk !== "green" && !sentIds.has(i.id));

  // Overdue → collect now (urgent).
  for (const inv of open.filter((i) => i.overdue).sort((a, b) => b.amount - a.amount)) {
    actions.push({
      id: `collect-${inv.id}`,
      urgency: "urgent",
      title: `Collect ${formatINR(inv.amount)} from ${inv.client}`,
      sub: `${Math.abs(inv.daysToDue)} days overdue`,
      actionLabel: "Collect",
      actionType: "collect",
      invoiceId: inv.id,
    });
  }

  // Low cash coming up — only when the forecast actually flags it.
  if (forecast && forecast.status !== "healthy") {
    actions.push({
      id: "lowcash",
      urgency: forecast.status === "risky" ? "urgent" : "warning",
      title: `Cash gets tight in about ${forecast.safeDays} days`,
      sub: "Collect a payment early to stay safe",
      actionLabel: "See why",
      actionType: "view",
    });
  }

  // Due soon → send a gentle reminder (warning).
  for (const inv of open.filter((i) => !i.overdue).sort((a, b) => a.daysToDue - b.daysToDue)) {
    actions.push({
      id: `remind-${inv.id}`,
      urgency: "warning",
      title: `Remind ${inv.client} — ${formatINR(inv.amount)}`,
      sub: `due in ${inv.daysToDue} day${inv.daysToDue === 1 ? "" : "s"}`,
      actionLabel: "Remind",
      actionType: "remind",
      invoiceId: inv.id,
    });
  }

  // Biggest regular bill coming up (info).
  const bill = money?.recurring
    .filter((r) => r.scope === "business")
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)[0];
  if (bill) {
    actions.push({
      id: `pay-${bill.counterparty}`,
      urgency: "info",
      title: `Pay ${bill.counterparty} — about ${formatINR(bill.monthlyAmount)}`,
      sub: "regular monthly bill",
      actionLabel: "Mark paid",
      actionType: "pay",
      pay: { name: bill.counterparty, amount: bill.monthlyAmount, category: bill.category },
    });
  }

  return actions.sort((a, b) => rank[a.urgency] - rank[b.urgency]).slice(0, 6);
}
