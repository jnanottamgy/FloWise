"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "./businessContext";
import {
  fetchInsight,
  fetchInvoices,
  fetchSummary,
  fetchTransactions,
} from "./api";

/** Metrics for the active business (instant — no AI). */
export function useSummary() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["summary", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchSummary(activeBusiness!),
  });
}

/** AI cash-flow narrative for the active business (loads separately/slowly). */
export function useInsight() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["insight", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchInsight(activeBusiness!),
    staleTime: 5 * 60_000,
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

/** All money transactions + money metrics for the active business. */
export function useTransactions() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["transactions", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchTransactions(activeBusiness!),
  });
}
