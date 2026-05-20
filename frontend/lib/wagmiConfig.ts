import { http, webSocket, createConfig, fallback } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "./arcChain";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    // Prefer WebSocket for real-time block subscriptions; fall back to HTTP
    [arcTestnet.id]: fallback([
      webSocket("wss://rpc.testnet.arc.network"),
      http("https://rpc.testnet.arc.network"),
    ]),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
