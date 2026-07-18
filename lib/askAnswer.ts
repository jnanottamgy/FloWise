// A computed, plain-language answer for common owner questions — used as the
// fallback for Ask FloWise so the copilot NEVER dodges with "try asking X".
import { formatINR } from "./format";
import { categoryLabel } from "./labels";

export interface AskContext {
  businessName: string;
  outstanding: number;
  overdue: number;
  collected90d: number;
  topDebtors: { client: string; amount: number; overdue: boolean; days: number }[];
  realFreeCash: number;
  committedRecurring: number;
  moneyIn: number;
  moneyOut: number;
  byCategory: { category: string; amount: number }[];
  recurring: { counterparty: string; monthlyAmount: number; category: string }[];
}

export function deterministicAnswer(question: string, c: AskContext): string {
  const q = question.toLowerCase();
  const rs = (n: number) => formatINR(n);
  const safeToSpend = Math.max(0, c.realFreeCash - c.committedRecurring);
  const cat = (k: string) => categoryLabel(k);

  // Can I buy inventory / afford to spend
  if (/(inventory|stock|buy|purchase|afford|spend|invest|order|restock)/.test(q)) {
    return `You have ${rs(c.realFreeCash)} free after stock and bills. Keeping enough aside for your ${rs(c.committedRecurring)} of monthly bills, you can comfortably spend up to about ${rs(safeToSpend)} on stock this week.`;
  }

  // Enough for salaries / staff
  if (/(salary|salaries|staff|payroll|wages|workers|pay.*people)/.test(q)) {
    const sal = c.recurring.find((r) => /salar|payroll|wage|staff/i.test(r.category + r.counterparty));
    if (sal) {
      return c.realFreeCash >= sal.monthlyAmount
        ? `Yes — salaries are about ${rs(sal.monthlyAmount)} and you have ${rs(c.realFreeCash)} free, so you're covered.`
        : `Salaries are about ${rs(sal.monthlyAmount)} but you have only ${rs(c.realFreeCash)} free right now — collect a payment first to be safe.`;
    }
    return `You have ${rs(c.realFreeCash)} free right now to cover salaries and other bills.`;
  }

  // Who owes me / collections
  if (/(owe|owes|owed|collect|receivab|pay me|to receive|pending|outstanding|customers.*money)/.test(q)) {
    if (!c.topDebtors.length) return `Good news — no one owes you money right now, everything is paid.`;
    const top = c.topDebtors[0];
    const next = c.topDebtors[1]
      ? ` Next is ${c.topDebtors[1].client} (${rs(c.topDebtors[1].amount)}).`
      : "";
    return `${rs(c.outstanding)} is owed to you in total. ${top.client} owes the most — ${rs(top.amount)}${top.overdue ? `, ${top.days} days overdue` : ""}.${next}`;
  }

  // Overdue / late
  if (/(overdue|late|not paid|delay|pending payment)/.test(q)) {
    const od = c.topDebtors.filter((d) => d.overdue);
    return od.length
      ? `${od.length} payment${od.length > 1 ? "s are" : " is"} overdue, worth ${rs(od.reduce((s, d) => s + d.amount, 0))}. Biggest: ${od[0].client} (${rs(od[0].amount)}, ${od[0].days} days late).`
      : `Nothing is overdue right now — nicely done.`;
  }

  // Why is cash reducing
  if (/(reducing|going down|dropping|losing|drain|why.*cash|cash.*(low|less|short)|running out)/.test(q)) {
    const top = c.byCategory[0];
    return `Recently ${rs(c.moneyOut)} went out and ${rs(c.moneyIn)} came in. The biggest drains are ${top ? `${cat(top.category)} (${rs(top.amount)})` : "your regular bills"} and about ${rs(c.committedRecurring)}/month in recurring bills. Collecting the ${rs(c.outstanding)} owed to you would help most.`;
  }

  // Biggest expense
  if (/(biggest|most|largest|highest|main).*(expense|spend|cost|bill|going)|where.*money.*go/.test(q)) {
    const top = c.byCategory[0];
    if (!top) return `No major business expenses recorded yet.`;
    const next = c.byCategory[1] ? ` Then ${cat(c.byCategory[1].category)} (${rs(c.byCategory[1].amount)}).` : "";
    return `Your biggest business expense is ${cat(top.category)} at ${rs(top.amount)}.${next}`;
  }

  // Profit / net
  if (/(profit|net|making money|earning|surplus|loss)/.test(q)) {
    const net = c.moneyIn - c.moneyOut;
    return net >= 0
      ? `Money in was ${rs(c.moneyIn)} and out was ${rs(c.moneyOut)} — a surplus of ${rs(net)}.`
      : `Recently ${rs(c.moneyOut)} went out and ${rs(c.moneyIn)} came in — ${rs(Math.abs(net))} more going out. Collecting the ${rs(c.outstanding)} owed to you would balance it.`;
  }

  // Spend on a specific category (labour, rent, transport…)
  const catMatch = c.byCategory.find(
    (x) => q.includes(x.category) || q.includes(cat(x.category).toLowerCase().split(" ")[0]),
  );
  if (catMatch) {
    return `You've spent ${rs(catMatch.amount)} on ${cat(catMatch.category)} recently.`;
  }

  // What should I do today
  if (/(what should i do|today|priorit|next|focus|first)/.test(q)) {
    const top = c.topDebtors[0];
    return top
      ? `Today: chase ${top.client} for ${rs(top.amount)}${top.overdue ? ` (${top.days} days overdue)` : ""}, and keep ${rs(c.committedRecurring)} aside for this month's bills. You have ${rs(c.realFreeCash)} free.`
      : `You're in good shape — ${rs(c.realFreeCash)} free and nothing overdue. Keep collecting on time.`;
  }

  // Default: a useful one-liner
  return `Here's the picture: ${rs(c.realFreeCash)} free to spend, ${rs(c.outstanding)} owed to you by customers, and about ${rs(c.committedRecurring)} in bills each month.`;
}
