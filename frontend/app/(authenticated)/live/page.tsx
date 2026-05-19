"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Radio, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

const liveFeed = [
  { id: 1, player: "0x8a3f...c2d1", game: "Roulette", bet: 100, result: "Won", payout: 200, time: Date.now() - 5000 },
  { id: 2, player: "0x1b7e...9f4a", game: "Slots", bet: 25, result: "Won", payout: 2500, time: Date.now() - 12000 },
  { id: 3, player: "0x4c2d...a8e3", game: "Blackjack", bet: 50, result: "Lost", payout: 0, time: Date.now() - 18000 },
  { id: 4, player: "0x9f1a...b3c7", game: "Roulette", bet: 200, result: "Won", payout: 400, time: Date.now() - 25000 },
  { id: 5, player: "0x2e8b...d5f2", game: "Slots", bet: 10, result: "Won", payout: 100, time: Date.now() - 30000 },
  { id: 6, player: "0x7d4a...e1b8", game: "Blackjack", bet: 75, result: "Won", payout: 150, time: Date.now() - 42000 },
  { id: 7, player: "0x3c9e...f7a2", game: "Roulette", bet: 500, result: "Lost", payout: 0, time: Date.now() - 55000 },
  { id: 8, player: "0x6b1d...c4e9", game: "Prediction", bet: 1000, result: "Pending", payout: 0, time: Date.now() - 60000 },
];

export default function LivePage() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Live Games</h1>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ scale: pulse ? 1.2 : 1, opacity: pulse ? 1 : 0.5 }}
                  className="w-2 h-2 rounded-full bg-red-500"
                />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">Real-time activity across all games</p>
          </div>
          <div className="flex gap-3">
            <Card className="p-3 text-center" hover={false}>
              <p className="text-xs text-[var(--text-muted)]">Active Players</p>
              <p className="text-lg font-bold text-accent-gold font-mono">1,072</p>
            </Card>
            <Card className="p-3 text-center" hover={false}>
              <p className="text-xs text-[var(--text-muted)]">24h Volume</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">$48.2K</p>
            </Card>
          </div>
        </motion.div>

        {/* Big Wins Banner */}
        <motion.div variants={staggerItem}>
          <Card glow className="p-5 bg-gradient-to-r from-yellow-500/5 via-amber-500/10 to-yellow-500/5">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">🎉 Big Win!</p>
                <p className="text-xs text-[var(--text-secondary)]">0x1b7e...9f4a won <span className="font-bold text-yellow-400">$2,500</span> on Quantum Slots</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Live Feed */}
        <motion.div variants={staggerItem} className="space-y-2">
          {liveFeed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-warm/20 flex items-center justify-center">
                  <span className="text-xs font-mono text-accent-gold">{item.player.slice(2, 4)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono text-[var(--text-primary)]">{item.player}</span>
                    <Badge variant="default">{item.game}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text-muted)]">Bet: ${item.bet}</span>
                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">{Math.floor((Date.now() - item.time) / 1000)}s ago</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={item.result === "Won" ? "success" : item.result === "Pending" ? "warning" : "danger"}>
                  {item.result}
                </Badge>
                {item.payout > 0 && (
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">+${item.payout}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
