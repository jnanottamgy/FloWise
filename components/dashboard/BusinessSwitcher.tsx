"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useBusiness } from "@/lib/businessContext";
import { cn } from "@/lib/utils";
import type { BusinessSummaryCard } from "@/lib/types";

export function BusinessSwitcher() {
  const router = useRouter();
  const {
    activeBusiness,
    customBusinesses,
    selectSample,
    setActiveById,
  } = useBusiness();
  const [open, setOpen] = useState(false);

  const { data } = useQuery<{ businesses: BusinessSummaryCard[] }>({
    queryKey: ["businesses"],
    queryFn: async () => (await fetch("/api/businesses")).json(),
  });
  const samples = data?.businesses ?? [];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-pill border border-border bg-card py-1.5 pl-3 pr-2.5 text-caption font-semibold text-ink shadow-soft transition hover:-translate-y-0.5"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-olive/15 text-[10px] text-olive">
          {activeBusiness?.name?.slice(0, 1) ?? "?"}
        </span>
        {activeBusiness?.name ?? "Select business"}
        <ChevronDown size={15} className="text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 z-20 mt-2 w-64 overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-card"
            >
              <li className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Sample businesses
              </li>
              {samples.map((s) => (
                <Row
                  key={s.id}
                  label={s.name}
                  sub={s.industry}
                  active={activeBusiness?.id === s.id}
                  onClick={() => {
                    selectSample({
                      id: s.id,
                      name: s.name,
                      industry: s.industry,
                      email: s.email,
                    });
                    setOpen(false);
                  }}
                />
              ))}

              {customBusinesses.length > 0 && (
                <>
                  <li className="mt-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Your workspaces
                  </li>
                  {customBusinesses.map((b) => (
                    <Row
                      key={b.id}
                      label={b.name}
                      sub={b.industry}
                      active={activeBusiness?.id === b.id}
                      onClick={() => {
                        setActiveById(b.id);
                        setOpen(false);
                      }}
                    />
                  ))}
                </>
              )}

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-caption font-medium text-olive transition hover:bg-olive/[0.06]"
              >
                <Plus size={16} /> Add / switch business
              </button>
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        role="option"
        aria-selected={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-black/[0.03]",
        )}
      >
        <span>
          <span className="block text-caption font-medium text-ink">
            {label}
          </span>
          <span className="block text-[11px] text-muted">{sub}</span>
        </span>
        {active && <Check size={15} className="text-olive" />}
      </button>
    </li>
  );
}
