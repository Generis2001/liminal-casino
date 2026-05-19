"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { bouncySpring } from "@/animations/springs";
import { CircleDot, Minus, Plus, RotateCcw, History } from "lucide-react";

const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

const betTypes = [
  { label: "Red", value: 1, payout: "2x" },
  { label: "Black", value: 2, payout: "2x" },
  { label: "Even", value: 3, payout: "2x" },
  { label: "Odd", value: 4, payout: "2x" },
  { label: "1-18", value: 5, payout: "2x" },
  { label: "19-36", value: 6, payout: "2x" },
  { label: "1st 12", value: 11, payout: "3x" },
  { label: "2nd 12", value: 11, payout: "3x" },
  { label: "3rd 12", value: 11, payout: "3x" },
];

export default function RoulettePage() {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 0, 32, 15, 4, 21, 2, 25, 36, 8]);

  const handleSpin = () => {
    if (!selectedBet && selectedNumber === null) return;
    setIsSpinning(true);
    setResult(null);
    
    setTimeout(() => {
      const newResult = Math.floor(Math.random() * 37);
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 19)]);
      setIsSpinning(false);
    }, 2000);
  };

  const getNumberColor = (n: number) => {
    if (n === 0) return "bg-emerald-600";
    return RED_NUMBERS.includes(n) ? "bg-red-600" : "bg-gray-800";
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Roulette</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">European Roulette • 2.7% house edge</p>
          </div>
          <Badge variant="accent">Provably Fair</Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel & Result */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <Card className="p-6 relative overflow-hidden">
              {/* Roulette Wheel Visual */}
              <div className="flex items-center justify-center py-12 relative">
                <motion.div
                  animate={isSpinning ? { rotate: 1800 } : { rotate: 0 }}
                  transition={isSpinning ? { duration: 2, ease: "easeOut" } : { duration: 0 }}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-accent-gold/30 flex items-center justify-center relative"
                  style={{
                    background: "conic-gradient(from 0deg, #dc2626 0%, #1f2937 10%, #dc2626 20%, #1f2937 30%, #dc2626 40%, #1f2937 50%, #16a34a 52%, #dc2626 55%, #1f2937 65%, #dc2626 75%, #1f2937 85%, #dc2626 95%, #1f2937 100%)",
                  }}
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--border-color)] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {result !== null ? (
                        <motion.div
                          key={result}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={bouncySpring}
                          className="text-center"
                        >
                          <span className={`inline-block w-10 h-10 rounded-full ${getNumberColor(result)} text-white font-bold text-lg flex items-center justify-center`}>
                            {result}
                          </span>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {result === 0 ? "Green" : RED_NUMBERS.includes(result) ? "Red" : "Black"}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div key="idle" className="text-center">
                          <CircleDot className="w-8 h-8 text-accent-gold mx-auto" />
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {isSpinning ? "Spinning..." : "Place bet"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-12 gap-1 mt-4">
                <div
                  onClick={() => { setSelectedNumber(0); setSelectedBet(null); }}
                  className={`col-span-12 h-8 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                    selectedNumber === 0 ? "ring-2 ring-accent-gold scale-105" : ""
                  } bg-emerald-600 text-white hover:opacity-80`}
                >
                  0
                </div>
                {ROULETTE_NUMBERS.slice(1).map((n) => (
                  <div
                    key={n}
                    onClick={() => { setSelectedNumber(n); setSelectedBet(null); }}
                    className={`h-8 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                      selectedNumber === n ? "ring-2 ring-accent-gold scale-110" : ""
                    } ${getNumberColor(n)} text-white hover:opacity-80`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Bet Panel */}
          <motion.div variants={staggerItem} className="space-y-4">
            <Card className="p-5">
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Place Bet</h3>
              
              {/* Bet Amount */}
              <div className="mb-4">
                <label className="text-xs text-[var(--text-muted)] mb-2 block">Bet Amount (USDC)</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.max(1, betAmount - 5))}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="text-center font-mono"
                  />
                  <Button size="sm" variant="ghost" onClick={() => setBetAmount(betAmount + 5)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[5, 10, 25, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setBetAmount(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        betAmount === v
                          ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                          : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Types */}
              <div className="mb-4">
                <label className="text-xs text-[var(--text-muted)] mb-2 block">Bet Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {betTypes.map((bet) => (
                    <button
                      key={bet.label}
                      onClick={() => { setSelectedBet(bet.label); setSelectedNumber(null); }}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedBet === bet.label
                          ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                          : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <div>{bet.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{bet.payout}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedNumber !== null && (
                <p className="text-xs text-accent-gold mb-3">Straight bet on {selectedNumber} — 36x payout</p>
              )}

              <Button
                className="w-full"
                onClick={handleSpin}
                isLoading={isSpinning}
                disabled={!selectedBet && selectedNumber === null}
              >
                <RotateCcw className="w-4 h-4" />
                {isSpinning ? "Spinning..." : `Spin — $${betAmount} USDC`}
              </Button>
            </Card>

            {/* History */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Recent Spins</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((n, i) => (
                  <motion.div
                    key={`${n}-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`w-8 h-8 rounded-lg ${getNumberColor(n)} text-white text-xs font-bold flex items-center justify-center ${i === 0 ? "ring-2 ring-accent-gold" : ""}`}
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
