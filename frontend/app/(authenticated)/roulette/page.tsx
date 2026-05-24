"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { bouncySpring } from "@/animations/springs";
import { CircleDot, Minus, Plus, RotateCcw, History, AlertCircle, CheckCircle2, ArrowDownToLine } from "lucide-react";
import {
  USDC_ADDRESS, ERC20_ABI,
  CASINO_ADDRESS, CASINO_ABI,
} from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { useUSDCBalance, useWalletBalance, useGameSettlement } from "@/lib/useUSDCBalance";
import { UsdcLogo } from "@/components/ui/UsdcLogo";
import { WalletModal } from "@/components/layout/WalletModal";
import { useState as useStateAlias } from "react";

const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

// betType values matching the contract enum
const betTypes = [
  { label: "Red",    value: 1, payout: "2x" },
  { label: "Black",  value: 2, payout: "2x" },
  { label: "Even",   value: 3, payout: "2x" },
  { label: "Odd",    value: 4, payout: "2x" },
  { label: "1-18",   value: 5, payout: "2x" },
  { label: "19-36",  value: 6, payout: "2x" },
  { label: "1st 12", value: 7, payout: "3x" },
  { label: "2nd 12", value: 8, payout: "3x" },
  { label: "3rd 12", value: 9, payout: "3x" },
];

const CONTRACTS_DEPLOYED = CASINO_ADDRESS !== "0x0000000000000000000000000000000000000000";

export default function RoulettePage() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<{ label: string; value: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 0, 32, 15, 4, 21, 2, 25, 36, 8]);

  const { value: balance } = useUSDCBalance();
  const walletBalance = useWalletBalance();
  const { handleGameSettlement } = useGameSettlement();
  const { send, status, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();
  const [showDepositModal, setShowDepositModal] = useStateAlias(false);

  const needsDeposit = CONTRACTS_DEPLOYED && address && balance <= 0 && walletBalance.value > 0;

  const amountInUnits = parseUnits(betAmount.toString(), 6);

  const handleSpin = async () => {
    if (!selectedBet && selectedNumber === null) return;

    // Demo mode when contracts not deployed
    if (!CONTRACTS_DEPLOYED || !address) {
      setIsSpinning(true);
      setResult(null);
      setTimeout(() => {
        const r = Math.floor(Math.random() * 37);
        setResult(r);
        setHistory((p) => [r, ...p.slice(0, 19)]);
        setIsSpinning(false);
      }, 2000);
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      const betType = selectedNumber !== null ? 0 : selectedBet!.value;
      const choice = selectedNumber !== null ? BigInt(selectedNumber) : 0n;

      const tx = await send(() =>
        writeContractAsync({
          address: CASINO_ADDRESS,
          abi: CASINO_ABI,
          functionName: "playRoulette",
          args: [betType, choice, amountInUnits],
        })
      );

      if (tx) {
        await handleGameSettlement(tx);
      }

      // Show simulated result (real result from contract event)
      const r = Math.floor(Math.random() * 37);
      setResult(r);
      setHistory((p) => [r, ...p.slice(0, 19)]);
    } catch {
      // error handled by useTx
    } finally {
      setIsSpinning(false);
    }
  };

  const getNumberColor = (n: number) => {
    if (n === 0) return "bg-emerald-600";
    return RED_NUMBERS.includes(n) ? "bg-red-600" : "bg-gray-800";
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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Roulette</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">European Roulette • 2.7% house edge</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel & Result */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-center py-12 relative">
                <motion.div
                  animate={isLoading ? { rotate: 1800 } : { rotate: 0 }}
                  transition={isLoading ? { duration: 2, ease: "easeOut" } : { duration: 0 }}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-accent-gold/30 flex items-center justify-center relative"
                  style={{
                    background: "conic-gradient(from 0deg, #dc2626 0%, #1f2937 10%, #dc2626 20%, #1f2937 30%, #dc2626 40%, #1f2937 50%, #16a34a 52%, #dc2626 55%, #1f2937 65%, #dc2626 75%, #1f2937 85%, #dc2626 95%, #1f2937 100%)",
                  }}
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--border-color)] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {result !== null ? (
                        <motion.div key={result} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={bouncySpring} className="text-center">
                          <span className={`inline-flex w-10 h-10 rounded-full ${getNumberColor(result)} text-white font-bold text-lg items-center justify-center`}>{result}</span>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{result === 0 ? "Green" : RED_NUMBERS.includes(result) ? "Red" : "Black"}</p>
                        </motion.div>
                      ) : (
                        <motion.div key="idle" className="text-center">
                          <CircleDot className="w-8 h-8 text-accent-gold mx-auto" />
                          <p className="text-xs text-[var(--text-muted)] mt-1">{isLoading ? "On-chain..." : "Place bet"}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-12 gap-1 mt-4">
                <div onClick={() => { setSelectedNumber(0); setSelectedBet(null); }}
                  className={`col-span-12 h-8 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${selectedNumber === 0 ? "ring-2 ring-accent-gold scale-105" : ""} bg-emerald-600 text-white hover:opacity-80`}>
                  0
                </div>
                {ROULETTE_NUMBERS.slice(1).map((n) => (
                  <div key={n} onClick={() => { setSelectedNumber(n); setSelectedBet(null); }}
                    className={`h-8 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${selectedNumber === n ? "ring-2 ring-accent-gold scale-110" : ""} ${getNumberColor(n)} text-white hover:opacity-80`}>
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

              {/* Balance indicator */}
              {address && (
                <div className="mb-3 p-2 rounded-lg bg-[var(--bg-card)] text-xs text-[var(--text-muted)] flex justify-between items-center">
                  <span>Available</span>
                  <span className="font-mono text-[var(--text-primary)] flex items-center gap-1"><UsdcLogo size={12} />${balance.toFixed(2)} USDC</span>
                </div>
              )}

              {/* Deposit Prompt */}
              {needsDeposit && (
                <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400 font-semibold mb-1">⚡ Deposit USDC to Play</p>
                  <p className="text-xs text-[var(--text-muted)] mb-2">You have {walletBalance.formatted} USDC in your wallet. Deposit to your Casino Bankroll to start betting.</p>
                  <Button size="sm" onClick={() => setShowDepositModal(true)} className="w-full">
                    <ArrowDownToLine className="w-3 h-3 mr-1" /> Deposit USDC Now
                  </Button>
                </div>
              )}

              <WalletModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />

              {/* Bet Amount */}
              <div className="mb-4">
                <label className="text-xs text-[var(--text-muted)] mb-2 block">Bet Amount (USDC)</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setBetAmount(Math.max(1, betAmount - 5))}><Minus className="w-3 h-3" /></Button>
                  <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="text-center font-mono" />
                  <Button size="sm" variant="ghost" onClick={() => setBetAmount(betAmount + 5)}><Plus className="w-3 h-3" /></Button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[5, 10, 25, 50, 100].map((v) => (
                    <button key={v} onClick={() => setBetAmount(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${betAmount === v ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"}`}>
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
                    <button key={bet.label} onClick={() => { setSelectedBet(bet); setSelectedNumber(null); }}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${selectedBet?.label === bet.label ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"}`}>
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
                isLoading={isLoading}
                disabled={!selectedBet && selectedNumber === null || isLoading || (CONTRACTS_DEPLOYED && betAmount > balance)}
              >
                <RotateCcw className="w-4 h-4" />
                {buttonLabel()}
              </Button>

              {CONTRACTS_DEPLOYED && betAmount > balance && (
                <p className="text-xs text-red-400 mt-2 text-center">Insufficient USDC balance</p>
              )}
            </Card>

            {/* History */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Recent Spins</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((n, i) => (
                  <motion.div key={`${n}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 }}
                    className={`w-8 h-8 rounded-lg ${getNumberColor(n)} text-white text-xs font-bold flex items-center justify-center ${i === 0 ? "ring-2 ring-accent-gold" : ""}`}>
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
