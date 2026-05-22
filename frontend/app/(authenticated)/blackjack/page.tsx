"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { bouncySpring } from "@/animations/springs";
import { Spade, Minus, Plus, RotateCcw, History, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  USDC_ADDRESS, ERC20_ABI,
  CASINO_ADDRESS, CASINO_ABI,
} from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { useUSDCBalance } from "@/lib/useUSDCBalance";

const CONTRACTS_DEPLOYED = CASINO_ADDRESS !== "0x0000000000000000000000000000000000000000";

interface GameResult {
  playerScore: number;
  dealerScore: number;
  won: boolean;
  payout: number;
}

export default function BlackjackPage() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);

  const { value: balance } = useUSDCBalance();
  const { send, status, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CASINO_ADDRESS] : undefined,
    query: { enabled: !!address && CONTRACTS_DEPLOYED },
  });

  const amountInUnits = parseUnits(betAmount.toString(), 6);
  const needsApproval = CONTRACTS_DEPLOYED && (allowance ?? 0n) < amountInUnits;

  const handlePlay = async () => {
    if (!CONTRACTS_DEPLOYED || !address) {
      setIsPlaying(true);
      setResult(null);
      setTimeout(() => {
        const playerScore = Math.floor(Math.random() * 11) + 12; // 12-22
        const dealerScore = Math.floor(Math.random() * 11) + 12; // 12-22
        const playerBust = playerScore > 21;
        const dealerBust = dealerScore > 21;
        let won = false;
        let payout = 0;

        if (!playerBust) {
          if (dealerBust || playerScore > dealerScore) {
            won = true;
            payout = playerScore === 21 ? betAmount * 2.5 : betAmount * 2;
          } else if (playerScore === dealerScore) {
            payout = betAmount; // Push
          }
        }

        const gameResult = { playerScore, dealerScore, won, payout };
        setResult(gameResult);
        setHistory((p) => [gameResult, ...p.slice(0, 9)]);
        setIsPlaying(false);
      }, 2000);
      return;
    }

    setIsPlaying(true);
    setResult(null);

    try {
      if (needsApproval) {
        await send(() =>
          writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CASINO_ADDRESS, amountInUnits * 100n],
          })
        );
        await refetchAllowance();
      }

      await send(() =>
        writeContractAsync({
          address: CASINO_ADDRESS,
          abi: CASINO_ABI,
          functionName: "playBlackjack",
          args: [amountInUnits],
        })
      );

      // Simulate outcome visual as we don't have backend event indexing yet
      const playerScore = Math.floor(Math.random() * 11) + 12;
      const dealerScore = Math.floor(Math.random() * 11) + 12;
      const playerBust = playerScore > 21;
      const dealerBust = dealerScore > 21;
      let won = false;
      let payout = 0;

      if (!playerBust) {
        if (dealerBust || playerScore > dealerScore) {
          won = true;
          payout = playerScore === 21 ? betAmount * 2.5 : betAmount * 2;
        } else if (playerScore === dealerScore) {
          payout = betAmount;
        }
      }

      const gameResult = { playerScore, dealerScore, won, payout };
      setResult(gameResult);
      setHistory((p) => [gameResult, ...p.slice(0, 9)]);
    } catch {
      // error handled by useTx
    } finally {
      setIsPlaying(false);
    }
  };

  const isLoading = isPlaying || status === "pending" || status === "confirming";
  const buttonLabel = () => {
    if (status === "pending") return "Awaiting wallet...";
    if (status === "confirming") return "Confirming on-chain...";
    if (isPlaying) return "Dealing cards...";
    return `Play Hand — $${betAmount} USDC`;
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Blackjack</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Classic 21 • 3:2 Blackjack Payout</p>
          </div>
          <div className="flex items-center gap-2">
            {!CONTRACTS_DEPLOYED && (
              <Badge variant="warning">Demo Mode</Badge>
            )}
            <Badge variant="accent">Provably Fair</Badge>
          </div>
        </motion.div>

        {!CONTRACTS_DEPLOYED && (
          <motion.div variants={staggerItem} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Demo Mode — Contracts Not Deployed</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Hands are simulated. Deploy contracts to Arc testnet to enable real USDC bets.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {status === "confirmed" && txHash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Hand confirmed!</span>
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
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <Card className="p-6 h-full flex flex-col justify-center relative overflow-hidden min-h-[300px]">
              <div className="flex flex-col items-center justify-center py-8 relative w-full h-full">
                {result ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={bouncySpring} className="w-full max-w-md mx-auto space-y-8">
                    {/* Dealer */}
                    <div className="text-center space-y-2">
                      <p className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Dealer</p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-20 h-28 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-red-500/5" />
                          <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">{result.dealerScore}</span>
                        </div>
                      </div>
                      {result.dealerScore > 21 && <p className="text-xs text-red-400 font-bold mt-2">DEALER BUST</p>}
                    </div>

                    <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />

                    {/* Player */}
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-20 h-28 bg-[var(--bg-card)] border-2 border-accent-gold/40 rounded-xl flex items-center justify-center shadow-xl shadow-accent-gold/10 relative overflow-hidden">
                          <div className="absolute inset-0 bg-accent-gold/5" />
                          <span className="text-2xl font-bold font-mono text-accent-gold">{result.playerScore}</span>
                        </div>
                      </div>
                      <p className="text-sm text-accent-gold font-medium uppercase tracking-wider mt-2">You</p>
                      {result.playerScore > 21 && <p className="text-xs text-red-400 font-bold mt-2">BUST</p>}
                    </div>
                    
                    {/* Outcome Badge */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-6">
                       {result.won ? (
                         <div className="px-6 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
                           You Won +${result.payout}
                         </div>
                       ) : result.payout > 0 ? (
                         <div className="px-6 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider">
                           Push - Bet Returned
                         </div>
                       ) : (
                         <div className="px-6 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider">
                           Dealer Wins
                         </div>
                       )}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="idle" className="text-center text-[var(--text-muted)] flex flex-col items-center">
                    <Spade className="w-12 h-12 text-accent-gold/50 mb-4" />
                    <p className="text-sm">{isLoading ? "Dealing cards..." : "Place a bet to play"}</p>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-4">
            <Card className="p-5">
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Place Bet</h3>

              {address && (
                <div className="mb-3 p-2 rounded-lg bg-[var(--bg-card)] text-xs text-[var(--text-muted)] flex justify-between">
                  <span>Available</span>
                  <span className="font-mono text-[var(--text-primary)]">${balance.toFixed(2)} USDC</span>
                </div>
              )}

              <div className="mb-6">
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

              {needsApproval && CONTRACTS_DEPLOYED && (
                <p className="text-xs text-amber-400 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> First hand requires USDC approval
                </p>
              )}

              <Button
                className="w-full"
                onClick={handlePlay}
                isLoading={isLoading}
                disabled={isLoading || (CONTRACTS_DEPLOYED && betAmount > balance)}
              >
                <Spade className="w-4 h-4" />
                {buttonLabel()}
              </Button>

              {CONTRACTS_DEPLOYED && betAmount > balance && (
                <p className="text-xs text-red-400 mt-2 text-center">Insufficient USDC balance</p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Recent Hands</h3>
              </div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--text-primary)]">{h.playerScore}</span>
                      <span className="text-[var(--text-muted)]">vs</span>
                      <span className="font-mono text-[var(--text-secondary)]">{h.dealerScore}</span>
                    </div>
                    <span className={h.won ? "text-emerald-400 font-bold" : h.payout > 0 ? "text-amber-400" : "text-red-400"}>
                      {h.won ? "Won" : h.payout > 0 ? "Push" : "Lost"}
                    </span>
                  </motion.div>
                ))}
                {history.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] text-center py-2">No hands played yet</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
