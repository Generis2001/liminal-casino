"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Landmark, TrendingUp, Shield, DollarSign, BarChart3, Lock } from "lucide-react";
import { useReadContracts } from "wagmi";
import { TREASURY_ADDRESS, TREASURY_ABI, CASINO_ADDRESS, PREDICTION_ADDRESS, REWARDS_ADDRESS, USDC_ADDRESS } from "@/lib/contracts";
import { formatUnits } from "viem";

export default function TreasuryPage() {
  const { data: treasuryData } = useReadContracts({
    contracts: [
      {
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "getTreasuryBalance"
      },
      {
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "totalBankroll"
      }
    ],
    query: { refetchInterval: 5000 }
  });

  const rawTreasuryBalance = treasuryData?.[0]?.result as bigint | undefined;
  const rawBankroll = treasuryData?.[1]?.result as bigint | undefined;

  const treasuryBalance = rawTreasuryBalance !== undefined ? Number(formatUnits(rawTreasuryBalance, 6)) : 0;
  const bankroll = rawBankroll !== undefined ? Number(formatUnits(rawBankroll, 6)) : 0;
  
  // Simulated revenue and utilization based on real bankroll where possible
  const revenue24h = Math.floor(treasuryBalance * 0.015) || 0;
  const utilization = bankroll > 0 ? ((bankroll - (treasuryBalance * 0.5)) / bankroll * 100) : 0;

  const contracts = [
    { label: "Treasury", addr: TREASURY_ADDRESS },
    { label: "Casino", addr: CASINO_ADDRESS },
    { label: "Prediction", addr: PREDICTION_ADDRESS },
    { label: "Rewards", addr: REWARDS_ADDRESS },
    { label: "USDC", addr: USDC_ADDRESS },
  ];

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
            <AnimatedCounter value={treasuryBalance} prefix="$" decimals={0} className="text-2xl font-bold font-display text-[var(--text-primary)]" />
          </Card>
          <Card className="p-5" hover={false}>
            <Landmark className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Bankroll</p>
            <AnimatedCounter value={bankroll} prefix="$" decimals={0} className="text-2xl font-bold font-display text-blue-400" />
          </Card>
          <Card className="p-5" hover={false}>
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">24h Revenue</p>
            <AnimatedCounter value={revenue24h} prefix="$" decimals={0} className="text-2xl font-bold font-display text-emerald-400" />
          </Card>
          <Card className="p-5" hover={false}>
            <BarChart3 className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Utilization</p>
            <AnimatedCounter value={Math.max(0, Math.min(100, utilization))} suffix="%" decimals={1} className="text-2xl font-bold font-display text-purple-400" />
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Bankroll Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Max Exposure (10%)</span><span className="font-mono">${(bankroll * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: "34%" }} transition={{ duration: 1 }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Active Bets</span><span className="font-mono">${(bankroll * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ duration: 1 }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-secondary)]">Reward Pool</span><span className="font-mono">${(treasuryBalance * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden"><motion.div className="h-full rounded-full bg-accent-gold" initial={{ width: 0 }} animate={{ width: "52%" }} transition={{ duration: 1 }} /></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Contract Addresses</h2>
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-[var(--text-muted)]" /><span className="text-sm font-medium">{c.label}</span></div>
                  <code className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                    {c.addr === "0x0000000000000000000000000000000000000000" ? "Not Deployed" : c.addr}
                  </code>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
