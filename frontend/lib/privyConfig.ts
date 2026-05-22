import type { PrivyClientConfig } from "@privy-io/react-auth";
import { arcTestnet } from "@/lib/arcChain";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "wallet", "google", "twitter"],
  appearance: {
    theme: "dark",
    accentColor: "#C4A97A",
    logo: "/liminal-logo.svg",
    showWalletLoginFirst: false,
    landingHeader: "Enter the Liminal Space",
    loginMessage: "Sign in to play on Arc Testnet",
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  defaultChain: arcTestnet,
  supportedChains: [arcTestnet],
  // Session persists across refresh
  // No additional config needed — Privy handles this natively
};
