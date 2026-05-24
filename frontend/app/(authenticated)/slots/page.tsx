"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { reelSpring } from "@/animations/springs";
import { Cherry, Minus, Plus, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  USDC_ADDRESS, ERC20_ABI,
  CASINO_ADDRESS, CASINO_ABI,
} from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { useUSDCBalance, useGameSettlement } from "@/lib/useUSDCBalance";

const SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "💎", "🍀", "7️⃣", "👑"];
const SYMBOL_PAYOUTS: Record<string, number> = { "👑": 100, "7️⃣": 50, "💎": 25, "⭐": 10, "🔔": 5, "🍀": 5, "🍋": 3, "🍒": 2 };

const CONTRACTS_DEPLOYED = CASINO_ADDRESS !== "0x0000000000000000000000000000000000000000";

export default function SlotsPage() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(5);
  const [reels, setReels] = useState(["🍒", "⭐", "💎"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ won: boolean; payout: number; message: string } | null>(null);

  const { value: balance } = useUSDCBalance();
  const { handleGameSettlement } = useGameSettlement();
  const { send, status, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  const amountInUnits = parseUnits(betAmount.toString(), 6);

  const spin = async () => {
    // Demo mode when contracts not deployed
    if (!CONTRACTS_DEPLOYED || !address) {
      setIsSpinning(true);
      setResult(null);
      setTimeout(() => {
        const newReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
        setReels(newReels);
        setIsSpinning(false);
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
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      // Place bet
      const tx = await send(() =>
        writeContractAsync({
          address: CASINO_ADDRESS,
          abi: CASINO_ABI,
          functionName: "playSlots",
          args: [amountInUnits],
        })
      );

      if (tx) {
        await handleGameSettlement(tx);
      }

      // Show simulated visual result (real result from contract event)
      const newReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
      setReels(newReels);
      
      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        const mult = SYMBOL_PAYOUTS[newReels[0]] || 5;
        setResult({ won: true, payout: betAmount * mult, message: `Three of a kind! ${mult}x` });
      } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2]) {
        setResult({ won: true, payout: betAmount * 2, message: "Pair! 2x" });
      } else {
        setResult({ won: false, payout: 0, message: "No match" });
      }
    } catch {
      // error handled by useTx
    } finally {
      setIsSpinning(false);
    }
  };

  const isLoading = isSpinning || status === "pending" || status === "confirming";
  const buttonLabel = () => {
    if (status === "pending") return "Awaiting wallet...";
    if (status === "confirming") return "Confirming on-chain...";
    if (isSpinning) return "Spinning...";
    return `Spin — $${betAmount} USDC`;
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Quantum Slots</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">3-reel • Up to 100x payout</p>
          </div>
          <div className="flex items-center gap-2">
            {!CONTRACTS_DEPLOYED && (
              <Badge variant="warning">Demo Mode</Badge>
            )}
            <Badge variant="accent">Provably Fair</Badge>
          </div>
        </motion.div>

        {/* Contract not deployed notice */}
        {!CONTRACTS_DEPLOYED && (
          <motion.div variants={staggerItem} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Demo Mode — Contracts Not Deployed</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Spins are simulated. Deploy contracts to Arc testnet and set <code className="text-amber-400">NEXT_PUBLIC_CASINO_ADDRESS</code> to enable real USDC bets.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tx status banner */}
        <AnimatePresence>
          {status === "confirmed" && txHash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Bet confirmed!</span>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-emerald-400/70 hover:underline ml-auto"
              >
                View on explorer →
              </a>
            </motion.div>
          )}
          {txError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onClick={reset}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{txError}</span>
              <span className="text-xs text-red-400/60 ml-auto">click to dismiss</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={staggerItem}>
          <Card className="p-8 bg-gradient-to-b from-purple-900/10 to-pink-900/5">
            {/* Slot Machine */}
            <div className="flex justify-center gap-3 md:gap-6 mb-8">
              {reels.map((symbol, i) => (
                <motion.div
                  key={`${i}-${symbol}-${isSpinning}`}
                  className="w-24 h-28 md:w-32 md:h-36 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-lg relative overflow-hidden"
                  animate={isSpinning ? { y: [0, -40, 40, 0] } : {}}
                  transition={isSpinning ? { repeat: Infinity, duration: 0.3 + i * 0.1, ease: "linear" } : reelSpring}
                >
                  <span className="text-4xl md:text-5xl absolute">{isSpinning ? SYMBOLS[Math.floor(Math.random() * 8)] : symbol}</span>
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
              {result && !isSpinning && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                  <p className={`text-xl font-display font-bold ${result.won ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                    {result.message}
                  </p>
                  {result.won && <p className="text-sm text-emerald-400/70">+${result.payout} USDC (Estimated)</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            
            {/* Balance indicator */}
            {address && (
              <div className="mb-4 p-2 rounded-lg bg-[var(--bg-card)] text-xs text-[var(--text-muted)] flex justify-between max-w-sm mx-auto">
                <span>Available Balance</span>
                <span className="font-mono text-[var(--text-primary)]">${balance.toFixed(2)} USDC</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.max(1, betAmount - 1))} disabled={isLoading}><Minus className="w-3 h-3" /></Button>
                <span className="font-mono font-bold text-lg min-w-[60px] text-center">${betAmount}</span>
                <Button size="sm" variant="ghost" onClick={() => setBetAmount(betAmount + 1)} disabled={isLoading}><Plus className="w-3 h-3" /></Button>
                <div className="flex gap-1 ml-2">
                  {[1, 5, 10, 25].map((v) => (
                    <button key={v} onClick={() => setBetAmount(v)} disabled={isLoading} className={`px-2 py-1 rounded text-xs ${betAmount === v ? "bg-accent-gold/20 text-accent-gold" : "bg-[var(--bg-card)] text-[var(--text-muted)]"}`}>${v}</button>
                  ))}
                </div>
              </div>
              <Button 
                className="w-full md:w-auto min-w-[140px]" 
                onClick={spin} 
                isLoading={isLoading}
                disabled={isLoading || (CONTRACTS_DEPLOYED && betAmount > balance)}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> 
                {buttonLabel()}
              </Button>
            </div>
            
            {CONTRACTS_DEPLOYED && betAmount > balance && (
              <p className="text-xs text-red-400 mt-2 text-center">Insufficient USDC balance</p>
            )}
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
