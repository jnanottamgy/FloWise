"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

const MiniSpark = dynamic(() => import("./charts/MiniSpark"), {
  ssr: false,
  loading: () => null,
});

export interface MetricCardProps {
  title: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  series: number[];
  chart: "bar" | "area";
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  format,
  icon: Icon,
  series,
  chart,
  highlight,
}: MetricCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Card
        className={cn(
          "flex items-center justify-between gap-3 p-5",
          highlight && "border-transparent bg-olive text-white",
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                highlight ? "bg-white/15 text-white" : "bg-olive/10 text-olive",
              )}
            >
              <Icon size={16} strokeWidth={2} />
            </span>
            <span
              className={cn(
                "truncate text-caption",
                highlight ? "text-white/80" : "text-muted",
              )}
            >
              {title}
            </span>
          </div>
          <div
            className={cn(
              "mt-3 text-[26px] font-bold leading-none tracking-tight",
              highlight ? "text-white" : "text-ink",
            )}
          >
            <CountUp value={value} format={format} />
          </div>
        </div>
        <div className="h-12 w-20 shrink-0">
          <MiniSpark series={series} chart={chart} highlight={highlight} />
        </div>
      </Card>
    </motion.div>
  );
}
