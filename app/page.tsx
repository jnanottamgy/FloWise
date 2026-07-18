"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Download,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
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

const FEATURES = [
  { icon: Wallet, label: "UPI · Bank · Cash" },
  { icon: Sparkles, label: "AI copilot" },
  { icon: MessageCircle, label: "WhatsApp reminders" },
  { icon: ShieldCheck, label: "Free · No sign-up" },
];

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

/** Ambient patterned backdrop — soft olive/sage colour mesh + a dot grid + glow orbs. */
function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      {/* soft colour mesh */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(55% 45% at 12% -5%, rgba(95,120,106,0.22), transparent 60%),
            radial-gradient(50% 40% at 100% 8%, rgba(167,182,168,0.28), transparent 60%),
            radial-gradient(65% 55% at 50% 110%, rgba(95,120,106,0.14), transparent 70%)
          `,
        }}
      />
      {/* dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,17,17,0.09) 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 110% 85% at 50% 25%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 110% 85% at 50% 25%, #000 55%, transparent 100%)",
        }}
      />
      {/* floating glow orbs */}
      <motion.div
        className="absolute -left-24 -top-24 h-[440px] w-[440px] rounded-full bg-olive/25 blur-[90px]"
        animate={{ y: [0, 26, 0], x: [0, 16, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 top-8 h-[400px] w-[400px] rounded-full bg-sage/30 blur-[90px]"
        animate={{ y: [0, -22, 0], x: [0, -14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 left-1/3 h-[360px] w-[360px] rounded-full bg-olive/15 blur-[100px]"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
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
      selectSample({ id: s.id, name: s.name, industry: s.industry, email: s.email });
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
    <main className="relative min-h-screen w-full overflow-hidden">
      <BackgroundFX />

      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* Hero */}
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/60 bg-white/60 px-3 py-1 text-caption font-medium text-olive shadow-soft backdrop-blur">
              <Sparkles size={13} /> AI-powered · Made for Indian SMEs
            </span>

            {/* Glowing logo */}
            <div className="relative mt-6 grid place-items-center">
              <span className="absolute h-20 w-20 rounded-full bg-olive/25 blur-2xl" />
              <span className="relative text-olive">
                <Logo size={52} />
              </span>
            </div>

            <h1 className="mt-5 text-[clamp(34px,6vw,54px)] font-bold leading-tight tracking-tight text-ink">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-olive to-sage bg-clip-text text-transparent">
                FloWise
              </span>
            </h1>
            <p className="mt-3 max-w-md text-body text-muted">
              Your AI cashflow copilot for small businesses — know your money,
              in plain language.
            </p>

            {/* Feature chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-white/60 bg-white/50 px-3 py-1.5 text-caption font-medium text-ink/70 backdrop-blur"
                  >
                    <Icon size={13} className="text-olive" /> {f.label}
                  </span>
                );
              })}
            </div>

            {activeBusiness && (
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 inline-flex items-center gap-1.5 rounded-pill bg-olive px-5 py-2.5 text-caption font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-olive-dark"
              >
                Resume {activeBusiness.name}
                <ArrowRight size={15} />
              </button>
            )}
          </div>

          {/* Sample businesses */}
          <section className="mt-14">
            <h2 className="mb-4 text-caption font-semibold uppercase tracking-[0.14em] text-muted">
              Choose a sample business
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-52 animate-pulse rounded-card border border-white/60 bg-white/40"
                  />
                ))}
              {samples.map((s, i) => {
                const selected = choice?.kind === "sample" && choice.id === s.id;
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setChoice({ kind: "sample", id: s.id })}
                    whileHover={{ y: -6 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="group text-left"
                    aria-pressed={selected}
                  >
                    <div
                      className={cn(
                        "relative h-full overflow-hidden rounded-card border p-5 backdrop-blur-xl transition",
                        selected
                          ? "border-olive/50 bg-white/85 shadow-card ring-2 ring-olive/30"
                          : "border-white/60 bg-white/70 shadow-soft hover:shadow-card",
                      )}
                    >
                      {/* top accent + hover glow */}
                      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-olive/60 to-transparent" />
                      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-olive/15 opacity-0 blur-2xl transition group-hover:opacity-100" />

                      <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-olive to-sage text-body font-semibold text-white shadow-soft">
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
                          <p className="text-section font-bold text-ink">
                            {formatINR(s.outstanding)}
                          </p>
                        </div>
                        <p className="text-caption text-muted">
                          {s.invoiceCount} invoices
                        </p>
                      </div>

                      <div
                        className={cn(
                          "mt-4 inline-flex items-center gap-1 text-caption font-medium text-olive transition",
                          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        )}
                      >
                        Open workspace <ArrowRight size={13} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="my-9 flex items-center gap-4 text-caption text-muted">
            <span className="h-px flex-1 bg-black/[0.07]" />
            or bring your own
            <span className="h-px flex-1 bg-black/[0.07]" />
          </div>

          {/* Bring your own workspace */}
          <section
            className={cn(
              "relative overflow-hidden rounded-card border p-6 backdrop-blur-xl transition sm:p-7",
              choice?.kind === "custom"
                ? "border-olive/50 bg-white/85 ring-2 ring-olive/30"
                : "border-white/60 bg-white/70 shadow-soft",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-sage/60 to-transparent" />
            <div className="flex items-center justify-between">
              <h2 className="text-section font-semibold text-ink">
                Bring your own workspace
              </h2>
              <button
                onClick={() => {
                  download("flowise-invoices.csv", TEMPLATE_CSV, "text/csv");
                  download("flowise-invoices.json", TEMPLATE_JSON, "application/json");
                }}
                className="inline-flex items-center gap-1.5 text-caption font-medium text-olive hover:underline"
              >
                <Download size={15} /> Templates
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Business name"
                className="h-[52px] rounded-pill border border-border bg-white/70 px-5 text-body text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
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
                  className="resize-y rounded-3xl border border-border bg-white/70 p-4 font-mono text-caption text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
                />
              </div>

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
          </section>

          {/* Enter */}
          <div className="mt-9 flex justify-center">
            <motion.button
              onClick={enterWorkspace}
              disabled={!canEnter}
              whileHover={canEnter ? { scale: 1.03 } : undefined}
              whileTap={canEnter ? { scale: 0.98 } : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-pill px-8 py-4 text-body font-semibold transition",
                canEnter
                  ? "bg-olive text-white shadow-[0_12px_30px_-8px_rgba(95,120,106,0.6)] hover:bg-olive-dark"
                  : "cursor-not-allowed bg-black/[0.06] text-muted",
              )}
            >
              <Sparkles size={18} />
              Enter workspace
              <ArrowRight size={18} />
            </motion.button>
          </div>

          {/* Footer trust line */}
          <p className="mt-8 text-center text-caption text-muted">
            Free · No sign-up · Your data stays on your device
          </p>
        </motion.div>
      </div>
    </main>
  );
}
