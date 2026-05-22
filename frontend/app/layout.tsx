import type { Metadata } from "next";
import "./globals.css";
import { PrivyAppProvider } from "@/providers/PrivyAppProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Liminal | Decentralized Casino on Arc",
  description:
    "The premium decentralized casino protocol powered by Arc Testnet. Play Roulette, Blackjack, Slots, and Prediction Markets with USDC.",
  keywords: ["casino", "defi", "arc", "blockchain", "usdc", "gambling", "web3"],
  openGraph: {
    title: "Liminal — the LIMINAL space",
    description: "Next-generation decentralized casino on Arc Testnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-body antialiased">
        <ThemeProvider>
          <PrivyAppProvider>{children}</PrivyAppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
