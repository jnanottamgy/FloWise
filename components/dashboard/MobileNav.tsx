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
  { icon: TrendingUp, label: "Cash", target: "sec-forecast" },
  { icon: MoreHorizontal, label: "More", target: "sec-more" },
];

/** Sticky bottom navigation for phones — every item reachable with one thumb. */
export function MobileNav() {
  const [active, setActive] = useState("Home");
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur md:hidden"
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
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.8}
              className={isActive ? "text-olive" : "text-muted"}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                isActive ? "text-olive" : "text-muted",
              )}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
