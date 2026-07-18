"use client";

import { Bell, MessageSquare, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { BusinessSwitcher } from "./BusinessSwitcher";
import { ExportMenu } from "./ExportMenu";
import { useBusiness } from "@/lib/businessContext";
import { cn } from "@/lib/utils";

function CircleButton({
  children,
  label,
  dot,
  className,
}: {
  children: React.ReactNode;
  label: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      aria-label={label}
      className={cn(
        "glass-hover relative grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-ink shadow-soft",
        className,
      )}
    >
      {children}
      {dot && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-error ring-2 ring-card" />
      )}
    </motion.button>
  );
}

export function Header() {
  const { activeBusiness } = useBusiness();

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <span className="mt-1 text-olive">
          <Logo size={40} />
        </span>
        <div>
          <BusinessSwitcher />
          <h1 className="mt-3 text-hero font-bold text-ink">Good morning</h1>
          <p className="text-body text-muted">
            {activeBusiness?.industry
              ? `${activeBusiness.industry} · `
              : ""}
            your cash flow at a glance
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Full search pill on sm+; collapses to an icon button on mobile */}
        <div className="glass-hover hidden h-12 items-center gap-2 rounded-full border border-border bg-card pl-5 pr-1.5 shadow-soft sm:flex">
          <input
            placeholder="Search invoices…"
            aria-label="Search invoices"
            className="w-40 bg-transparent text-body text-ink outline-none placeholder:text-muted md:w-56"
          />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white">
            <Search size={16} />
          </span>
        </div>
        <CircleButton label="Search" className="sm:hidden">
          <Search size={18} />
        </CircleButton>
        <ExportMenu />
        <CircleButton label="Messages" dot>
          <MessageSquare size={18} />
        </CircleButton>
        <CircleButton label="Notifications">
          <Bell size={18} />
        </CircleButton>
      </div>
    </header>
  );
}
