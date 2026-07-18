import { cn } from "@/lib/utils";
import type { Risk } from "@/lib/types";

const CONFIG: Record<Risk, { label: string; className: string }> = {
  red: { label: "At risk", className: "bg-error/10 text-[color:var(--error-ink)]" },
  yellow: { label: "Watch", className: "bg-warning/15 text-[color:var(--warning-ink)]" },
  green: { label: "Healthy", className: "bg-success/10 text-[color:var(--success-ink)]" },
};

/** Status conveyed via text label + colour (never colour alone). */
export function RiskBadge({ risk }: { risk: Risk }) {
  const { label, className } = CONFIG[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-medium",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
