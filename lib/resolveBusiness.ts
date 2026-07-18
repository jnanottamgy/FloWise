import "server-only";
import { getBusiness } from "./businesses";
import type { Business, Invoice, InvoiceStatus } from "./types";

/** Coerce a loosely-typed invoice (e.g. from an upload) into our shape,
 *  deriving `status` from the dates when it isn't supplied. */
function normalizeInvoice(raw: Record<string, unknown>): Invoice {
  const paidDate = (raw.paidDate as string | null) || null;
  const dueDate = String(raw.dueDate ?? "");
  let status = raw.status as InvoiceStatus | undefined;
  if (!status) {
    if (paidDate) status = paidDate > dueDate ? "paid_late" : "paid";
    else status = "unpaid";
  }
  return {
    id: String(raw.id ?? ""),
    client: String(raw.client ?? "Unknown client"),
    amount: Number(raw.amount ?? 0),
    issueDate: String(raw.issueDate ?? ""),
    dueDate,
    paidDate,
    status,
  };
}

/** Build a Business from an arbitrary uploaded payload. */
export function normalizeBusiness(raw: Record<string, unknown>): Business {
  const invoices = Array.isArray(raw.invoices)
    ? (raw.invoices as Record<string, unknown>[]).map(normalizeInvoice)
    : [];
  return {
    id: String(raw.id ?? "custom"),
    name: String(raw.name ?? "My Business"),
    industry: String(raw.industry ?? "Small business"),
    email: String(raw.email ?? "accounts@business.example"),
    invoices,
  };
}

/** Resolve the target business from a GET query (?business=<id>).
 *  Defaults to the first sample for convenient testing. */
export function resolveFromQuery(searchParams: URLSearchParams): Business | null {
  const id = searchParams.get("business");
  if (!id) return getBusiness("aria-textiles") ?? null;
  return getBusiness(id) ?? null;
}

/** Resolve from a POST body: { businessId } (sample) or { business } (custom). */
export function resolveFromBody(
  body: Record<string, unknown>,
): Business | null {
  if (typeof body?.businessId === "string") {
    return getBusiness(body.businessId) ?? null;
  }
  if (body?.business && typeof body.business === "object") {
    return normalizeBusiness(body.business as Record<string, unknown>);
  }
  return null;
}
