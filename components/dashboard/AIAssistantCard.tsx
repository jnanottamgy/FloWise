"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSummary } from "@/lib/dashboardData";

export function AIAssistantCard() {
  const { data, isLoading } = useSummary();

  return (
    <Card className="flex flex-col">
      {/* Glowing AI orb */}
      <div className="relative mx-auto mt-2 grid h-20 w-20 place-items-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-olive/25 blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-olive to-sage text-white shadow-soft">
          <Sparkles size={22} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-caption font-medium text-muted">AI Ready</span>
      </div>

      <div className="mt-3 flex-1">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-black/[0.06]"
                style={{ width: `${90 - i * 12}%`, margin: "0 auto" }}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-caption leading-relaxed text-ink/80">
            {data?.aiSummary}
          </p>
        )}
      </div>

      <button className="mt-4 w-full rounded-pill bg-olive py-2.5 text-caption font-semibold text-white transition hover:bg-olive-dark">
        Launch AI Assistant
      </button>
    </Card>
  );
}
