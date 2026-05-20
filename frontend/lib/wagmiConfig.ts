import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { arcTestnet } from "./arcChain";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    // Use the dedicated metaMask connector for better detection
    metaMask({
      dappMetadata: {
        name: "Liminal Casino",
        url: "https://liminal.vercel.app",
      },
    }),
    // Generic injected for Zerion and other injected wallets
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
