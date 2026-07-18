// Plain-language cash forecast: will the owner run short, and when?
// Pure + deterministic.
import type { EnrichedInvoice } from "./types";
import { TODAY, daysBetween } from "./riskEngine";
import { formatDate, formatINR } from "./format";

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

export interface Forecast {
  todayCash: number;
  points: ForecastPoint[];
  horizons: { d0: number; d7: number; d30: number; d90: number };
  safeDays: number; // days cash stays above the safety threshold (capped 90)
  low: { balance: number; days: number };
  threshold: number;
  ok: boolean;
  explanation: string;
}

/**
 * Project daily cash for 90 days: start at bank balance, drain at the average
 * daily outflow, and add each unpaid invoice around when it should arrive.
 */
export function forecastCash(
  bankBalance: number,
  avgWeeklyOutflow: number,
  unpaid: EnrichedInvoice[],
): Forecast {
  const avgDaily = avgWeeklyOutflow / 7;
  const threshold = Math.max(50000, Math.round(avgWeeklyOutflow));

  // Expected inflow per day-offset (overdue expected within ~3 days).
  const inflowByDay: Record<number, number> = {};
  for (const inv of unpaid) {
    let dd = daysBetween(TODAY, inv.dueDate);
    if (dd < 0) dd = 3;
    dd = Math.max(0, Math.min(90, dd));
    inflowByDay[dd] = (inflowByDay[dd] ?? 0) + inv.amount;
  }

  const balances: number[] = [];
  let cumInflow = 0;
  let low = { balance: bankBalance, days: 0 };
  let safeDays = 91;

  for (let d = 0; d <= 90; d++) {
    cumInflow += inflowByDay[d] ?? 0;
    const bal = bankBalance + cumInflow - avgDaily * d;
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

  const ok = safeDays > 30;
  const cappedSafe = Math.min(safeDays, 90);
  const explanation = ok
    ? `You have enough cash for at least the next ${cappedSafe >= 90 ? "90+" : cappedSafe} days. You're on track.`
    : `Cash may fall to about ${formatINR(low.balance)} around ${formatDate(
        isoAddDays(TODAY, low.days),
      )} because regular bills like salaries and rent are due. Collecting a couple of payments early will keep you safe.`;

  return {
    todayCash: Math.round(balances[0]),
    points,
    horizons,
    safeDays: cappedSafe,
    low,
    threshold,
    ok,
    explanation,
  };
}
