"use client";

import { useUSDCBlockSync } from "@/lib/useUSDCBalance";

/**
 * Mounts the block-watching subscription that keeps USDC balance
 * in sync with the chain. Must be inside WagmiProvider + QueryClientProvider.
 */
export function BalanceSyncProvider({ children }: { children: React.ReactNode }) {
  useUSDCBlockSync();
  return <>{children}</>;
}
