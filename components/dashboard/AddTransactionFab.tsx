"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Briefcase, MessageSquareText, Plus, User, X } from "lucide-react";
import { useDashboardState } from "@/lib/dashboardState";
import { useLang } from "@/lib/language";
import { parseQuickEntry } from "@/lib/parseStatement";
import { TODAY } from "@/lib/riskEngine";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction, TxnScope } from "@/lib/types";

type PendingTxn = Omit<Transaction, "scope">;

export function AddTransactionFab() {
  const { addTransactions } = useDashboardState();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"entry" | "classify">("entry");
  const [pending, setPending] = useState<PendingTxn | null>(null);

  const [dir, setDir] = useState<"in" | "out">("out");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);
  const [notes, setNotes] = useState("");
  const [showSms, setShowSms] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [smsErr, setSmsErr] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc to close + focus trap + restore focus to the FAB on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button, textarea, input, a[href], [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => !el.hasAttribute("disabled"))
        : [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setStep("entry");
    setPending(null);
    setName("");
    setAmount("");
    setDate(TODAY);
    setNotes("");
    setDir("out");
    setShowSms(false);
    setSmsText("");
    setSmsErr(null);
  }

  function readSms() {
    const p = parseQuickEntry(smsText);
    if (!p) {
      setSmsErr("Couldn't read that — please enter it below.");
      return;
    }
    setAmount(String(p.amount));
    setName(p.counterparty);
    setDir(p.direction);
    setShowSms(false);
    setSmsErr(null);
  }
  function close() {
    setOpen(false);
    reset();
  }

  function proceed() {
    const amt = Math.round(Number(amount.replace(/[₹,\s]/g, "")));
    if (!amt) return;
    setPending({
      id: `M${Date.now().toString(36)}`,
      date: date || TODAY,
      description: notes || name || (dir === "in" ? "Money received" : "Money paid"),
      counterparty: name.trim() || (dir === "in" ? "Customer" : "Supplier"),
      amount: amt,
      direction: dir,
      mode: "cash",
      category: dir === "in" ? "sales" : "other",
      source: "manual",
      recurring: false,
      tiedToStock: false,
    });
    setStep("classify");
  }

  function commit(scope: TxnScope) {
    if (!pending) return;
    addTransactions([{ ...pending, scope }]);
    close();
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-2 rounded-pill bg-olive px-5 py-4 text-body font-semibold text-white shadow-card transition hover:bg-olive-dark md:bottom-6 md:right-6"
      >
        <Plus size={20} /> <span className="hidden sm:inline">{t("fab.add")}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Add transaction"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative w-full max-w-md rounded-t-[28px] bg-card p-6 shadow-card sm:rounded-[28px]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step === "classify" && (
                    <button
                      onClick={() => setStep("entry")}
                      aria-label="Back"
                      className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-black/[0.04] hover:text-ink"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <h2 className="text-section font-semibold text-ink">
                    {step === "entry" ? "Add a transaction" : "Is this business or personal?"}
                  </h2>
                </div>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-black/[0.04] hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              {step === "entry" ? (
                <>
                  {/* Paste a bank / UPI SMS to auto-fill */}
                  {!showSms ? (
                    <button
                      onClick={() => setShowSms(true)}
                      className="mb-3 inline-flex items-center gap-1.5 rounded-pill bg-olive/10 px-3 py-1.5 text-caption font-medium text-olive transition hover:bg-olive/20"
                    >
                      <MessageSquareText size={14} /> Paste a bank / UPI SMS
                    </button>
                  ) : (
                    <div className="mb-3 space-y-2">
                      <textarea
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        rows={3}
                        placeholder="Paste your bank/UPI SMS here — e.g. Rs.5000 credited… from MERIDIAN RETAIL"
                        className="w-full resize-none rounded-2xl border border-border bg-bg p-3 text-caption text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={readSms}
                          disabled={!smsText.trim()}
                          className="rounded-pill bg-olive px-4 py-2 text-caption font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50"
                        >
                          Read SMS
                        </button>
                        <button
                          onClick={() => {
                            setShowSms(false);
                            setSmsErr(null);
                          }}
                          className="rounded-pill border border-border px-4 py-2 text-caption font-medium text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                      {smsErr && <p className="text-caption text-error">{smsErr}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 rounded-pill bg-black/[0.03] p-1">
                    <button
                      onClick={() => setDir("in")}
                      aria-pressed={dir === "in"}
                      className={cn(
                        "rounded-pill py-2.5 text-body font-medium transition",
                        dir === "in" ? "bg-success/15 text-[color:var(--success-ink)]" : "text-muted",
                      )}
                    >
                      Money received
                    </button>
                    <button
                      onClick={() => setDir("out")}
                      aria-pressed={dir === "out"}
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
                        onKeyDown={(e) => e.key === "Enter" && proceed()}
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
                    onClick={proceed}
                    disabled={!amount.trim()}
                    className="mt-5 w-full rounded-pill bg-olive py-3.5 text-body font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <p className="text-body text-muted">
                    {pending?.direction === "in" ? "Received" : "Paid"}{" "}
                    <span className="font-semibold text-ink">
                      {formatINR(pending?.amount ?? 0)}
                    </span>
                    {pending?.counterparty ? ` · ${pending.counterparty}` : ""}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => commit("business")}
                      className="flex flex-col items-center gap-2 rounded-3xl border border-olive/30 bg-olive/[0.06] py-6 text-olive transition hover:bg-olive/[0.12]"
                    >
                      <Briefcase size={26} />
                      <span className="text-body font-semibold">Business</span>
                    </button>
                    <button
                      onClick={() => commit("personal")}
                      className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-black/[0.02] py-6 text-ink transition hover:bg-black/[0.05]"
                    >
                      <User size={26} className="text-muted" />
                      <span className="text-body font-semibold">Personal</span>
                    </button>
                  </div>

                  <button
                    onClick={() => commit("unsure")}
                    className="mt-3 w-full rounded-pill py-2.5 text-caption font-medium text-muted transition hover:text-ink"
                  >
                    Not sure — decide later
                  </button>
                </>
              )}
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
