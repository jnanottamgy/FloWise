// Presentation helpers shared across the UI.

/** ₹ with Indian digit grouping, e.g. 217000 -> "₹2,17,000". */
export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Compact ₹ for tight spaces, e.g. 217000 -> "₹2.17L". */
export function formatINRCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return "₹" + (n / 10_000_000).toFixed(2) + "Cr";
  if (abs >= 100_000) return "₹" + (n / 100_000).toFixed(2) + "L";
  if (abs >= 1_000) return "₹" + (n / 1_000).toFixed(1) + "K";
  return "₹" + Math.round(n).toString();
}

/** "2026-07-04" -> "4 Jul 2026". */
export function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Human relative time from an ISO timestamp to now (client-side). */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
