import { NextResponse, type NextRequest } from "next/server";
import { enrichInvoices } from "@/lib/riskEngine";
import { computeMetrics } from "@/lib/metrics";
import { computeMoneyMetrics } from "@/lib/transactions";
import { callGemma } from "@/lib/ai";
import { getBusiness } from "@/lib/businesses";
import { getBankBalance, getTransactions } from "@/lib/transactionsData";
import { normalizeBusiness } from "@/lib/resolveBusiness";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/labels";
import { deterministicAnswer, type AskContext } from "@/lib/askAnswer";
import { callerKey, rateLimit } from "@/lib/ratelimit";
import type { Lang } from "@/lib/i18n";
import type { Business, MoneyMetrics, Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildContext(
  business: Business,
  money: MoneyMetrics | null,
): string {
  const enriched = enrichInvoices(business.invoices);
  const m = computeMetrics(business.invoices);
  const flagged = enriched.filter((i) => i.risk !== "green");

  const lines = [
    `Business: ${business.name} (${business.industry}). Today is 2026-07-18.`,
    `Receivables — outstanding (unpaid invoices): ${formatINR(m.outstanding)}; overdue: ${formatINR(m.overdue)}; collected last 90 days: ${formatINR(m.collected90d)}; collection rate ${m.collectionRatePct}%.`,
    `Who owes money (flagged): ${
      flagged
        .map(
          (i) =>
            `${i.client} (${i.id}) ${formatINR(i.amount)} ${i.overdue ? `${Math.abs(i.daysToDue)}d overdue` : `due in ${i.daysToDue}d`}`,
        )
        .join("; ") || "none"
    }.`,
  ];

  if (money) {
    lines.push(
      `Cash flow (recent period) — money in: ${formatINR(money.moneyIn)}; money out: ${formatINR(money.moneyOut)}; net: ${formatINR(money.net)}.`,
      `Business spend: ${formatINR(money.businessOut)}; personal spend: ${formatINR(money.personalOut)}.`,
      `Real free cash: ${formatINR(money.realFreeCash)} (bank ${formatINR(money.bankBalance)} minus ${formatINR(money.lockedInStock)} tied in stock and ${formatINR(money.committedRecurring)} monthly bills). Runway about ${money.runwayWeeks} weeks.`,
      `Top expense categories: ${money.byCategory.slice(0, 6).map((c) => `${categoryLabel(c.category)} ${formatINR(c.amount)}`).join(", ")}.`,
      `Recurring expenses: ${money.recurring.map((r) => `${r.counterparty} ${formatINR(r.monthlyAmount)}/mo`).join(", ") || "none"}.`,
    );
  }
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const question =
    typeof body.question === "string" ? body.question.trim().slice(0, 500) : "";
  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const sample =
    typeof body.businessId === "string" ? getBusiness(body.businessId) : undefined;
  const custom =
    body.business && typeof body.business === "object"
      ? normalizeBusiness(body.business as Record<string, unknown>)
      : undefined;
  const business = sample ?? custom;
  if (!business) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }

  let money: MoneyMetrics | null = null;
  if (sample) {
    money = computeMoneyMetrics(getTransactions(business.id), getBankBalance(business.id));
  } else if (Array.isArray(body.transactions)) {
    money = computeMoneyMetrics(
      // Cap an untrusted client payload so a huge array can't DoS the compute.
      (body.transactions as Transaction[]).slice(0, 5000),
      typeof body.bankBalance === "number" ? body.bankBalance : 0,
    );
  }

  // A computed answer — always sensible, used as the fallback so we never dodge.
  const enriched = enrichInvoices(business.invoices);
  const invMetrics = computeMetrics(business.invoices);
  const topDebtors = enriched
    .filter((i) => i.status === "unpaid")
    .sort((a, b) => b.amount - a.amount)
    .map((i) => ({
      client: i.client,
      amount: i.amount,
      overdue: i.overdue,
      days: Math.abs(i.daysToDue),
    }));
  const askCtx: AskContext = {
    businessName: business.name,
    outstanding: invMetrics.outstanding,
    overdue: invMetrics.overdue,
    collected90d: invMetrics.collected90d,
    topDebtors,
    realFreeCash: money?.realFreeCash ?? 0,
    committedRecurring: money?.committedRecurring ?? 0,
    moneyIn: money?.moneyIn ?? 0,
    moneyOut: money?.moneyOut ?? 0,
    byCategory: money?.byCategory ?? [],
    recurring: money?.recurring ?? [],
  };
  const rawLang = typeof body.lang === "string" ? body.lang : "en";
  const lang: Lang = rawLang === "hi" || rawLang === "kn" ? rawLang : "en";
  const langName = lang === "hi" ? "Hindi" : lang === "kn" ? "Kannada" : "English";

  const fallback = deterministicAnswer(question, askCtx, lang);

  const context = buildContext(business, money);
  const prompt =
    `You are FloWise, a warm, plain-talking money assistant for an Indian small business owner. ` +
    `Answer the owner's question using ONLY the data below. Reply in ${langName}, in ONE short paragraph ` +
    `(max 3 sentences), in simple language, keeping the rupee figures. If the data does not contain the answer, say so briefly.\n\n` +
    `DATA:\n${context}\n\nQUESTION: ${question}`;

  // Cap AI-route usage per caller; when tripped, serve the (instant, correct)
  // deterministic answer instead of burning the owner's Gemini quota.
  if (!rateLimit(`ask:${callerKey(req)}`)) {
    return NextResponse.json({ answer: fallback });
  }

  const answer = await callGemma(prompt, fallback);
  return NextResponse.json({ answer });
}
