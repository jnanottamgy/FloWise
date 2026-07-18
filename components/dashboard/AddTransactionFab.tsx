"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useDashboardState } from "@/lib/dashboardState";
import { TODAY } from "@/lib/riskEngine";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export function AddTransactionFab() {
  const { addTransactions } = useDashboardState();
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<"in" | "out">("out");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);
  const [notes, setNotes] = useState("");

  function reset() {
    setName("");
    setAmount("");
    setDate(TODAY);
    setNotes("");
    setDir("out");
  }

  function save() {
    const amt = Math.round(Number(amount.replace(/[₹,\s]/g, "")));
    if (!amt) return;
    const txn: Transaction = {
      id: `M${Date.now().toString(36)}`,
      date: date || TODAY,
      description: notes || name || (dir === "in" ? "Money received" : "Money paid"),
      counterparty: name.trim() || (dir === "in" ? "Customer" : "Supplier"),
      amount: amt,
      direction: dir,
      mode: "cash",
      scope: "business",
      category: dir === "in" ? "sales" : "other",
      source: "manual",
      recurring: false,
      tiedToStock: false,
    };
    addTransactions([txn]);
    reset();
    setOpen(false);
  }

  return (
    <>
      {/* Floating button — thumb-reachable */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-2 rounded-pill bg-olive px-5 py-4 text-body font-semibold text-white shadow-card transition hover:bg-olive-dark md:bottom-6 md:right-6"
      >
        <Plus size={20} /> <span className="hidden sm:inline">Add money</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Add transaction"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative w-full max-w-md rounded-t-[28px] bg-card p-6 shadow-card sm:rounded-[28px]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-section font-semibold text-ink">Add a transaction</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-black/[0.04] hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Received / Paid */}
              <div className="grid grid-cols-2 gap-2 rounded-pill bg-black/[0.03] p-1">
                <button
                  onClick={() => setDir("in")}
                  className={cn(
                    "rounded-pill py-2.5 text-body font-medium transition",
                    dir === "in" ? "bg-success/15 text-success" : "text-muted",
                  )}
                >
                  Money received
                </button>
                <button
                  onClick={() => setDir("out")}
                  className={cn(
                    "rounded-pill py-2.5 text-body font-medium transition",
                    dir === "out" ? "bg-card text-ink shadow-soft" : "text-muted",
                  )}
                >
                  Money paid
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <Field label="Amount (₹)">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    autoFocus
                    className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-section font-semibold text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                  />
                </Field>
                <Field label={dir === "in" ? "Customer" : "Supplier / what for"}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={dir === "in" ? "e.g. ABC Traders" : "e.g. Surya Yarns"}
                    className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-body text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-body text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                    />
                  </Field>
                  <Field label="Notes (optional)">
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="—"
                      className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-body text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                    />
                  </Field>
                </div>
              </div>

              <button
                onClick={save}
                disabled={!amount.trim()}
                className="mt-5 w-full rounded-pill bg-olive py-3.5 text-body font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50"
              >
                Save
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-caption font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
