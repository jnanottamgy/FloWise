import "server-only";

// Tiny best-effort in-memory token bucket, keyed per caller. For a single-instance
// hosted deploy this caps abuse of the paid AI routes; it is NOT distributed, and
// callers should degrade gracefully (serve the deterministic fallback) when tripped.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic cleanup so the map can't grow unbounded.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** Best-effort caller identity from proxy headers (falls back to "local"). */
export function callerKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local").slice(0, 64);
}
