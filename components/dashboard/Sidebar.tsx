"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  FolderClosed,
  LayoutGrid,
  LogOut,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useBusiness } from "@/lib/businessContext";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const NAV: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: FileText, label: "Invoices" },
  { icon: Sparkles, label: "AI Workspace" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Clients" },
  { icon: FolderClosed, label: "Documents" },
];

function IconButton({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-2xl transition",
        item.active
          ? "bg-ink text-white shadow-soft"
          : "text-muted hover:bg-black/[0.04] hover:text-ink",
      )}
    >
      <Icon size={20} strokeWidth={1.8} />
    </motion.button>
  );
}

export function Sidebar() {
  const router = useRouter();
  const { clearActive } = useBusiness();

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] min-h-[560px] shrink-0 md:block">
      <div className="flex h-full flex-col items-center gap-2 rounded-[32px] border border-border bg-card px-3 py-5 shadow-card">
        <span className="mb-3 text-olive">
          <Logo size={30} />
        </span>

        <nav className="flex flex-col items-center gap-2">
          {NAV.map((item) => (
            <IconButton
              key={item.label}
              item={item}
              onClick={
                item.active ? () => router.push("/dashboard") : undefined
              }
            />
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-2">
          <IconButton item={{ icon: Settings, label: "Settings" }} />
          <IconButton
            item={{ icon: LogOut, label: "Log out" }}
            onClick={() => {
              clearActive();
              router.push("/");
            }}
          />
          <div className="mt-2 grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-olive to-sage text-caption font-semibold text-white">
            AT
          </div>
        </div>
      </div>
    </aside>
  );
}
