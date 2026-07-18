"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "./businessContext";
import { useDashboardState } from "./dashboardState";
import { computeMoneyMetrics } from "./transactions";
import type { TransactionsResponse } from "./types";
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

/** Raw money transactions + server metrics for the active business. */
export function useTransactions() {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["transactions", activeBusiness?.id],
    enabled: Boolean(activeBusiness),
    queryFn: () => fetchTransactions(activeBusiness!),
  });
}

/**
 * Transactions with the owner's Mine-vs-Business corrections applied, and money
 * metrics recomputed client-side (instant — no round-trip). Must be used inside
 * DashboardStateProvider.
 */
export function useMoney(): {
  data: TransactionsResponse | null;
  isLoading: boolean;
  isError: boolean;
} {
  const q = useTransactions();
  const { scopeOverrides } = useDashboardState();

  const data = useMemo<TransactionsResponse | null>(() => {
    if (!q.data) return null;
    const transactions = q.data.transactions.map((t) =>
      scopeOverrides[t.id] ? { ...t, scope: scopeOverrides[t.id] } : t,
    );
    return {
      business: q.data.business,
      transactions,
      metrics: computeMoneyMetrics(transactions, q.data.metrics.bankBalance),
    };
  }, [q.data, scopeOverrides]);

  return { data, isLoading: q.isLoading, isError: q.isError };
}
