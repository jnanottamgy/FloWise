import type {
  CategoryTotal,
  ModeTotal,
  MoneyMetrics,
  RecurringItem,
  Transaction,
  TxnMode,
} from "./types";
import { TODAY, daysBetween } from "./riskEngine";

const MODES: TxnMode[] = ["upi", "neft", "imps", "rtgs", "card", "cash", "cheque"];

function sum(txns: Transaction[]): number {
  return txns.reduce((s, t) => s + t.amount, 0);
}

/** Group outflows by counterparty and surface the recurring ones (repeat
 *  payees, or anything explicitly flagged recurring). Amounts are monthly. */
function detectRecurring(txns: Transaction[]): RecurringItem[] {
  const out = txns.filter((t) => t.direction === "out");
  const groups = new Map<string, Transaction[]>();
  for (const t of out) {
    const g = groups.get(t.counterparty) ?? [];
    g.push(t);
    groups.set(t.counterparty, g);
  }
  const items: RecurringItem[] = [];
  for (const [counterparty, g] of groups) {
    const isRecurring = g.length >= 2 || g.some((t) => t.recurring);
    if (!isRecurring) continue;
    const monthlyAmount = Math.round(sum(g) / g.length);
    items.push({
      counterparty,
      monthlyAmount,
      occurrences: g.length,
      category: g[0].category,
      scope: g[0].scope,
    });
  }
  return items.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

/**
 * All money numbers for a business, computed purely from its transactions.
 * PURE (no fs / globals) so it runs the same on server and client.
 */
export function computeMoneyMetrics(
  transactions: Transaction[],
  bankBalance: number,
): MoneyMetrics {
  const ins = transactions.filter((t) => t.direction === "in");
  const outs = transactions.filter((t) => t.direction === "out");

  const moneyIn = sum(ins);
  const moneyOut = sum(outs);

  const businessIn = sum(ins.filter((t) => t.scope === "business"));
  const businessOut = sum(outs.filter((t) => t.scope === "business"));
  const personalOut = sum(outs.filter((t) => t.scope === "personal"));
  const unsureCount = transactions.filter((t) => t.scope === "unsure").length;

  // Money still tied up in stock bought recently (paid, not yet recouped).
  const lockedInStock = sum(
    outs.filter(
      (t) => t.tiedToStock && daysBetween(t.date, TODAY) >= 0 && daysBetween(t.date, TODAY) <= 45,
    ),
  );

  const recurring = detectRecurring(transactions);
  const recurringMonthlyTotal = recurring.reduce((s, r) => s + r.monthlyAmount, 0);
  const committedRecurring = recurring
    .filter((r) => r.scope === "business")
    .reduce((s, r) => s + r.monthlyAmount, 0);

  const realFreeCash = Math.max(
    0,
    bankBalance - lockedInStock - committedRecurring,
  );

  // Weeks covered by the data window (min 1 to avoid divide-by-zero).
  const earliest = transactions.reduce(
    (min, t) => (t.date < min ? t.date : min),
    TODAY,
  );
  const days = Math.max(7, daysBetween(earliest, TODAY));
  const weeks = days / 7;
  const avgWeeklyOutflow = Math.round(moneyOut / weeks);
  const runwayWeeks =
    avgWeeklyOutflow > 0
      ? Math.round((realFreeCash / avgWeeklyOutflow) * 10) / 10
      : 99;

  const byMode: ModeTotal[] = MODES.map((mode) => ({
    mode,
    inAmount: sum(ins.filter((t) => t.mode === mode)),
    outAmount: sum(outs.filter((t) => t.mode === mode)),
  })).filter((m) => m.inAmount > 0 || m.outAmount > 0);

  // Business outflow by category (feeds the Tax Drawer).
  const catMap = new Map<string, number>();
  for (const t of outs.filter((t) => t.scope === "business")) {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
  }
  const byCategory: CategoryTotal[] = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    bankBalance,
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
    businessIn,
    businessOut,
    personalOut,
    unsureCount,
    lockedInStock,
    committedRecurring,
    realFreeCash,
    avgWeeklyOutflow,
    runwayWeeks,
    byMode,
    byCategory,
    recurring,
    recurringMonthlyTotal,
  };
}
