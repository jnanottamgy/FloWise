import { NextResponse, type NextRequest } from "next/server";
import { enrichInvoices } from "@/lib/riskEngine";
import { generateFollowup } from "@/lib/ai";
import { resolveFromBody, resolveFromQuery } from "@/lib/resolveBusiness";

export const dynamic = "force-dynamic";

// POST { businessId | business, invoiceId } -> { draft }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const business =
    resolveFromBody(body) ?? resolveFromQuery(req.nextUrl.searchParams);
  if (!business) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }

  const invoiceId = typeof body?.invoiceId === "string" ? body.invoiceId : null;
  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
  }

  const invoice = enrichInvoices(business.invoices).find(
    (i) => i.id === invoiceId,
  );
  if (!invoice) {
    return NextResponse.json({ error: "Unknown invoice" }, { status: 404 });
  }

  const draft = await generateFollowup(business, invoice);
  return NextResponse.json({ draft });
}
