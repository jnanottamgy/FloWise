"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  LayoutGrid,
  LogOut,
  Receipt,
  Settings,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useBusiness } from "@/lib/businessContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  target: string; // element id, or "top"
}

const NAV: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", target: "top" },
  { icon: Wallet, label: "Money", target: "sec-money" },
  { icon: FileText, label: "Invoices", target: "sec-invoices" },
  { icon: Sparkles, label: "AI Workspace", target: "sec-ai" },
  { icon: BarChart3, label: "Analytics", target: "sec-analytics" },
  { icon: Receipt, label: "Transactions", target: "sec-transactions" },
];

export function scrollToSection(target: string) {
  if (target === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document
    .getElementById(target)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Sidebar() {
  const router = useRouter();
  const { clearActive } = useBusiness();
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] min-h-[560px] shrink-0 md:block">
      <div className="flex h-full flex-col items-center gap-2 rounded-[32px] border border-border bg-card px-3 py-5 shadow-card">
        <span className="mb-3 text-olive">
          <Logo size={30} />
        </span>

        <nav className="flex flex-col items-center gap-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;
            return (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActive(item.label);
                  scrollToSection(item.target);
                }}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative grid h-11 w-11 place-items-center rounded-2xl transition"
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-ink shadow-soft"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className={cn(
                    "relative z-10 transition-colors",
                    isActive ? "text-white" : "text-muted",
                  )}
                />
              </motion.button>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            title="Settings"
            aria-label="Settings"
            className="grid h-11 w-11 place-items-center rounded-2xl text-muted transition hover:bg-black/[0.04] hover:text-ink"
          >
            <Settings size={20} strokeWidth={1.8} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            title="Log out"
            aria-label="Log out"
            onClick={() => {
              clearActive();
              router.push("/");
            }}
            className="grid h-11 w-11 place-items-center rounded-2xl text-muted transition hover:bg-black/[0.04] hover:text-ink"
          >
            <LogOut size={20} strokeWidth={1.8} />
          </motion.button>
          <div className="mt-2 grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-olive to-sage text-caption font-semibold text-white">
            AT
          </div>
        </div>
      </div>
    </aside>
  );
}
