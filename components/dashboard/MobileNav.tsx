"use client";

import {
  BarChart3,
  FileText,
  FolderClosed,
  LayoutGrid,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: FileText, label: "Invoices" },
  { icon: Sparkles, label: "AI Workspace" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Clients" },
  { icon: FolderClosed, label: "Documents" },
];

/** Collapsed sidebar for small screens: a horizontal icon rail. */
export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="mb-4 flex items-center gap-2 overflow-x-auto rounded-full border border-border bg-card p-2 shadow-soft md:hidden"
    >
      {ITEMS.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.label}
            aria-label={it.label}
            aria-current={it.active ? "page" : undefined}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
              it.active ? "bg-ink text-white" : "text-muted hover:bg-black/[0.04]",
            )}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}
