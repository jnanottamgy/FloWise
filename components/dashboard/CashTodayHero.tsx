"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Landmark, Package, Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { useLang } from "@/lib/language";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CashTodayHero() {
  const { metrics: m, forecast } = useOverview();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (!m) {
    return (
      <Card id="sec-home" className="scroll-mt-6 h-56 animate-pulse bg-black/[0.02] sm:col-span-2 xl:col-span-4" />
    );
  }

  const status = forecast?.status ?? "healthy";
  const safeDays = forecast ? forecast.safeDays : 90;
  const tone =
    status === "healthy"
      ? { num: "text-success", pill: "bg-success/10 text-success", dot: "bg-success" }
      : status === "watch"
        ? { num: "text-ink", pill: "bg-warning/15 text-warning", dot: "bg-warning" }
        : { num: "text-error", pill: "bg-error/10 text-error", dot: "bg-error" };
  const daysStr = safeDays >= 90 ? "90+" : String(safeDays);
  const msg =
    status === "healthy"
      ? t("hero.enough", { days: daysStr })
      : status === "watch"
        ? t("hero.watch", { days: safeDays })
        : t("hero.short", { days: safeDays });

  return (
    <Card
      id="sec-home"
      className="scroll-mt-6 flex flex-col items-center py-8 text-center sm:col-span-2 xl:col-span-4"
    >
      <p className="text-body font-medium text-muted">
        {t("hero.available")}
        <span className="text-muted/70"> · {t("hero.free")}</span>
      </p>

      <p
        className={cn(
          "mt-1 font-bold leading-none tracking-tight",
          "text-[clamp(44px,9vw,72px)]",
          tone.num,
        )}
      >
        {formatINR(m.realFreeCash)}
      </p>

      <span
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-pill px-4 py-2 text-body font-medium",
          tone.pill,
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
        {msg}
      </span>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-caption font-medium text-muted transition hover:text-ink"
      >
        {open ? t("hero.hide") : t("hero.view")}
        <ChevronDown size={14} className={cn("transition", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2">
              <Detail icon={Landmark} label={t("hero.inBank")} value={formatINR(m.bankBalance)} />
              <Detail icon={Package} label={t("hero.stock")} value={`− ${formatINR(m.lockedInStock)}`} />
              <Detail icon={Repeat} label={t("hero.bills")} value={`− ${formatINR(m.committedRecurring)}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.025] p-3">
      <div className="flex items-center justify-center gap-1.5 text-caption text-muted">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-1 text-body font-semibold text-ink">{value}</p>
    </div>
  );
}
