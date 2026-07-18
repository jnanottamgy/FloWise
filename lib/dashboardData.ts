"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "./businessContext";
import { useDashboardState } from "./dashboardState";
import { computeMoneyMetrics } from "./transactions";
import { forecastCash, type Forecast } from "./forecast";
import { buildActions, type Action } from "./actions";
import type {
  EnrichedInvoice,
  MoneyMetrics,
  TransactionsResponse,
} from "./types";
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
  const { scopeOverrides, addedTxns } = useDashboardState();

  const data = useMemo<TransactionsResponse | null>(() => {
    if (!q.data) return null;
    const merged = [...addedTxns, ...q.data.transactions];
    const transactions = merged.map((t) =>
      scopeOverrides[t.id] ? { ...t, scope: scopeOverrides[t.id] } : t,
    );
    return {
      business: q.data.business,
      transactions,
      metrics: computeMoneyMetrics(transactions, q.data.metrics.bankBalance),
    };
  }, [q.data, scopeOverrides, addedTxns]);

  return { data, isLoading: q.isLoading, isError: q.isError };
}

export interface Overview {
  metrics: MoneyMetrics | null;
  invoices: EnrichedInvoice[];
  unpaid: EnrichedInvoice[];
  forecast: Forecast | null;
  actions: Action[];
  isLoading: boolean;
}

/** Everything the calm "home" view needs: money + invoices → forecast + actions. */
export function useOverview(): Overview {
  const money = useMoney();
  const inv = useInvoices();
  const { sentIds } = useDashboardState();

  return useMemo(() => {
    const invoices = inv.data?.invoices ?? [];
    const unpaid = invoices.filter((i) => i.status === "unpaid");
    const metrics = money.data?.metrics ?? null;
    const forecast = metrics
      ? forecastCash(
          metrics.bankBalance,
          metrics.avgWeeklyOutflow,
          metrics.avgWeeklyInflow,
          unpaid,
        )
      : null;
    const actions = buildActions(invoices, metrics, forecast, sentIds);
    return {
      metrics,
      invoices,
      unpaid,
      forecast,
      actions,
      isLoading: money.isLoading || inv.isLoading,
    };
  }, [money.data, money.isLoading, inv.data, inv.isLoading, sentIds]);
}
