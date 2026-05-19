"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Clock, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";

const txTypes = ["All", "Bets", "Wins", "Deposits", "Withdrawals", "Rewards"];

const transactions = [
  { hash: "0xeba0fc...7346", type: "Bet", game: "Roulette", amount: -50, result: "Loss", time: "2 min ago", status: "Confirmed" },
  { hash: "0x3c9e17...a2b8", type: "Win", game: "Slots", amount: 250, result: "Win", time: "8 min ago", status: "Confirmed" },
  { hash: "0x7d4ab2...e1c3", type: "Bet", game: "Blackjack", amount: -25, result: "Loss", time: "15 min ago", status: "Confirmed" },
  { hash: "0xab2f9d...8c34", type: "Win", game: "Roulette", amount: 100, result: "Win", time: "22 min ago", status: "Confirmed" },
  { hash: "0xfe4a31...b7d6", type: "Deposit", game: "-", amount: 500, result: "-", time: "1 hr ago", status: "Confirmed" },
  { hash: "0x1b7e83...4a9f", type: "Reward", game: "Daily", amount: 4.5, result: "-", time: "5 hrs ago", status: "Confirmed" },
  { hash: "0x2e8bc4...f2a1", type: "Bet", game: "Prediction", amount: -100, result: "Pending", time: "8 hrs ago", status: "Pending" },
  { hash: "0x4c2de7...e3b5", type: "Withdrawal", game: "-", amount: -200, result: "-", time: "1 day ago", status: "Confirmed" },
  { hash: "0x9f1a56...c7d4", type: "Win", game: "Slots", amount: 1200, result: "Jackpot", time: "2 days ago", status: "Confirmed" },
  { hash: "0x6b1d93...e9f8", type: "Bet", game: "Roulette", amount: -75, result: "Loss", time: "3 days ago", status: "Confirmed" },
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = activeFilter === "All" ? transactions : transactions.filter((t) => t.type === activeFilter.slice(0, -1));

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Transaction History</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">All onchain transactions on Arc Testnet</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={staggerItem} className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          {txTypes.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === f ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"}`}>
              {f}
            </button>
          ))}
        </motion.div>

        {/* Transactions */}
        <motion.div variants={staggerItem} className="space-y-2">
          {filtered.map((tx, i) => (
            <motion.div key={tx.hash} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : "-"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tx.type}</span>
                    {tx.game !== "-" && <Badge>{tx.game}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs font-mono text-[var(--text-muted)]">{tx.hash}</code>
                    <a href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-accent-gold" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 justify-end mt-0.5">
                  <Badge variant={tx.status === "Confirmed" ? "success" : "warning"} size="sm">{tx.status}</Badge>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{tx.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
