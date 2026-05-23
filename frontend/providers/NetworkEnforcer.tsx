"use client";

import { useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";
import { arcTestnet } from "@/lib/arcChain";

export function NetworkEnforcer({ children }: { children: React.ReactNode }) {
  const { wallets } = useWallets();
  const activeWallet = wallets[0];

  useEffect(() => {
    if (activeWallet) {
      const currentChainId = activeWallet.chainId;
      // Privy returns chainId in EIP-155 format: `eip155:5042002`
      const expectedChainId = `eip155:${arcTestnet.id}`;
      
      if (currentChainId !== expectedChainId) {
        // Automatically request network switch (EIP-3326). 
        // Falls back to adding network (EIP-3085) if not present.
        activeWallet.switchChain(arcTestnet.id).catch((err) => {
          console.error("[Liminal] Failed to enforce Arc Testnet:", err);
        });
      }
    }
  }, [activeWallet, activeWallet?.chainId]);

  return <>{children}</>;
}
