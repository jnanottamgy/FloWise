"use client";

import dynamic from "next/dynamic";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/lib/dashboardData";
import { useLang } from "@/lib/language";
import { formatINRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const ForecastChart = dynamic(() => import("./charts/ForecastChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-black/[0.02]" />,
});

function Horizon({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/[0.025] p-2.5 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 text-body font-bold text-ink">{formatINRCompact(value)}</p>
    </div>
  );
}

export function ForecastCard() {
  const { forecast: f } = useOverview();
  const { t } = useLang();

  if (!f) {
    return <Card id="sec-forecast" className="scroll-mt-6 h-80 animate-pulse bg-black/[0.02] sm:col-span-2" />;
  }

  return (
    <Card id="sec-forecast" className="scroll-mt-6 flex flex-col sm:col-span-2">
      <div>
        <h3 className="text-section font-semibold text-ink">{t("fc.title")}</h3>
        <p className="text-caption text-muted">{t("fc.sub")}</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <Horizon label={t("fc.today")} value={f.horizons.d0} />
        <Horizon label={t("fc.7")} value={f.horizons.d7} />
        <Horizon label={t("fc.30")} value={f.horizons.d30} />
        <Horizon label={t("fc.90")} value={f.horizons.d90} />
      </div>

      <div className="mt-3 h-40 w-full">
        <ForecastChart points={f.points} threshold={f.threshold} />
      </div>

      <div
        className={cn(
          "mt-3 flex items-start gap-2 rounded-2xl p-3 text-caption leading-relaxed",
          f.status === "healthy"
            ? "bg-success/[0.06] text-ink/80"
            : f.status === "watch"
              ? "bg-warning/[0.09] text-ink/85"
              : "bg-error/[0.07] text-ink/85",
        )}
      >
        {f.status === "healthy" ? (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
        ) : (
          <TriangleAlert
            size={16}
            className={cn(
              "mt-0.5 shrink-0",
              f.status === "watch" ? "text-warning" : "text-error",
            )}
          />
        )}
        <span>{f.explanation}</span>
      </div>
    </Card>
  );
}
