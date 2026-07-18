"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { BusinessProvider } from "@/lib/businessContext";
import { LanguageProvider } from "@/lib/language";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <LanguageProvider>
          <BusinessProvider>{children}</BusinessProvider>
        </LanguageProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
