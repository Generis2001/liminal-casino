"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Landmark, TrendingUp, Shield, DollarSign, BarChart3, Lock } from "lucide-react";

export default function TreasuryPage() {
  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Treasury Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Onchain treasury health and metrics</p>
          </div>
          <Badge variant="success"><Shield className="w-3 h-3 mr-1" />Secure</Badge>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5" hover={false}>
            <DollarSign className="w-5 h-5 text-accent-gold mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total Balance</p>
            <AnimatedCounter value={248500} prefix="$" decimals={0} className="text-2xl font-bold font-display text-[var(--text-primary)]" />
          </Card>
          <Card className="p-5" hover={false}>
            <Landmark className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Bankroll</p>
            <AnimatedCounter value={185000} prefix="$" decimals={0} className="text-2xl font-bold font-display text-blue-400" />
          </Card>
          <Card className="p-5" hover={false}>
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">24h Revenue</p>
            <AnimatedCounter value={3420} prefix="$" decimals={0} className="text-2xl font-bold font-display text-emerald-400" />
          </Card>
          <Card className="p-5" hover={false}>
            <BarChart3 className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Utilization</p>
            <AnimatedCounter value={34.2} suffix="%" decimals={1} className="text-2xl font-bold font-display text-purple-400" />
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Bankroll Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Max Exposure (10%)</span><span className="font-mono">$18,500</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: "34%" }} transition={{ duration: 1 }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Active Bets</span><span className="font-mono">$6,340</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ duration: 1 }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Reward Pool</span><span className="font-mono">$12,800</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-accent-gold" initial={{ width: 0 }} animate={{ width: "52%" }} transition={{ duration: 1 }} /></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Contract Addresses</h2>
            <div className="space-y-3">
              {[
                { label: "Treasury", addr: "0x32368...c4BF" },
                { label: "Casino", addr: "0x1a2b3...d4e5" },
                { label: "Prediction", addr: "0x5f6a7...b8c9" },
                { label: "Rewards", addr: "0x9d8e7...f6a5" },
                { label: "USDC", addr: "0x3600000...0000" },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-[var(--text-muted)]" /><span className="text-sm font-medium">{c.label}</span></div>
                  <code className="text-xs font-mono text-[var(--text-muted)]">{c.addr}</code>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
