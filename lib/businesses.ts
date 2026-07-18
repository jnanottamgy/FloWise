import "server-only";
import businessData from "@/data/businesses.json";
import type { Business, BusinessSummaryCard } from "./types";
import { computeMetrics } from "./metrics";

// data/businesses.json is authored by hand; assert its shape once here.
const BUSINESSES = (businessData as unknown as { businesses: Business[] })
  .businesses;

/** All preloaded sample businesses (with invoices). */
export function loadBusinesses(): Business[] {
  return BUSINESSES;
}

/** A single sample business by id, or undefined. */
export function getBusiness(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}

/** Lightweight cards for the onboarding picker (no raw invoices). */
export function listBusinessCards(): BusinessSummaryCard[] {
  return BUSINESSES.map((b) => {
    const m = computeMetrics(b.invoices);
    return {
      id: b.id,
      name: b.name,
      industry: b.industry,
      email: b.email,
      invoiceCount: b.invoices.length,
      outstanding: m.outstanding,
      flaggedCount: m.flaggedCount,
    };
  });
}
