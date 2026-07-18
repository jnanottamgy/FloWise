"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useInsight, useInvoices, useSummary, useTransactions } from "@/lib/dashboardData";
import { useBusiness } from "@/lib/businessContext";
import {
  invoicesCSV,
  reportHTML,
  transactionsCSV,
  type ReportData,
} from "@/lib/export";
import { summaryTemplate } from "@/lib/drafts";

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function printHTML(html: string) {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  }, 350);
}

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const { activeBusiness } = useBusiness();
  const { data: summary } = useSummary();
  const { data: invoices } = useInvoices();
  const { data: txns } = useTransactions();
  const { data: insight } = useInsight();

  const slug = (activeBusiness?.name ?? "flowise").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  function exportTransactionsCSV() {
    if (!txns) return;
    download(`${slug}-transactions.csv`, transactionsCSV(txns.transactions), "text/csv");
    setOpen(false);
  }
  function exportInvoicesCSV() {
    if (!invoices) return;
    download(`${slug}-invoices.csv`, invoicesCSV(invoices.invoices), "text/csv");
    setOpen(false);
  }
  function exportPDF() {
    if (!summary || !invoices) return;
    const generatedOn = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const data: ReportData = {
      businessName: summary.business.name,
      industry: summary.business.industry,
      generatedOn,
      aiSummary: insight?.aiSummary || summaryTemplate(summary.business.name, summary.metrics),
      summary: summary.metrics,
      money: txns?.metrics,
      invoices: invoices.invoices,
    };
    printHTML(reportHTML(data));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="glass-hover flex h-12 items-center gap-2 rounded-full border border-border bg-card pl-4 pr-3 text-caption font-medium text-ink shadow-soft"
      >
        <Download size={16} /> Export
        <ChevronDown size={14} className="text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-card"
            >
              <MenuItem icon={FileText} label="Full report (PDF)" hint="Print or save as PDF" onClick={exportPDF} />
              <MenuItem icon={FileSpreadsheet} label="Transactions (CSV)" onClick={exportTransactionsCSV} />
              <MenuItem icon={FileSpreadsheet} label="Invoices (CSV)" onClick={exportInvoicesCSV} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-black/[0.03]"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-olive/10 text-olive">
        <Icon size={15} />
      </span>
      <span>
        <span className="block text-caption font-medium text-ink">{label}</span>
        {hint && <span className="block text-[11px] text-muted">{hint}</span>}
      </span>
    </button>
  );
}
