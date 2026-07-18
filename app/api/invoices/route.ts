import { NextResponse, type NextRequest } from "next/server";
import { enrichInvoices } from "@/lib/riskEngine";
import { attachReasons } from "@/lib/ai";
import { resolveFromBody, resolveFromQuery } from "@/lib/resolveBusiness";
import type { Business, InvoicesResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

function build(business: Business): InvoicesResponse {
  const invoices = attachReasons(enrichInvoices(business.invoices));
  return {
    business: {
      id: business.id,
      name: business.name,
      industry: business.industry,
      email: business.email,
    },
    invoices,
  };
}

export async function GET(req: NextRequest) {
  const business = resolveFromQuery(req.nextUrl.searchParams);
  if (!business) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }
  return NextResponse.json(build(business));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const business =
    resolveFromBody(body) ?? resolveFromQuery(req.nextUrl.searchParams);
  if (!business) {
    return NextResponse.json({ error: "Unknown business" }, { status: 404 });
  }
  return NextResponse.json(build(business));
}
