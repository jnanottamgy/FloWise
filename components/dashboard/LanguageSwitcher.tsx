"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useLang } from "@/lib/language";
import { LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.key === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="glass-hover flex h-12 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-caption font-medium text-ink shadow-soft"
      >
        <Globe size={16} /> <span className="hidden sm:inline">{current?.native}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-card"
            >
              {LANGS.map((l) => (
                <li key={l.key}>
                  <button
                    role="option"
                    aria-selected={l.key === lang}
                    onClick={() => {
                      setLang(l.key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-caption transition hover:bg-black/[0.03]",
                      l.key === lang ? "font-semibold text-olive" : "text-ink",
                    )}
                  >
                    {l.native}
                    {l.key === lang && <Check size={14} />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
