"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/auth-context";
import { SubunitProvider } from "@/contexts/subunit-context";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubunitProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SubunitProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

