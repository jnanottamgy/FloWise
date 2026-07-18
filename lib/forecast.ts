// Plain-language cash forecast: will the owner run short, and when?
// Pure + deterministic. Nets ongoing income against outgo so it isn't doom-y.
import type { EnrichedInvoice } from "./types";
import { TODAY, daysBetween } from "./riskEngine";
import { formatDate } from "./format";
import { tf, type Lang } from "./i18n";

function isoAddDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface ForecastPoint {
  label: string;
  days: number;
  balance: number;
}

export type ForecastStatus = "healthy" | "watch" | "risky";

export interface Forecast {
  todayCash: number; // bank balance today
  points: ForecastPoint[];
  horizons: { d0: number; d7: number; d30: number; d90: number };
  safeDays: number; // days cash stays above the safety threshold (capped 90)
  low: { balance: number; days: number };
  threshold: number;
  status: ForecastStatus;
  ok: boolean; // status === "healthy"
  explanation: string;
}

/**
 * Project daily bank cash for 90 days: start at the bank balance, apply the net
 * daily flow (average outflow minus average ongoing inflow), and add each unpaid
 * invoice around when it should arrive.
 */
export function forecastCash(
  bankBalance: number,
  avgWeeklyOutflow: number,
  avgWeeklyInflow: number,
  unpaid: EnrichedInvoice[],
  lang: Lang = "en",
): Forecast {
  // Net daily burn (negative = the business is cash-positive and growing).
  const netDaily = (avgWeeklyOutflow - avgWeeklyInflow) / 7;
  const threshold = Math.max(50000, Math.round(avgWeeklyOutflow));

  // One-time receivables expected around their due date (overdue → ~3 days).
  const inflowByDay: Record<number, number> = {};
  for (const inv of unpaid) {
    let dd = daysBetween(TODAY, inv.dueDate);
    if (dd < 0) dd = 3;
    dd = Math.max(0, Math.min(90, dd));
    inflowByDay[dd] = (inflowByDay[dd] ?? 0) + inv.amount;
  }

  const balances: number[] = [];
  let cumRecv = 0;
  let low = { balance: bankBalance, days: 0 };
  let safeDays = 91;

  for (let d = 0; d <= 90; d++) {
    cumRecv += inflowByDay[d] ?? 0;
    const bal = bankBalance + cumRecv - netDaily * d;
    balances[d] = bal;
    if (bal < low.balance) low = { balance: Math.round(bal), days: d };
    if (bal < threshold && safeDays === 91) safeDays = d;
  }

  const sampleDays = [0, 7, 14, 21, 30, 45, 60, 75, 90];
  const points: ForecastPoint[] = sampleDays.map((d) => ({
    label: d === 0 ? "Today" : `${d}d`,
    days: d,
    balance: Math.round(balances[d]),
  }));

  const horizons = {
    d0: Math.round(balances[0]),
    d7: Math.round(balances[7]),
    d30: Math.round(balances[30]),
    d90: Math.round(balances[90]),
  };

  const cappedSafe = Math.min(safeDays, 90);
  const status: ForecastStatus =
    safeDays >= 90 && horizons.d90 >= threshold
      ? "healthy"
      : cappedSafe > 30
        ? "watch"
        : "risky";

  const dipDate = formatDate(isoAddDays(TODAY, cappedSafe));
  const explanation =
    status === "healthy"
      ? tf(lang, "fc.healthy")
      : status === "watch"
        ? tf(lang, "fc.watch", { days: cappedSafe, date: dipDate })
        : tf(lang, "fc.risky", { days: cappedSafe, date: dipDate });

  return {
    todayCash: Math.round(balances[0]),
    points,
    horizons,
    safeDays: cappedSafe,
    low,
    threshold,
    status,
    ok: status === "healthy",
    explanation,
  };
}
