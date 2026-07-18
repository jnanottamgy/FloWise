"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useInsight, useSummary } from "@/lib/dashboardData";
import { summaryTemplate } from "@/lib/drafts";

export function AIAssistantCard() {
  const { data: sum } = useSummary();
  const { data: insight, isFetching } = useInsight();

  // Instant deterministic summary; silently upgraded to Gemma when it arrives.
  const deterministic = sum ? summaryTemplate(sum.business.name, sum.metrics) : "";
  const text = insight?.aiSummary || deterministic;
  const refining = isFetching && !insight;

  return (
    <Card id="sec-ai" className="scroll-mt-6 flex flex-col">
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
        {refining ? (
          <>
            <Loader2 size={13} className="animate-spin text-olive" />
            <span className="text-caption font-medium text-muted">
              Gemma refining…
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-caption font-medium text-muted">AI Ready</span>
          </>
        )}
      </div>

      <div className="mt-3 flex-1">
        {text ? (
          <p className="text-center text-caption leading-relaxed text-ink/80">
            {text}
          </p>
        ) : (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-black/[0.06]"
                style={{ width: `${90 - i * 12}%`, margin: "0 auto" }}
              />
            ))}
          </div>
        )}
      </div>

      <button className="mt-4 w-full rounded-pill bg-olive py-2.5 text-caption font-semibold text-white transition hover:bg-olive-dark">
        Launch AI Assistant
      </button>
    </Card>
  );
}
