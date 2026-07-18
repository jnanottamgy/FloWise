// Auto-generated "what should I do today" list — the heart of the redesign.
import type { EnrichedInvoice, MoneyMetrics } from "./types";
import type { Forecast } from "./forecast";
import { formatINR } from "./format";
import { tf, type Lang } from "./i18n";

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
  lang: Lang = "en",
): Action[] {
  const actions: Action[] = [];
  const open = invoices.filter((i) => i.risk !== "green" && !sentIds.has(i.id));

  // Overdue → collect now (urgent).
  for (const inv of open.filter((i) => i.overdue).sort((a, b) => b.amount - a.amount)) {
    actions.push({
      id: `collect-${inv.id}`,
      urgency: "urgent",
      title: tf(lang, "act.collectFrom", { amount: formatINR(inv.amount), client: inv.client }),
      sub: tf(lang, "act.overdue", { days: Math.abs(inv.daysToDue) }),
      actionLabel: tf(lang, "act.collect"),
      actionType: "collect",
      invoiceId: inv.id,
    });
  }

  // Low cash coming up — only when the forecast actually flags it.
  if (forecast && forecast.status !== "healthy") {
    actions.push({
      id: "lowcash",
      urgency: forecast.status === "risky" ? "urgent" : "warning",
      title: tf(lang, "act.lowCash", { days: forecast.safeDays }),
      sub: tf(lang, "act.lowCashSub"),
      actionLabel: tf(lang, "act.seeWhy"),
      actionType: "view",
    });
  }

  // Due soon → send a gentle reminder (warning).
  for (const inv of open.filter((i) => !i.overdue).sort((a, b) => a.daysToDue - b.daysToDue)) {
    actions.push({
      id: `remind-${inv.id}`,
      urgency: "warning",
      title: tf(lang, "act.remindClient", { client: inv.client, amount: formatINR(inv.amount) }),
      sub: tf(lang, "act.dueIn", { days: inv.daysToDue }),
      actionLabel: tf(lang, "act.remind"),
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
      title: tf(lang, "act.payBill", { name: bill.counterparty, amount: formatINR(bill.monthlyAmount) }),
      sub: tf(lang, "act.monthlyBill"),
      actionLabel: tf(lang, "act.markPaid"),
      actionType: "pay",
      pay: { name: bill.counterparty, amount: bill.monthlyAmount, category: bill.category },
    });
  }

  return actions.sort((a, b) => rank[a.urgency] - rank[b.urgency]).slice(0, 6);
}
