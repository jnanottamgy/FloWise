import type { ActiveBusiness } from "./businessContext";
import type {
  InvoicesResponse,
  SummaryResponse,
  TransactionsResponse,
} from "./types";

// Client-side fetchers. Samples are read by id (GET ?business=<id>); custom
// workspaces POST their invoices so the server can score them the same way.

function customBody(active: ActiveBusiness) {
  return {
    business: {
      id: active.id,
      name: active.name,
      industry: active.industry,
      email: active.email,
      invoices: active.invoices ?? [],
    },
  };
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function fetchSummary(
  active: ActiveBusiness,
): Promise<SummaryResponse> {
  if (active.isCustom) {
    return readJson(
      await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customBody(active)),
      }),
    );
  }
  return readJson(
    await fetch(`/api/summary?business=${encodeURIComponent(active.id)}`),
  );
}

export async function fetchInsight(
  active: ActiveBusiness,
): Promise<{ aiSummary: string }> {
  if (active.isCustom) {
    return readJson(
      await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customBody(active)),
      }),
    );
  }
  return readJson(
    await fetch(`/api/insight?business=${encodeURIComponent(active.id)}`),
  );
}

export async function fetchInvoices(
  active: ActiveBusiness,
): Promise<InvoicesResponse> {
  if (active.isCustom) {
    return readJson(
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customBody(active)),
      }),
    );
  }
  return readJson(
    await fetch(`/api/invoices?business=${encodeURIComponent(active.id)}`),
  );
}

export async function fetchTransactions(
  active: ActiveBusiness,
): Promise<TransactionsResponse> {
  if (active.isCustom) {
    return readJson(
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: {
            id: active.id,
            name: active.name,
            industry: active.industry,
            email: active.email,
          },
          transactions: active.transactions ?? [],
          bankBalance: active.bankBalance ?? 0,
        }),
      }),
    );
  }
  return readJson(
    await fetch(`/api/transactions?business=${encodeURIComponent(active.id)}`),
  );
}

export async function postFollowup(
  active: ActiveBusiness,
  invoiceId: string,
): Promise<{ draft: string }> {
  const body = active.isCustom
    ? { ...customBody(active), invoiceId }
    : { businessId: active.id, invoiceId };
  return readJson(
    await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}
