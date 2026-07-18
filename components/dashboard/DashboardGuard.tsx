"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/lib/businessContext";

/** Gate the dashboard: send visitors back to onboarding until a workspace
 *  is chosen. Waits for localStorage hydration to avoid a false redirect. */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { ready, activeBusiness } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (ready && !activeBusiness) router.replace("/");
  }, [ready, activeBusiness, router]);

  if (!ready || !activeBusiness) {
    return (
      <div className="grid min-h-screen place-items-center text-caption text-muted">
        Loading workspace…
      </div>
    );
  }
  return <>{children}</>;
}
