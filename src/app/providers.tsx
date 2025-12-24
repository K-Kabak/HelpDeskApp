"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" />
        {/* Aria-live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {/* Screen reader announcements for dynamic content */}
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}
