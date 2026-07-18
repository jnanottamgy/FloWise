"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBusiness } from "@/lib/businessContext";
import { useLang } from "@/lib/language";
import { postAsk } from "@/lib/api";

const SUGGESTION_KEYS = ["ask.q1", "ask.q2", "ask.q3", "ask.q4", "ask.q5"];

export function AskFloWiseCard() {
  const { activeBusiness } = useBusiness();
  const { t, lang } = useLang();
  const [question, setQuestion] = useState("");

  const ask = useMutation({
    mutationFn: (q: string) => postAsk(activeBusiness!, q, lang),
  });

  function submit(q: string) {
    const query = q.trim();
    if (!query || !activeBusiness) return;
    setQuestion(query);
    ask.mutate(query);
  }

  return (
    <Card id="sec-ask" className="scroll-mt-6 sm:col-span-2 xl:col-span-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-olive to-sage text-white">
          <Sparkles size={16} />
        </span>
        <div>
          <h3 className="text-section font-semibold text-ink">{t("ask.title")}</h3>
          <p className="text-caption text-muted">{t("ask.sub")}</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("ask.q2")}
          className="h-12 flex-1 rounded-pill border border-border bg-bg px-5 text-body text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
        />
        <button
          type="submit"
          disabled={ask.isPending || !question.trim()}
          className="inline-flex items-center gap-2 rounded-pill bg-olive px-5 text-body font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50"
        >
          {ask.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {t("ask.button")}
        </button>
      </form>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTION_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => submit(t(k))}
            disabled={ask.isPending}
            className="rounded-pill border border-border px-3 py-1.5 text-caption text-muted transition hover:border-olive/40 hover:text-olive disabled:opacity-50"
          >
            {t(k)}
          </button>
        ))}
      </div>

      {/* Answer */}
      <AnimatePresence>
        {(ask.isPending || ask.data) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl bg-olive/[0.06] p-4"
          >
            {ask.isPending ? (
              <div className="flex items-center gap-2 text-caption text-muted">
                <Loader2 size={14} className="animate-spin text-olive" />
                {t("ask.thinking")}
              </div>
            ) : (
              <p className="text-body leading-relaxed text-ink/85">{ask.data?.answer}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
