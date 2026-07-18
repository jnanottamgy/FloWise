// Free, client-side report exports (no libraries, no services).
import type {
  EnrichedInvoice,
  Metrics,
  MoneyMetrics,
  Transaction,
} from "./types";
import { formatDate, formatINR } from "./format";
import { categoryLabel } from "./labels";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csvRow(vals: unknown[]): string {
  return vals.map(csvCell).join(",");
}

export function transactionsCSV(txns: Transaction[]): string {
  const header = [
    "Date", "Counterparty", "Description", "Direction",
    "Mode", "Scope", "Category", "Amount",
  ];
  const rows = txns.map((t) =>
    csvRow([t.date, t.counterparty, t.description, t.direction, t.mode, t.scope, t.category, t.amount]),
  );
  return [csvRow(header), ...rows].join("\n");
}

export function invoicesCSV(invoices: EnrichedInvoice[]): string {
  const header = [
    "Invoice", "Client", "Amount", "Issue Date",
    "Due Date", "Paid Date", "Status", "Risk",
  ];
  const rows = invoices.map((i) =>
    csvRow([i.id, i.client, i.amount, i.issueDate, i.dueDate, i.paidDate ?? "", i.status, i.risk]),
  );
  return [csvRow(header), ...rows].join("\n");
}

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

function table(headers: string[], rows: string[][]): string {
  return (
    `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`
  );
}

export interface ReportData {
  businessName: string;
  industry: string;
  generatedOn: string; // human date
  aiSummary: string;
  summary: Metrics;
  money?: MoneyMetrics;
  invoices: EnrichedInvoice[];
}

/** A self-contained, print-ready HTML report (browser "Save as PDF"). */
export function reportHTML(d: ReportData): string {
  const flagged = d.invoices
    .filter((i) => i.risk !== "green")
    .sort((a, b) => (a.risk === "red" ? -1 : 1) - (b.risk === "red" ? -1 : 1) || b.amount - a.amount);

  const kpi = (label: string, value: string) =>
    `<div class="kpi"><div class="k-label">${esc(label)}</div><div class="k-val">${esc(value)}</div></div>`;

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>FloWise report — ${esc(d.businessName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #111; margin: 0; padding: 40px; background: #fff; }
  h1 { font-size: 26px; margin: 0 0 2px; }
  .sub { color: #777; font-size: 13px; margin-bottom: 20px; }
  .logo { color: #5F786A; font-weight: 700; letter-spacing: .02em; }
  .summary { background: #f4f6f4; border-radius: 14px; padding: 16px; font-size: 14px; line-height: 1.6; margin: 16px 0 24px; }
  .kpis { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
  .kpi { flex: 1 1 140px; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 12px; }
  .k-label { color: #777; font-size: 12px; }
  .k-val { font-size: 20px; font-weight: 700; margin-top: 4px; }
  h2 { font-size: 15px; margin: 24px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid rgba(0,0,0,.07); }
  th { color: #777; font-weight: 600; }
  .foot { color: #999; font-size: 11px; margin-top: 28px; }
  @media print { body { padding: 24px; } .kpi { break-inside: avoid; } }
</style></head><body>
  <div class="logo">✳ FloWise</div>
  <h1>${esc(d.businessName)}</h1>
  <div class="sub">${esc(d.industry)} · Cash-flow report · ${esc(d.generatedOn)}</div>

  <div class="summary">${esc(d.aiSummary)}</div>

  <div class="kpis">
    ${kpi("Outstanding", formatINR(d.summary.outstanding))}
    ${kpi("Overdue", formatINR(d.summary.overdue))}
    ${kpi("Flagged", String(d.summary.flaggedCount))}
    ${kpi("Collected (90d)", formatINR(d.summary.collected90d))}
    ${d.money ? kpi("Real free cash", formatINR(d.money.realFreeCash)) : ""}
    ${d.money ? kpi("Runway", `${d.money.runwayWeeks} weeks`) : ""}
  </div>

  <h2>Flagged invoices</h2>
  ${
    flagged.length
      ? table(
          ["Invoice", "Client", "Amount", "Due", "Risk", "Reason"],
          flagged.map((i) => [
            i.id, i.client, formatINR(i.amount), formatDate(i.dueDate),
            i.risk === "red" ? "At risk" : "Watch", i.aiReason ?? "",
          ]),
        )
      : "<p style='font-size:13px;color:#777'>None — all caught up.</p>"
  }

  ${
    d.money
      ? `<h2>Business spend by category (tax drawer)</h2>${table(
          ["Category", "Amount"],
          d.money.byCategory.map((c) => [categoryLabel(c.category), formatINR(c.amount)]),
        )}
        <h2>Recurring expenses</h2>${table(
          ["Payee", "Per month", "Category"],
          d.money.recurring.map((r) => [r.counterparty, formatINR(r.monthlyAmount), categoryLabel(r.category)]),
        )}`
      : ""
  }

  <div class="foot">Generated by FloWise. Figures are from your own data. Not tax or financial advice.</div>
</body></html>`;
}
