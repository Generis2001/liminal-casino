"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { reelSpring } from "@/animations/springs";
import { Cherry, Minus, Plus, RotateCcw } from "lucide-react";

const SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "💎", "🍀", "7️⃣", "👑"];
const SYMBOL_PAYOUTS: Record<string, number> = { "👑": 100, "7️⃣": 50, "💎": 25, "⭐": 10, "🔔": 5, "🍀": 5, "🍋": 3, "🍒": 2 };

export default function SlotsPage() {
  const [betAmount, setBetAmount] = useState(5);
  const [reels, setReels] = useState(["🍒", "⭐", "💎"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ won: boolean; payout: number; message: string } | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const newReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
      setReels(newReels);
      setSpinning(false);
      // Check win
      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        const mult = SYMBOL_PAYOUTS[newReels[0]] || 5;
        setResult({ won: true, payout: betAmount * mult, message: `Three of a kind! ${mult}x` });
      } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2]) {
        setResult({ won: true, payout: betAmount * 2, message: "Pair! 2x" });
      } else {
        setResult({ won: false, payout: 0, message: "No match" });
      }
    }, 1500);
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Quantum Slots</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">3-reel • Up to 100x payout</p>
          </div>
          <Badge variant="accent">Jackpot: $12,450</Badge>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="p-8 bg-gradient-to-b from-purple-900/10 to-pink-900/5">
            {/* Slot Machine */}
            <div className="flex justify-center gap-3 md:gap-6 mb-8">
              {reels.map((symbol, i) => (
                <motion.div
                  key={`${i}-${symbol}-${spinning}`}
                  className="w-24 h-28 md:w-32 md:h-36 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-lg"
                  animate={spinning ? { y: [0, -20, 20, -10, 10, 0], rotateX: [0, 360, 720] } : {}}
                  transition={spinning ? { duration: 1 + i * 0.3, ease: "easeInOut" } : reelSpring}
                >
                  <span className="text-4xl md:text-5xl">{spinning ? SYMBOLS[Math.floor(Math.random() * 8)] : symbol}</span>
                </motion.div>
              ))}
            </div>

            {/* Pay Line */}
            <div className="h-0.5 bg-accent-gold/30 mx-4 mb-6 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-gold" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-gold" />
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                  <p className={`text-xl font-display font-bold ${result.won ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                    {result.message}
                  </p>
                  {result.won && <p className="text-sm text-emerald-400/70">+${result.payout} USDC</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.max(1, betAmount - 1))}><Minus className="w-3 h-3" /></Button>
                <span className="font-mono font-bold text-lg min-w-[60px] text-center">${betAmount}</span>
                <Button size="sm" variant="ghost" onClick={() => setBetAmount(betAmount + 1)}><Plus className="w-3 h-3" /></Button>
                <div className="flex gap-1 ml-2">
                  {[1, 5, 10, 25].map((v) => (
                    <button key={v} onClick={() => setBetAmount(v)} className={`px-2 py-1 rounded text-xs ${betAmount === v ? "bg-accent-gold/20 text-accent-gold" : "bg-[var(--bg-card)] text-[var(--text-muted)]"}`}>${v}</button>
                  ))}
                </div>
              </div>
              <Button className="w-full md:w-auto" onClick={spin} isLoading={spinning}>
                <RotateCcw className="w-4 h-4" /> Spin
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Paytable */}
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Paytable</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(SYMBOL_PAYOUTS).map(([sym, mult]) => (
                <div key={sym} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-card)]">
                  <span className="text-lg">{sym}</span>
                  <span className="text-xs font-mono text-accent-gold">{mult}x</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
