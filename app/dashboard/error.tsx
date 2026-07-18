"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-section font-semibold text-ink">Something went wrong here</h2>
      <p className="text-body text-muted">
        A part of your dashboard failed to load. Your data is safe — try again.
      </p>
      <button
        onClick={reset}
        className="rounded-pill bg-olive px-6 py-3 text-body font-semibold text-white transition hover:bg-olive-dark"
      >
        Try again
      </button>
    </div>
  );
}
