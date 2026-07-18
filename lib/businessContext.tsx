"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Business } from "./types";

/** What the dashboard needs to know about the currently-open workspace.
 *  For samples, `invoices` is omitted (the API loads them by id).
 *  For custom workspaces, `invoices` travels with it (POSTed to the API). */
export interface ActiveBusiness {
  id: string;
  name: string;
  industry: string;
  email: string;
  isCustom: boolean;
  invoices?: Business["invoices"];
  // Money transactions for custom/uploaded workspaces (samples load from server).
  transactions?: import("./types").Transaction[];
  bankBalance?: number;
}

interface BusinessContextValue {
  ready: boolean; // hydrated from localStorage yet?
  activeBusiness: ActiveBusiness | null;
  customBusinesses: Business[];
  selectSample: (b: {
    id: string;
    name: string;
    industry: string;
    email: string;
  }) => void;
  addCustomBusiness: (b: Business) => void;
  setActiveById: (id: string) => void;
  clearActive: () => void;
}

const ACTIVE_KEY = "flowise.activeBusiness";
const CUSTOM_KEY = "flowise.customBusinesses";

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [activeBusiness, setActive] = useState<ActiveBusiness | null>(null);
  const [customBusinesses, setCustom] = useState<Business[]>([]);

  // Hydrate once from localStorage.
  useEffect(() => {
    try {
      const c = localStorage.getItem(CUSTOM_KEY);
      if (c) setCustom(JSON.parse(c));
      const a = localStorage.getItem(ACTIVE_KEY);
      if (a) setActive(JSON.parse(a));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeBusiness));
    } catch {
      /* storage full / unavailable */
    }
  }, [activeBusiness, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customBusinesses));
    } catch {
      /* ignore */
    }
  }, [customBusinesses, ready]);

  const selectSample = useCallback(
    (b: { id: string; name: string; industry: string; email: string }) => {
      setActive({ ...b, isCustom: false });
    },
    [],
  );

  const addCustomBusiness = useCallback(
    (b: Business) => {
      setCustom((prev) => {
        const others = prev.filter((x) => x.id !== b.id);
        return [...others, b];
      });
      setActive({
        id: b.id,
        name: b.name,
        industry: b.industry,
        email: b.email,
        isCustom: true,
        invoices: b.invoices,
      });
      // Custom-workspace content travels in the POST body, so a re-import under
      // the same id must drop any cached (stale) invoices/metrics for it.
      qc.invalidateQueries({ predicate: (q) => q.queryKey[1] === b.id });
    },
    [qc],
  );

  const setActiveById = useCallback(
    (id: string) => {
      const custom = customBusinesses.find((b) => b.id === id);
      if (custom) {
        setActive({
          id: custom.id,
          name: custom.name,
          industry: custom.industry,
          email: custom.email,
          isCustom: true,
          invoices: custom.invoices,
        });
      } else {
        // Sample: minimal ref; name/industry are refreshed by the switcher.
        setActive((prev) =>
          prev && prev.id === id ? prev : { id, name: id, industry: "", email: "", isCustom: false },
        );
      }
    },
    [customBusinesses],
  );

  const clearActive = useCallback(() => setActive(null), []);

  return (
    <BusinessContext.Provider
      value={{
        ready,
        activeBusiness,
        customBusinesses,
        selectSample,
        addCustomBusiness,
        setActiveById,
        clearActive,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return ctx;
}
