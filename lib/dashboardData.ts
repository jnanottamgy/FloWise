"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "./businessContext";
import { fetchInvoices, fetchSummary } from "./api";

/** Summary + metrics + AI summary for the active business. */
export function useSummary() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["summary", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchSummary(activeBusiness!),
  });
}

/** Enriched invoices (with AI reasons for flagged) for the active business. */
export function useInvoices() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["invoices", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchInvoices(activeBusiness!),
  });
}
