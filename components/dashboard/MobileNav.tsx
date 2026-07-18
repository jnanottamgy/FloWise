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
import { useLang } from "@/lib/language";
import { cn } from "@/lib/utils";
import { scrollToSection } from "./Sidebar";

const ITEMS: { icon: LucideIcon; i18n: string; target: string }[] = [
  { icon: LayoutGrid, i18n: "nav.home", target: "top" },
  { icon: ListChecks, i18n: "nav.todo", target: "sec-actions" },
  { icon: Users, i18n: "nav.customers", target: "sec-in" },
  { icon: TrendingUp, i18n: "nav.cashShort", target: "sec-forecast" },
  { icon: MoreHorizontal, i18n: "nav.more", target: "sec-more" },
];

/** Sticky bottom navigation for phones — every item reachable with one thumb. */
export function MobileNav() {
  const { t } = useLang();
  const [active, setActive] = useState("top");
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur md:hidden"
    >
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const label = t(it.i18n);
        const isActive = active === it.target;
        return (
          <button
            key={it.target}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              setActive(it.target);
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
                "max-w-full truncate px-0.5 text-[10px] font-medium",
                isActive ? "text-olive" : "text-muted",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
