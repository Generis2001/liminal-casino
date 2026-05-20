"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { BalanceSyncProvider } from "./BalanceSyncProvider";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh — balance reads are cheap
            staleTime: 0,
            // Refetch every 3s as a safety net (block watch handles most cases)
            refetchInterval: 3_000,
            // Don't retry stale reads aggressively
            retry: 1,
            // Always refetch on window focus to catch missed blocks
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BalanceSyncProvider>
          {children}
        </BalanceSyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
