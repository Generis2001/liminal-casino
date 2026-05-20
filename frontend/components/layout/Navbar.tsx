"use client";

import { motion } from "framer-motion";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { truncateAddress } from "@/lib/utils";
import { USDC_ADDRESS } from "@/lib/contracts";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import Link from "next/link";

export function Navbar() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const toggleSidebar = useGameStore((s) => s.toggleSidebar);

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    query: { refetchInterval: 5000 },
  });

  const balance = usdcBalance ? Number(usdcBalance.formatted) : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-40 glass border-b border-[var(--border-color)]">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Liminal Logo + Nav */}
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2.5 group">
            {/* Liminal L logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/liminal-logo.svg" alt="Liminal" className="w-8 h-8" />
            <span className="font-display font-bold text-lg text-[var(--text-primary)] hidden md:block group-hover:text-accent-gold transition-colors">
              Liminal
            </span>
          </Link>

          <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden md:block" />

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Balance, Theme, Wallet */}
        <div className="flex items-center gap-3">
          {/* USDC Balance */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">$</span>
            </div>
            <AnimatedCounter
              value={balance}
              prefix=""
              suffix=" USDC"
              decimals={2}
              className="text-sm font-semibold text-[var(--text-primary)] font-mono"
            />
          </motion.div>

          <ThemeToggle />

          {/* Wallet */}
          {address && (
            <div className="flex items-center gap-2">
              <a
                href={`https://testnet.arcscan.app/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-accent-gold/30 transition-all"
              >
                <span className="font-mono text-xs">{truncateAddress(address)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => disconnect()}
                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
