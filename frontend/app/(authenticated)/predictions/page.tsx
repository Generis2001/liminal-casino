"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { TrendingUp, Clock, Users, DollarSign } from "lucide-react";
import { useState } from "react";

const markets = [
  { id: 0, desc: "ETH will reach $5,000 by end of Q2 2026", deadline: "2026-06-30", yesPool: 15000, noPool: 8500, status: "Open", participants: 45 },
  { id: 1, desc: "Arc Mainnet launches before August 2026", deadline: "2026-08-01", yesPool: 32000, noPool: 12000, status: "Open", participants: 128 },
  { id: 2, desc: "Bitcoin dominance drops below 40%", deadline: "2026-07-15", yesPool: 5000, noPool: 18000, status: "Open", participants: 67 },
  { id: 3, desc: "USDC supply exceeds $100B", deadline: "2026-12-31", yesPool: 22000, noPool: 3000, status: "Open", participants: 89 },
];

export default function PredictionsPage() {
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [position, setPosition] = useState<"yes" | "no" | null>(null);
  const [stake, setStake] = useState(10);

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Prediction Markets</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Take positions on real outcomes. Settled onchain.</p>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Active Markets</p><p className="text-2xl font-bold text-accent-gold">{markets.length}</p></Card>
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Total Volume</p><p className="text-2xl font-bold text-emerald-400 font-mono">$115.5K</p></Card>
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Participants</p><p className="text-2xl font-bold text-[var(--text-primary)]">329</p></Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-4">
          {markets.map((m) => {
            const total = m.yesPool + m.noPool;
            const yesPct = total > 0 ? (m.yesPool / total) * 100 : 50;
            return (
              <Card key={m.id} glow className="p-5" onClick={() => setSelectedMarket(selectedMarket === m.id ? null : m.id)}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)] pr-4">{m.desc}</h3>
                  <Badge variant="success">{m.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.deadline}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.participants}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${(total / 1000).toFixed(1)}K volume</span>
                </div>
                {/* Odds Bar */}
                <div className="relative h-8 rounded-full overflow-hidden bg-[var(--bg-card)] mb-3">
                  <motion.div className="absolute left-0 top-0 bottom-0 bg-emerald-500/30 flex items-center pl-3" style={{ width: `${yesPct}%` }} layout>
                    <span className="text-xs font-bold text-emerald-400">YES {yesPct.toFixed(0)}%</span>
                  </motion.div>
                  <motion.div className="absolute right-0 top-0 bottom-0 bg-red-500/30 flex items-center justify-end pr-3" style={{ width: `${100 - yesPct}%` }} layout>
                    <span className="text-xs font-bold text-red-400">NO {(100 - yesPct).toFixed(0)}%</span>
                  </motion.div>
                </div>
                {selectedMarket === m.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3 border-t border-[var(--border-color)] space-y-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant={position === "yes" ? "primary" : "secondary"} className="flex-1" onClick={() => setPosition("yes")}>YES</Button>
                      <Button size="sm" variant={position === "no" ? "primary" : "secondary"} className="flex-1" onClick={() => setPosition("no")}>NO</Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="flex-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2 text-sm font-mono" />
                      <Button size="sm" disabled={!position}>Place ${stake} USDC</Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            );
          })}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
