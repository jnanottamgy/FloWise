"use client";

import { useState } from "react";
import {
  LayoutGrid,
  ListChecks,
  MoreHorizontal,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "./Sidebar";

const ITEMS: { icon: LucideIcon; label: string; target: string }[] = [
  { icon: LayoutGrid, label: "Home", target: "top" },
  { icon: ListChecks, label: "To-do", target: "sec-actions" },
  { icon: Users, label: "Customers", target: "sec-in" },
  { icon: TrendingUp, label: "Cash flow", target: "sec-forecast" },
  { icon: MoreHorizontal, label: "More", target: "sec-more" },
];

/** Collapsed sidebar for small screens: a horizontal icon rail. */
export function MobileNav() {
  const [active, setActive] = useState("Dashboard");
  return (
    <nav
      aria-label="Primary"
      className="mb-4 flex items-center gap-2 overflow-x-auto rounded-full border border-border bg-card p-2 shadow-soft md:hidden"
    >
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.label;
        return (
          <button
            key={it.label}
            aria-label={it.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              setActive(it.label);
              scrollToSection(it.target);
            }}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
              isActive ? "bg-ink text-white" : "text-muted hover:bg-black/[0.04]",
            )}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}
