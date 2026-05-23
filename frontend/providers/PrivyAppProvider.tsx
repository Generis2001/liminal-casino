"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { Web3Provider } from "./Web3Provider";
import { privyConfig } from "@/lib/privyConfig";
import { NetworkEnforcer } from "./NetworkEnforcer";

export function PrivyAppProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn(
      "[Liminal] NEXT_PUBLIC_PRIVY_APP_ID is not set. " +
      "Get your App ID from https://console.privy.io and add it to .env.local"
    );
  }

  return (
    <PrivyProvider
      appId={appId ?? "clpispdty00ycl80fpueukbhl"} // fallback to Privy demo app
      config={privyConfig}
    >
      <NetworkEnforcer>
        <Web3Provider>{children}</Web3Provider>
      </NetworkEnforcer>
    </PrivyProvider>
  );
}
