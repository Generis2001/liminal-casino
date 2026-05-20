"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Button } from "@/components/ui/Button";
import { useUSDCBalance } from "@/lib/useUSDCBalance";
import { truncateAddress } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/animations/variants";
import {
  CircleDot, Spade, Cherry, TrendingUp, Gift, Zap,
  Wallet, ArrowRight, RefreshCw
} from "lucide-react";
import Link from "next/link";

const quickGames = [
  { href: "/roulette", name: "Roulette", icon: CircleDot, color: "from-red-500/20 to-orange-500/20", description: "Spin the wheel" },
  { href: "/blackjack", name: "Blackjack", icon: Spade, color: "from-emerald-500/20 to-teal-500/20", description: "Beat the dealer" },
  { href: "/slots", name: "Slots", icon: Cherry, color: "from-purple-500/20 to-pink-500/20", description: "Match symbols" },
  { href: "/predictions", name: "Predictions", icon: TrendingUp, color: "from-blue-500/20 to-indigo-500/20", description: "Call the market" },
];

export default function HomePage() {
  const { address } = useAccount();
  const { value: balance, formatted, isLoading, isPending, refetch } = useUSDCBalance();

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        {/* Welcome Header */}
        <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">
              {address ? truncateAddress(address) : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/rewards">
              <Button variant="secondary" size="sm">
                <Gift className="w-4 h-4" /> Claim Daily
              </Button>
            </Link>
            <Link href="/lobby">
              <Button size="sm">
                <Zap className="w-4 h-4" /> Play Now
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent-gold/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" /> Wallet Balance
                  {isPending && (
                    <RefreshCw className="w-3 h-3 text-accent-gold animate-spin" />
                  )}
                </p>
                {isLoading ? (
                  <div className="h-9 w-32 rounded-lg bg-[var(--bg-card)] animate-pulse" />
                ) : (
                  <AnimatedCounter
                    value={balance}
                    prefix="$"
                    decimals={2}
                    className="text-3xl font-bold font-display text-[var(--text-primary)]"
                  />
                )}
                <p className="text-xs text-[var(--text-muted)] mt-1">USDC on Arc Testnet</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    Fund Wallet <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
                <button
                  onClick={() => refetch()}
                  className="text-xs text-[var(--text-muted)] hover:text-accent-gold transition-colors flex items-center gap-1 justify-center"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
            </div>
            {!isLoading && balance === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/10"
              >
                <p className="text-xs text-accent-gold">
                  💡 Your balance is empty. Visit the Circle Faucet to get free testnet USDC, then start playing!
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Quick Games */}
        <motion.div variants={staggerItem}>
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-4">Quick Play</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickGames.map((game) => (
              <Link key={game.href} href={game.href}>
                <Card glow className="p-5 text-center group cursor-pointer">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <game.icon className="w-6 h-6 text-[var(--text-primary)]" />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">{game.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{game.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div variants={staggerItem}>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {[
              { step: "1", text: "Fund your wallet with testnet USDC", link: "https://faucet.circle.com", linkText: "Get USDC", done: balance > 0 },
              { step: "2", text: "Pick a game from the lobby", link: "/lobby", linkText: "Browse games", done: false },
              { step: "3", text: "Place your first bet and play", link: "/roulette", linkText: "Try Roulette", done: false },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.done ? "bg-emerald-500/20 text-emerald-400" : "bg-accent-gold/10 text-accent-gold"}`}>
                    {item.done ? "✓" : item.step}
                  </div>
                  <span className={`text-sm ${item.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                    {item.text}
                  </span>
                </div>
                {item.link.startsWith("http") ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-gold hover:underline flex items-center gap-1">
                    {item.linkText} <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <Link href={item.link} className="text-xs text-accent-gold hover:underline flex items-center gap-1">
                    {item.linkText} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
