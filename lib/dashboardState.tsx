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
import type { EnrichedInvoice } from "./types";

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
}

const Ctx = createContext<DashboardStateValue | null>(null);

/** Per-business selection + sent-follow-up state. Sent items are keyed by
 *  business id so switching workspaces keeps trackers separate. */
export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const { activeBusiness } = useBusiness();
  const bid = activeBusiness?.id ?? "";

  const [selectedInvoiceId, setSelected] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, SentItem[]>>({});

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
      setSentMap((prev) => ({
        ...prev,
        [bid]: [item, ...(prev[bid] ?? [])],
      }));
    },
    [bid],
  );

  const select = useCallback((id: string | null) => setSelected(id), []);

  return (
    <Ctx.Provider
      value={{ selectedInvoiceId, select, sentItems, sentIds, markSent }}
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
