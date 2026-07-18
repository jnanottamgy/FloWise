"use client";

import { useRef, useState } from "react";
import { Check, Mic, Plus, TriangleAlert, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardState } from "@/lib/dashboardState";
import {
  STATEMENT_TEMPLATE_CSV,
  parseQuickEntry,
  parseStatementCSV,
} from "@/lib/parseStatement";
import { formatINR } from "@/lib/format";

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function AddMoneyCard() {
  const { addTransactions } = useDashboardState();
  const [entry, setEntry] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(null), 2500);
  }

  function addQuick() {
    setError(null);
    const txn = parseQuickEntry(entry);
    if (!txn) {
      setError("Try something like: paid 2000 to Surya Yarns for stock");
      return;
    }
    addTransactions([txn]);
    setEntry("");
    flash(
      `Added: ${txn.direction === "in" ? "+" : "−"}${formatINR(txn.amount)} · ${txn.counterparty} (${txn.scope})`,
    );
  }

  function startVoice() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input isn't supported in this browser — please type it.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: any) => {
      setEntry(e.results[0][0].transcript);
    };
    rec.start();
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { transactions, errors } = parseStatementCSV(String(reader.result ?? ""));
      if (transactions.length) {
        addTransactions(transactions);
        flash(`Imported ${transactions.length} transactions from ${file.name}`);
        setError(null);
      } else {
        setError(errors[0] ?? "Couldn't read that file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <Card id="sec-add" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-section font-semibold text-ink">Add money</h3>
          <p className="text-caption text-muted">
            Type or say a cash entry, or upload a bank / UPI statement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-2 text-caption font-medium text-ink transition hover:bg-black/[0.03]"
          >
            <Upload size={15} /> Upload statement
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="hidden"
          />
          <button
            onClick={() => download("statement-template.csv", STATEMENT_TEMPLATE_CSV, "text/csv")}
            className="text-caption font-medium text-olive hover:underline"
          >
            Template
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuick()}
            placeholder="e.g. paid 2000 to labour  ·  received 15400 from counter sale"
            className="h-12 w-full rounded-pill border border-border bg-bg pl-5 pr-12 text-body text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
          />
          <button
            onClick={startVoice}
            aria-label="Speak entry"
            className={`absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full transition ${
              listening ? "bg-error/15 text-error" : "text-muted hover:bg-black/[0.04]"
            }`}
          >
            <Mic size={16} />
          </button>
        </div>
        <button
          onClick={addQuick}
          disabled={!entry.trim()}
          className="inline-flex items-center gap-2 rounded-pill bg-olive px-5 text-body font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {note && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-caption font-medium text-success">
          <Check size={14} /> {note}
        </p>
      )}
      {error && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-caption font-medium text-error">
          <TriangleAlert size={14} /> {error}
        </p>
      )}
    </Card>
  );
}
