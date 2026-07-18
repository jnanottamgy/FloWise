"use client";

import { useEffect, useState } from "react";
import { Check, Copy, FileText, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSummary } from "@/lib/dashboardData";
import { useBusiness } from "@/lib/businessContext";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function TemplatesCard() {
  const { activeBusiness } = useBusiness();
  const { data: summary } = useSummary();
  const [activeKey, setActiveKey] = useState(TEMPLATES[0].key);
  const [text, setText] = useState("");
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);

  const businessName = activeBusiness?.name ?? "Your business";

  // Fill the selected template until the owner edits it.
  useEffect(() => {
    if (edited) return;
    const def = TEMPLATES.find((t) => t.key === activeKey)!;
    setText(def.build({ businessName, metrics: summary?.metrics }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, businessName, summary?.metrics, edited]);

  function pick(key: string) {
    setActiveKey(key);
    setEdited(false);
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* blocked */
    }
  }

  return (
    <Card id="sec-templates" className="scroll-mt-6 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-section font-semibold text-ink">Templates</h3>
        <FileText size={18} className="text-olive" />
      </div>
      <p className="text-caption text-muted">Ready-made messages — pick, tweak, send</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => pick(t.key)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-caption font-medium transition",
              activeKey === t.key
                ? "border-olive bg-olive/10 text-olive"
                : "border-border text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setEdited(true);
        }}
        rows={8}
        className="mt-3 w-full resize-none rounded-3xl border border-border bg-bg p-4 text-body leading-relaxed text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/30"
      />

      <div className="mt-3 flex items-center gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-4 py-2 text-caption font-medium text-success transition hover:bg-success/20"
        >
          <MessageCircle size={15} /> WhatsApp
        </a>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-pill border border-border px-4 py-2 text-caption font-medium text-ink transition hover:bg-black/[0.03]"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Card>
  );
}
