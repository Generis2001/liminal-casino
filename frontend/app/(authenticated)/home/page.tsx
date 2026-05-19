"use client";

import { motion } from "framer-motion";
import { useAccount, useBalance } from "wagmi";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { USDC_ADDRESS } from "@/lib/contracts";
import { truncateAddress } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/animations/variants";
import {
  CircleDot, Spade, Cherry, TrendingUp, Gift, Zap,
  ArrowUpRight, Trophy, Flame, Clock
} from "lucide-react";
import Link from "next/link";

const quickGames = [
  { href: "/roulette", name: "Roulette", icon: CircleDot, color: "from-red-500/20 to-orange-500/20", players: 234 },
  { href: "/blackjack", name: "Blackjack", icon: Spade, color: "from-emerald-500/20 to-teal-500/20", players: 182 },
  { href: "/slots", name: "Slots", icon: Cherry, color: "from-purple-500/20 to-pink-500/20", players: 567 },
  { href: "/predictions", name: "Predictions", icon: TrendingUp, color: "from-blue-500/20 to-indigo-500/20", players: 89 },
];

const recentActivity = [
  { player: "0x8a3f...c2d1", game: "Roulette", result: "Won", amount: 250, time: "2m ago" },
  { player: "0x1b7e...9f4a", game: "Slots", result: "Won", amount: 1200, time: "5m ago" },
  { player: "0x4c2d...a8e3", game: "Blackjack", result: "Lost", amount: 50, time: "8m ago" },
  { player: "0x9f1a...b3c7", game: "Roulette", result: "Won", amount: 75, time: "12m ago" },
  { player: "0x2e8b...d5f2", game: "Prediction", result: "Won", amount: 500, time: "15m ago" },
];

export default function HomePage() {
  const { address } = useAccount();
  const { data: usdcBalance } = useBalance({ address, token: USDC_ADDRESS });
  const balance = usdcBalance ? Number(usdcBalance.formatted) : 0;

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

        {/* Stats Row */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Balance</p>
            <AnimatedCounter value={balance} prefix="$" decimals={2} className="text-2xl font-bold font-display text-[var(--text-primary)]" />
            <p className="text-xs text-[var(--text-muted)] mt-1">USDC</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Won</p>
            <AnimatedCounter value={4250} prefix="$" decimals={0} className="text-2xl font-bold font-display text-emerald-400" />
            <p className="text-xs text-emerald-400/60 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +12.5%</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Win Streak</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display text-accent-gold">7</span>
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Personal best: 12</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">VIP Tier</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display text-accent-gold">Gold</span>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">5,240 / 25,000 XP</p>
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
                  <p className="text-xs text-[var(--text-muted)] mt-1">{game.players} playing</p>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={staggerItem}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/live" className="text-xs text-accent-gold hover:underline">View all</Link>
          </CardHeader>
          <div className="space-y-2">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-warm/20 flex items-center justify-center">
                    <span className="text-xs font-mono text-accent-gold">{activity.player.slice(2, 4)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{activity.player}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-2">{activity.game}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={activity.result === "Won" ? "success" : "danger"}>
                    {activity.result}
                  </Badge>
                  <span className={`text-sm font-semibold font-mono ${activity.result === "Won" ? "text-emerald-400" : "text-red-400"}`}>
                    {activity.result === "Won" ? "+" : "-"}${activity.amount}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
