"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-hero font-bold text-ink">Something went wrong</h2>
      <p className="text-body text-muted">
        FloWise hit an unexpected error. Your data is stored on your device and is safe.
      </p>
      <button
        onClick={reset}
        className="rounded-pill bg-olive px-6 py-3 text-body font-semibold text-white transition hover:bg-olive-dark"
      >
        Reload
      </button>
    </div>
  );
}
