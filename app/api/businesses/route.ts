import { NextResponse } from "next/server";
import { listBusinessCards } from "@/lib/businesses";

export const dynamic = "force-dynamic";

// Sample businesses for the onboarding picker. GET and POST return the same
// list (POST is provided for symmetry with the other endpoints).
export async function GET() {
  return NextResponse.json({ businesses: listBusinessCards() });
}

export async function POST() {
  return NextResponse.json({ businesses: listBusinessCards() });
}
