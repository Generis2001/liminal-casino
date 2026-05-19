"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { useState } from "react";

const players = [
  { rank: 1, addr: "0x8a3f...c2d1", wins: 342, wagered: 125000, profit: 18500, streak: 12 },
  { rank: 2, addr: "0x1b7e...9f4a", wins: 298, wagered: 98000, profit: 14200, streak: 8 },
  { rank: 3, addr: "0x4c2d...a8e3", wins: 276, wagered: 87000, profit: 11800, streak: 15 },
  { rank: 4, addr: "0x9f1a...b3c7", wins: 234, wagered: 72000, profit: 9200, streak: 6 },
  { rank: 5, addr: "0x2e8b...d5f2", wins: 198, wagered: 65000, profit: 7800, streak: 4 },
  { rank: 6, addr: "0x7d4a...e1b8", wins: 187, wagered: 54000, profit: 5600, streak: 7 },
  { rank: 7, addr: "0x3c9e...f7a2", wins: 156, wagered: 48000, profit: 4200, streak: 3 },
  { rank: 8, addr: "0x6b1d...c4e9", wins: 143, wagered: 42000, profit: 3100, streak: 9 },
  { rank: 9, addr: "0xab2f...d8c3", wins: 132, wagered: 38000, profit: 2400, streak: 5 },
  { rank: 10, addr: "0xfe4a...a1b7", wins: 121, wagered: 35000, profit: 1900, streak: 2 },
];

const filters = ["All Time", "Weekly", "Daily"];

export default function LeaderboardPage() {
  const [activeFilter, setActiveFilter] = useState("All Time");
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-[var(--text-muted)] w-5 text-center">#{rank}</span>;
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Leaderboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Top players ranked by profit</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === f ? "bg-accent-gold/20 text-accent-gold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{f}</button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Cards */}
        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
          {players.slice(0, 3).map((p, i) => (
            <Card key={p.rank} glow className={`p-5 text-center ${i === 0 ? "ring-1 ring-yellow-400/20" : ""}`}>
              <div className="mb-2">{getRankIcon(p.rank)}</div>
              <p className="font-mono text-sm text-[var(--text-primary)] font-semibold">{p.addr}</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-2">+${(p.profit / 1000).toFixed(1)}K</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{p.wins} wins • ${(p.wagered / 1000).toFixed(0)}K wagered</p>
            </Card>
          ))}
        </motion.div>

        {/* Full List */}
        <motion.div variants={staggerItem} className="space-y-2">
          {players.map((p, i) => (
            <motion.div key={p.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all">
              <div className="flex items-center gap-4">
                {getRankIcon(p.rank)}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-warm/20 flex items-center justify-center">
                  <span className="text-xs font-mono text-accent-gold">{p.addr.slice(2, 4)}</span>
                </div>
                <span className="font-mono text-sm">{p.addr}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-[var(--text-muted)]">{p.wins} wins</span>
                <span className="font-mono font-bold text-emerald-400">+${p.profit.toLocaleString()}</span>
                <Badge variant="accent">{p.streak}🔥</Badge>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
