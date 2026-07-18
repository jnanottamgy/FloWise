"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Download,
  Upload,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { useBusiness } from "@/lib/businessContext";
import {
  parseInvoices,
  TEMPLATE_CSV,
  TEMPLATE_JSON,
} from "@/lib/parseInvoices";
import { enrichInvoices } from "@/lib/riskEngine";
import type { BusinessSummaryCard } from "@/lib/types";

type Choice = { kind: "sample"; id: string } | { kind: "custom" } | null;

function slug(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `custom-${s || "workspace"}`;
}

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Onboarding() {
  const router = useRouter();
  const { selectSample, addCustomBusiness, activeBusiness } = useBusiness();

  const { data, isLoading } = useQuery<{ businesses: BusinessSummaryCard[] }>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const res = await fetch("/api/businesses");
      if (!res.ok) throw new Error("Failed to load businesses");
      return res.json();
    },
  });
  const samples = data?.businesses ?? [];

  const [choice, setChoice] = useState<Choice>(null);
  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(
    () => (importText.trim() ? parseInvoices(importText) : null),
    [importText],
  );
  const spread = useMemo(() => {
    if (!parsed?.invoices.length) return null;
    const e = enrichInvoices(parsed.invoices);
    return {
      red: e.filter((i) => i.risk === "red").length,
      yellow: e.filter((i) => i.risk === "yellow").length,
      green: e.filter((i) => i.risk === "green").length,
    };
  }, [parsed]);

  const customValid = Boolean(
    name.trim() && parsed && parsed.invoices.length && !parsed.errors.length,
  );

  // Custom takes the selection when it becomes valid (last action wins).
  useEffect(() => {
    if (customValid) setChoice({ kind: "custom" });
  }, [customValid]);

  const canEnter =
    (choice?.kind === "sample" && samples.some((s) => s.id === choice.id)) ||
    (choice?.kind === "custom" && customValid);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function enterWorkspace() {
    if (choice?.kind === "sample") {
      const s = samples.find((x) => x.id === choice.id);
      if (!s) return;
      selectSample({
        id: s.id,
        name: s.name,
        industry: s.industry,
        email: s.email,
      });
      router.push("/dashboard");
    } else if (choice?.kind === "custom" && parsed) {
      const id = slug(name);
      addCustomBusiness({
        id,
        name: name.trim(),
        industry: "Custom workspace",
        email: `accounts@${id.replace("custom-", "")}.example`,
        invoices: parsed.invoices,
      });
      router.push("/dashboard");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Brand + heading */}
        <div className="flex flex-col items-center text-center">
          <span className="text-olive">
            <Logo size={44} />
          </span>
          <h1 className="mt-5 text-hero font-bold text-ink">
            Welcome to FloWise
          </h1>
          <p className="mt-2 text-body text-muted">
            Your AI cashflow copilot for small businesses.
          </p>

          {activeBusiness && (
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-4 py-2 text-caption font-medium text-olive shadow-soft transition hover:-translate-y-0.5"
            >
              Resume {activeBusiness.name}
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Sample businesses */}
        <section className="mt-12">
          <h2 className="mb-4 text-caption font-semibold uppercase tracking-wide text-muted">
            Choose a sample business
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-40 animate-pulse bg-black/[0.02]" />
              ))}
            {samples.map((s) => {
              const selected = choice?.kind === "sample" && choice.id === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => setChoice({ kind: "sample", id: s.id })}
                  whileHover={{ y: -4 }}
                  className="text-left"
                  aria-pressed={selected}
                >
                  <Card
                    className={cn(
                      "h-full transition",
                      selected
                        ? "ring-2 ring-olive ring-offset-2 ring-offset-bg"
                        : "hover:shadow-soft",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-olive/10 text-body font-semibold text-olive">
                        {s.name.slice(0, 1)}
                      </span>
                      {selected ? (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-olive text-white">
                          <Check size={14} />
                        </span>
                      ) : (
                        s.flaggedCount > 0 && (
                          <span className="rounded-pill bg-error/10 px-2 py-0.5 text-caption font-medium text-error">
                            {s.flaggedCount} at risk
                          </span>
                        )
                      )}
                    </div>
                    <h3 className="mt-4 text-body font-semibold text-ink">
                      {s.name}
                    </h3>
                    <p className="text-caption text-muted">{s.industry}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-caption text-muted">Outstanding</p>
                        <p className="text-body font-semibold text-ink">
                          {formatINR(s.outstanding)}
                        </p>
                      </div>
                      <p className="text-caption text-muted">
                        {s.invoiceCount} invoices
                      </p>
                    </div>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4 text-caption text-muted">
          <span className="h-px flex-1 bg-border" />
          or bring your own
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Bring your own workspace */}
        <section>
          <Card
            className={cn(
              "transition",
              choice?.kind === "custom" &&
                "ring-2 ring-olive ring-offset-2 ring-offset-bg",
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-section font-semibold text-ink">
                Bring your own workspace
              </h2>
              <button
                onClick={() => {
                  download("flowise-invoices.csv", TEMPLATE_CSV, "text/csv");
                  download(
                    "flowise-invoices.json",
                    TEMPLATE_JSON,
                    "application/json",
                  );
                }}
                className="inline-flex items-center gap-1.5 text-caption font-medium text-olive hover:underline"
              >
                <Download size={15} /> Templates
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Business name"
                className="h-[52px] rounded-pill border border-border bg-bg px-5 text-body text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
              />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-caption text-muted">
                    Paste invoices (JSON or CSV), or upload a file
                  </label>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-caption font-medium text-ink transition hover:bg-black/[0.03]"
                  >
                    <Upload size={14} /> Upload
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,.csv,text/csv,application/json"
                    onChange={handleFile}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    "id,client,amount,issueDate,dueDate,paidDate,status\nINV-1,Acme Corp,45000,2026-05-02,2026-05-16,,unpaid"
                  }
                  rows={5}
                  className="resize-y rounded-3xl border border-border bg-bg p-4 font-mono text-caption text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
                />
              </div>

              {/* Parse feedback */}
              {parsed && parsed.errors.length > 0 && (
                <div className="rounded-2xl bg-error/[0.06] p-3 text-caption text-error">
                  <div className="mb-1 flex items-center gap-1.5 font-medium">
                    <TriangleAlert size={14} /> Couldn&apos;t import
                  </div>
                  <ul className="ml-5 list-disc space-y-0.5">
                    {parsed.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed && parsed.invoices.length > 0 && spread && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-success/[0.06] p-3 text-caption">
                  <span className="inline-flex items-center gap-1.5 font-medium text-success">
                    <Check size={14} /> {parsed.invoices.length} invoices ready
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-error">{spread.red} red</span>
                  <span className="text-warning">{spread.yellow} watch</span>
                  <span className="text-muted">{spread.green} healthy</span>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Enter */}
        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={enterWorkspace}
            disabled={!canEnter}
            whileHover={canEnter ? { scale: 1.02 } : undefined}
            whileTap={canEnter ? { scale: 0.99 } : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-body font-semibold shadow-soft transition",
              canEnter
                ? "bg-olive text-white hover:bg-olive-dark"
                : "cursor-not-allowed bg-black/[0.06] text-muted",
            )}
          >
            <Sparkles size={18} />
            Enter workspace
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
