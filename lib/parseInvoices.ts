import type { Invoice, InvoiceStatus } from "./types";

// Client-safe (no server-only imports): parse & validate a pasted/uploaded
// invoice list, as either JSON (array or { invoices: [...] }) or CSV with
// header: id,client,amount,issueDate,dueDate,paidDate,status

export interface ParseResult {
  invoices: Invoice[];
  errors: string[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normStatus(
  paidDate: string | null,
  dueDate: string,
  status?: string,
): InvoiceStatus {
  if (status === "paid" || status === "paid_late" || status === "unpaid") {
    return status;
  }
  if (paidDate) return paidDate > dueDate ? "paid_late" : "paid";
  return "unpaid";
}

function validateRow(
  row: Record<string, unknown>,
  idx: number,
  errors: string[],
): Invoice | null {
  const required = ["id", "client", "amount", "issueDate", "dueDate"] as const;
  const missing = required.filter(
    (k) => row[k] === undefined || row[k] === null || String(row[k]).trim() === "",
  );
  if (missing.length) {
    errors.push(`Row ${idx + 1}: missing ${missing.join(", ")}`);
    return null;
  }

  const amount = Number(row.amount);
  if (Number.isNaN(amount)) {
    errors.push(`Row ${idx + 1}: amount "${String(row.amount)}" is not a number`);
    return null;
  }

  for (const k of ["issueDate", "dueDate"] as const) {
    if (!DATE_RE.test(String(row[k]))) {
      errors.push(`Row ${idx + 1}: ${k} must be YYYY-MM-DD`);
      return null;
    }
  }

  const rawPaid = row.paidDate;
  const paidDate =
    rawPaid && String(rawPaid).trim() && String(rawPaid).trim() !== "null"
      ? String(rawPaid).trim()
      : null;
  if (paidDate && !DATE_RE.test(paidDate)) {
    errors.push(`Row ${idx + 1}: paidDate must be YYYY-MM-DD or empty`);
    return null;
  }

  return {
    id: String(row.id).trim(),
    client: String(row.client).trim(),
    amount,
    issueDate: String(row.issueDate).trim(),
    dueDate: String(row.dueDate).trim(),
    paidDate,
    status: normStatus(
      paidDate,
      String(row.dueDate).trim(),
      row.status ? String(row.status).trim() : undefined,
    ),
  };
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

export function parseInvoices(text: string): ParseResult {
  const t = text.trim();
  if (!t) return { invoices: [], errors: ["Paste or upload some invoices first."] };

  let rows: Record<string, unknown>[] | null = null;

  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) rows = parsed;
      else if (Array.isArray(parsed.invoices)) rows = parsed.invoices;
      else return { invoices: [], errors: ["JSON must be an array or { invoices: [...] }."] };
    } catch (e) {
      return { invoices: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
    }
  } else {
    rows = parseCSV(t);
    if (!rows.length) {
      return {
        invoices: [],
        errors: ["CSV needs a header row and at least one invoice."],
      };
    }
  }

  if (!rows) return { invoices: [], errors: ["No invoices found."] };

  const errors: string[] = [];
  const invoices: Invoice[] = [];
  rows.forEach((r, i) => {
    const v = validateRow(r, i, errors);
    if (v) invoices.push(v);
  });
  if (!invoices.length && !errors.length) errors.push("No invoices found.");
  return { invoices, errors };
}

// ---- Downloadable templates -------------------------------------------------

export const TEMPLATE_CSV = `id,client,amount,issueDate,dueDate,paidDate,status
INV-1,Acme Corp,45000,2026-05-02,2026-05-16,2026-05-15,paid
INV-2,Acme Corp,60000,2026-07-01,2026-07-15,,unpaid
INV-3,Blue Diner,25000,2026-06-20,2026-07-04,,unpaid`;

export const TEMPLATE_JSON = JSON.stringify(
  {
    name: "My Business",
    industry: "Small business",
    invoices: [
      { id: "INV-1", client: "Acme Corp", amount: 45000, issueDate: "2026-05-02", dueDate: "2026-05-16", paidDate: "2026-05-15", status: "paid" },
      { id: "INV-2", client: "Acme Corp", amount: 60000, issueDate: "2026-07-01", dueDate: "2026-07-15", paidDate: null, status: "unpaid" },
      { id: "INV-3", client: "Blue Diner", amount: 25000, issueDate: "2026-06-20", dueDate: "2026-07-04", paidDate: null, status: "unpaid" },
    ],
  },
  null,
  2,
);
