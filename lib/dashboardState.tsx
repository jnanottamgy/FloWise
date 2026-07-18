"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useBusiness } from "./businessContext";
import type { EnrichedInvoice, Transaction, TxnScope } from "./types";

export interface SentItem {
  invoice: EnrichedInvoice;
  message: string;
  sentAt: string; // ISO
}

interface DashboardStateValue {
  selectedInvoiceId: string | null;
  select: (id: string | null) => void;
  sentItems: SentItem[]; // for the active business, newest first
  sentIds: Set<string>;
  markSent: (item: SentItem) => void;
  // Mine-vs-Business: per-transaction scope corrections (persisted).
  scopeOverrides: Record<string, TxnScope>;
  setScope: (txnId: string, scope: TxnScope) => void;
  // Manually-added / uploaded transactions (persisted), merged into money.
  addedTxns: Transaction[];
  addTransactions: (txns: Transaction[]) => void;
}

const SCOPE_KEY = "flowise.scopeOverrides";
const ADDED_KEY = "flowise.addedTxns";

const Ctx = createContext<DashboardStateValue | null>(null);

/** Per-business selection + sent-follow-up state. Sent items are keyed by
 *  business id so switching workspaces keeps trackers separate. */
export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const { activeBusiness } = useBusiness();
  const bid = activeBusiness?.id ?? "";

  const [selectedInvoiceId, setSelected] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, SentItem[]>>({});
  const [scopeMap, setScopeMap] = useState<
    Record<string, Record<string, TxnScope>>
  >({});
  const [addedMap, setAddedMap] = useState<Record<string, Transaction[]>>({});

  // Hydrate persisted corrections + additions once.
  useEffect(() => {
    try {
      const s = localStorage.getItem(SCOPE_KEY);
      if (s) setScopeMap(JSON.parse(s));
      const a = localStorage.getItem(ADDED_KEY);
      if (a) setAddedMap(JSON.parse(a));
    } catch {
      /* ignore */
    }
  }, []);

  // A selection from one business is meaningless in another — clear on switch.
  useEffect(() => {
    setSelected(null);
  }, [bid]);

  const sentItems = sentMap[bid] ?? [];
  const sentIds = useMemo(
    () => new Set(sentItems.map((s) => s.invoice.id)),
    [sentItems],
  );

  const markSent = useCallback(
    (item: SentItem) => {
      setSentMap((prev) => {
        const existing = prev[bid] ?? [];
        if (existing.some((s) => s.invoice.id === item.invoice.id)) return prev;
        return { ...prev, [bid]: [item, ...existing] };
      });
    },
    [bid],
  );

  const select = useCallback((id: string | null) => setSelected(id), []);

  const scopeOverrides = scopeMap[bid] ?? {};
  const setScope = useCallback(
    (txnId: string, scope: TxnScope) => {
      setScopeMap((prev) => {
        const next = {
          ...prev,
          [bid]: { ...(prev[bid] ?? {}), [txnId]: scope },
        };
        try {
          localStorage.setItem(SCOPE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [bid],
  );

  const addedTxns = addedMap[bid] ?? [];
  const addTransactions = useCallback(
    (txns: Transaction[]) => {
      if (!txns.length) return;
      setAddedMap((prev) => {
        const next = { ...prev, [bid]: [...txns, ...(prev[bid] ?? [])] };
        try {
          localStorage.setItem(ADDED_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [bid],
  );

  return (
    <Ctx.Provider
      value={{
        selectedInvoiceId,
        select,
        sentItems,
        sentIds,
        markSent,
        scopeOverrides,
        setScope,
        addedTxns,
        addTransactions,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDashboardState(): DashboardStateValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useDashboardState must be used within a DashboardStateProvider",
    );
  }
  return ctx;
}
