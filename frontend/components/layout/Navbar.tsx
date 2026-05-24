"use client";

import { motion } from "framer-motion";
import { useLiminalAuth } from "@/hooks/useLiminalAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { truncateAddress } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Menu, LogOut, ExternalLink, RefreshCw, Wallet, Plus, Landmark } from "lucide-react";
import { UsdcLogo } from "@/components/ui/UsdcLogo";
import { useGameStore } from "@/stores/gameStore";
import { useUSDCBalance } from "@/lib/useUSDCBalance";
import Link from "next/link";
import { useState } from "react";
import { WalletModal } from "@/components/layout/WalletModal";

const getWalletIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'metamask': return '/metamask.svg';
    case 'zerion': return '/zerion.svg';
    default: return null;
  }
};

export function Navbar() {
  const { address, wallet, authenticated, login, logout } = useLiminalAuth();
  const toggleSidebar = useGameStore((s) => s.toggleSidebar);
  const { value: balance, isPending, isLoading, refetch } = useUSDCBalance();
  const [isManualSpin, setIsManualSpin] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const handleRefresh = async () => {
    if (isManualSpin) return;
    setIsManualSpin(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsManualSpin(false), 800);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-40 glass border-b border-[var(--border-color)]">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left: Liminal Logo */}
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2.5 group">
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
          {/* Casino Bankroll */}
          {authenticated && address && (
            <>
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsWalletModalOpen(true)}
                title="Manage Treasury Wallet"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-accent-gold/50 transition-all cursor-pointer group"
              >
                <UsdcLogo size={16} className="group-hover:scale-110 transition-transform" />
                {isLoading ? (
                  <span className="text-sm font-mono text-[var(--text-muted)] w-16">
                    Loading...
                  </span>
                ) : (
                  <AnimatedCounter
                    value={balance}
                    prefix=""
                    suffix=" USDC"
                    decimals={2}
                    className="text-sm font-semibold text-[var(--text-primary)] font-mono"
                  />
                )}
                <Plus className="w-3 h-3 text-[var(--text-muted)] group-hover:text-accent-gold transition-colors ml-1" />
              </motion.button>
              
              <WalletModal 
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
              />
            </>
          )}

          <ThemeToggle />

          {/* Wallet Connection */}
          <div className="flex items-center gap-2">
            {(!authenticated || !address) ? (
              <button
                onClick={() => login()}
                className="px-4 py-1.5 rounded-xl bg-accent-gold/10 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/20 hover:scale-105 active:scale-95 font-semibold text-sm transition-all whitespace-nowrap shadow-[0_0_15px_rgba(196,169,122,0.1)]"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={`https://testnet.arcscan.app/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-accent-gold/30 transition-all group"
                >
                  {getWalletIcon(wallet?.walletClientType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getWalletIcon(wallet?.walletClientType)!} alt="Wallet" className="w-4 h-4 rounded-full group-hover:scale-110 transition-transform" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5 opacity-70 group-hover:text-accent-gold transition-colors" />
                  )}
                  <span className="font-mono text-xs">{truncateAddress(address)}</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logout()}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
