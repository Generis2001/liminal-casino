"use client";

import { motion } from "framer-motion";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnimatedCounter } from "@/components/ui/Counter";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { USDC_ADDRESS } from "@/lib/contracts";
import { truncateAddress } from "@/lib/utils";
import { User, Copy, ExternalLink, Trophy, Flame, Target, LogOut } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: usdcBalance } = useBalance({ address, token: USDC_ADDRESS });
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={staggerItem}>
          <Card glow className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold/30 to-accent-warm/20 flex items-center justify-center">
                <User className="w-8 h-8 text-accent-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-mono text-lg font-semibold">{address ? truncateAddress(address) : ""}</h2>
                  <Badge variant="accent">Gold</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyAddress} className="text-xs text-[var(--text-muted)] hover:text-accent-gold flex items-center gap-1 transition-colors">
                    <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy address"}
                  </button>
                  <a href={`https://testnet.arcscan.app/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-accent-gold flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Explorer
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 text-center" hover={false}>
            <Target className="w-5 h-5 text-accent-gold mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Total Bets</p>
            <p className="text-2xl font-bold font-display">156</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Wins</p>
            <p className="text-2xl font-bold font-display text-emerald-400">89</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Best Streak</p>
            <p className="text-2xl font-bold font-display text-orange-400">12</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">Balance</p>
            <AnimatedCounter value={usdcBalance ? Number(usdcBalance.formatted) : 0} prefix="$" decimals={2} className="text-2xl font-bold font-display text-[var(--text-primary)]" />
            <p className="text-xs text-[var(--text-muted)]">USDC</p>
          </Card>
        </motion.div>

        {/* Game Breakdown */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="font-display font-semibold mb-4">Game Breakdown</h3>
            <div className="space-y-3">
              {[
                { game: "Roulette", bets: 72, wins: 38, wagered: 4500, color: "bg-red-500" },
                { game: "Blackjack", bets: 45, wins: 28, wagered: 3200, color: "bg-emerald-500" },
                { game: "Slots", bets: 39, wins: 23, wagered: 1800, color: "bg-purple-500" },
              ].map((g) => (
                <div key={g.game} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${g.color}`} />
                  <span className="text-sm font-medium w-24">{g.game}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div className={`h-full rounded-full ${g.color}/60`} style={{ width: `${(g.wins / g.bets) * 100}%` }} />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] w-16 text-right">{g.wins}/{g.bets}</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] w-20 text-right">${g.wagered}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Disconnect */}
        <motion.div variants={staggerItem}>
          <Button variant="danger" className="w-full" onClick={() => disconnect()}>
            <LogOut className="w-4 h-4" /> Disconnect Wallet
          </Button>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
