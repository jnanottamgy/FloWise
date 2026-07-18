import { NextResponse, type NextRequest } from "next/server";
import { computeMoneyMetrics } from "@/lib/transactions";
import { getBankBalance, getTransactions } from "@/lib/transactionsData";
import { getBusiness } from "@/lib/businesses";
import { normalizeBusiness } from "@/lib/resolveBusiness";
import type {
  BusinessMeta,
  Transaction,
  TransactionsResponse,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function metaOf(b: {
  id: string;
  name: string;
  industry: string;
  email: string;
}): BusinessMeta {
  return { id: b.id, name: b.name, industry: b.industry, email: b.email };
}

function build(
  meta: BusinessMeta,
  transactions: Transaction[],
  bankBalance: number,
): TransactionsResponse {
  return {
    business: meta,
    transactions,
    metrics: computeMoneyMetrics(transactions, bankBalance),
  };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("business") ?? "aria-textiles";
  const b = getBusiness(id);
  if (!b) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }
  return NextResponse.json(
    build(metaOf(b), getTransactions(id), getBankBalance(id)),
  );
}

// POST accepts an id (sample), and/or client-supplied transactions + balance
// (custom/uploaded businesses, or edited scopes from Mine-vs-Business).
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const sample =
    typeof body.businessId === "string" ? getBusiness(body.businessId) : undefined;
  const custom =
    body.business && typeof body.business === "object"
      ? normalizeBusiness(body.business as Record<string, unknown>)
      : undefined;
  const b = sample ?? custom;
  if (!b) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }

  const transactions = Array.isArray(body.transactions)
    ? (body.transactions as Transaction[])
    : sample
      ? getTransactions(b.id)
      : [];
  const bankBalance =
    typeof body.bankBalance === "number"
      ? body.bankBalance
      : sample
        ? getBankBalance(b.id)
        : 0;

  return NextResponse.json(build(metaOf(b), transactions, bankBalance));
}
