"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Clock, Users, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  USDC_ADDRESS, ERC20_ABI,
  PREDICTION_ADDRESS, PREDICTION_ABI,
} from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { useUSDCBalance } from "@/lib/useUSDCBalance";

const DEMO_MARKETS = [
  { id: 0n, description: "ETH will reach $5,000 by end of Q2 2026", deadline: 1782777600n, settleTime: 0n, status: 0, yesPool: 15000000000n, noPool: 8500000000n, outcome: 0, totalParticipants: 45n },
  { id: 1n, description: "Arc Mainnet launches before August 2026", deadline: 1785542400n, settleTime: 0n, status: 0, yesPool: 32000000000n, noPool: 12000000000n, outcome: 0, totalParticipants: 128n },
  { id: 2n, description: "Bitcoin dominance drops below 40%", deadline: 1784073600n, settleTime: 0n, status: 0, yesPool: 5000000000n, noPool: 18000000000n, outcome: 0, totalParticipants: 67n },
  { id: 3n, description: "USDC supply exceeds $100B", deadline: 1798675200n, settleTime: 0n, status: 0, yesPool: 22000000000n, noPool: 3000000000n, outcome: 0, totalParticipants: 89n },
];

const CONTRACTS_DEPLOYED = PREDICTION_ADDRESS !== "0x0000000000000000000000000000000000000000";

const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return "Open";
    case 1: return "Settled";
    case 2: return "Canceled";
    default: return "Unknown";
  }
};

export default function PredictionsPage() {
  const { address } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [position, setPosition] = useState<"yes" | "no" | null>(null);
  const [stake, setStake] = useState(10);
  const [isPlacing, setIsPlacing] = useState(false);

  const { value: balance } = useUSDCBalance();
  const { send, status: txStatus, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  // Read current USDC allowance for prediction contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, PREDICTION_ADDRESS] : undefined,
    query: { enabled: !!address && CONTRACTS_DEPLOYED },
  });

  // Read market counter
  const { data: counterData } = useReadContract({
    address: PREDICTION_ADDRESS,
    abi: PREDICTION_ABI,
    functionName: "marketCounter",
    query: { enabled: CONTRACTS_DEPLOYED },
  });

  const marketCount = counterData ? Number(counterData) : 0;
  
  const marketCalls = useMemo(() => {
    return Array.from({ length: marketCount }).map((_, i) => ({
      address: PREDICTION_ADDRESS,
      abi: PREDICTION_ABI,
      functionName: "getMarket",
      args: [BigInt(i)]
    })) as const;
  }, [marketCount]);

  const { data: marketsData, refetch: refetchMarkets } = useReadContracts({
    contracts: marketCalls,
    query: { enabled: marketCount > 0 }
  });

  // Parse on-chain markets or fallback to demo
  const markets = useMemo(() => {
    if (!CONTRACTS_DEPLOYED || !marketsData) return DEMO_MARKETS;
    return marketsData
      .map((m, i) => m.status === "success" && m.result ? m.result : null)
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [marketsData]);

  const amountInUnits = parseUnits(stake.toString(), 6);
  const needsApproval = CONTRACTS_DEPLOYED && (allowance ?? 0n) < amountInUnits;

  const handlePlaceBet = async (marketId: bigint) => {
    if (!position || isPlacing) return;

    if (!CONTRACTS_DEPLOYED || !address) {
      setIsPlacing(true);
      setTimeout(() => {
        setIsPlacing(false);
        alert(`Demo mode: Placed $${stake} on ${position.toUpperCase()}`);
        setSelectedMarket(null);
        setPosition(null);
      }, 1000);
      return;
    }

    setIsPlacing(true);
    try {
      if (needsApproval) {
        await send(() =>
          writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [PREDICTION_ADDRESS, amountInUnits * 100n],
          })
        );
        await refetchAllowance();
      }

      // position mapping: 0 = Yes, 1 = No
      const positionCode = position === "yes" ? 0 : 1;
      
      await send(() =>
        writeContractAsync({
          address: PREDICTION_ADDRESS,
          abi: PREDICTION_ABI,
          functionName: "takePosition",
          args: [marketId, positionCode, amountInUnits],
        })
      );
      
      await refetchMarkets();
      setSelectedMarket(null);
      setPosition(null);
    } catch {
      // error handled by useTx
    } finally {
      setIsPlacing(false);
    }
  };

  const isLoading = isPlacing || txStatus === "pending" || txStatus === "confirming";

  // Calculate global stats
  const totalVolume = markets.reduce((acc, m) => acc + Number(formatUnits(m.yesPool + m.noPool, 6)), 0);
  const totalParticipants = markets.reduce((acc, m) => acc + Number(m.totalParticipants), 0);

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Prediction Markets</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Take positions on real outcomes. Settled onchain.</p>
          </div>
          <div className="flex items-center gap-2">
            {!CONTRACTS_DEPLOYED && (
              <Badge variant="warning">Demo Mode</Badge>
            )}
          </div>
        </motion.div>

        {!CONTRACTS_DEPLOYED && (
          <motion.div variants={staggerItem} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Demo Mode — Contracts Not Deployed</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Markets shown are simulated. Deploy contracts and set <code className="text-amber-400">NEXT_PUBLIC_PREDICTION_ADDRESS</code>.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {txStatus === "confirmed" && txHash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Position placed successfully!</span>
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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Active Markets</p><p className="text-2xl font-bold text-accent-gold">{markets.length}</p></Card>
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Total Volume</p><p className="text-2xl font-bold text-emerald-400 font-mono">${totalVolume >= 1000 ? (totalVolume/1000).toFixed(1) + 'K' : totalVolume.toFixed(2)}</p></Card>
          <Card className="p-4 text-center" hover={false}><p className="text-xs text-[var(--text-muted)]">Participants</p><p className="text-2xl font-bold text-[var(--text-primary)]">{totalParticipants}</p></Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-4">
          {markets.length === 0 && CONTRACTS_DEPLOYED && (
            <Card className="p-8 text-center text-[var(--text-muted)]">
              No active markets available at the moment.
            </Card>
          )}
          {markets.map((m) => {
            const yesAmount = Number(formatUnits(m.yesPool, 6));
            const noAmount = Number(formatUnits(m.noPool, 6));
            const total = yesAmount + noAmount;
            const yesPct = total > 0 ? (yesAmount / total) * 100 : 50;
            const noPct = 100 - yesPct;
            
            // Format timestamp to date string
            const deadlineDate = new Date(Number(m.deadline) * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            return (
              <Card key={m.id.toString()} glow className={`p-5 ${selectedMarket === Number(m.id) ? "border-accent-gold/50" : ""}`} onClick={() => setSelectedMarket(selectedMarket === Number(m.id) ? null : Number(m.id))}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <h3 className="font-semibold text-base md:text-lg text-[var(--text-primary)]">{m.description}</h3>
                  <Badge variant={m.status === 0 ? "success" : "secondary"}>{getStatusLabel(m.status)}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent-gold" />{deadlineDate}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" />{m.totalParticipants.toString()} traders</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" />${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} pool</span>
                </div>
                
                {/* Odds Bar */}
                <div className="relative h-10 rounded-xl overflow-hidden bg-[var(--bg-card)] mb-2 border border-[var(--border-color)]">
                  <motion.div className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 flex items-center pl-4 border-r border-emerald-500/30" style={{ width: `${yesPct}%` }} layout>
                    <span className="text-xs font-bold text-emerald-400">YES {yesPct.toFixed(0)}%</span>
                  </motion.div>
                  <motion.div className="absolute right-0 top-0 bottom-0 bg-red-500/20 flex items-center justify-end pr-4 border-l border-red-500/30" style={{ width: `${noPct}%` }} layout>
                    <span className="text-xs font-bold text-red-400">NO {noPct.toFixed(0)}%</span>
                  </motion.div>
                </div>

                {selectedMarket === Number(m.id) && m.status === 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-4 mt-2 border-t border-[var(--border-color)] space-y-4">
                    <div className="flex gap-3">
                      <Button size="sm" variant={position === "yes" ? "primary" : "secondary"} className={`flex-1 ${position === "yes" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" : ""}`} onClick={(e) => { e.stopPropagation(); setPosition("yes"); }}>
                        Bet YES
                      </Button>
                      <Button size="sm" variant={position === "no" ? "primary" : "secondary"} className={`flex-1 ${position === "no" ? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30" : ""}`} onClick={(e) => { e.stopPropagation(); setPosition("no"); }}>
                        Bet NO
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input 
                          type="number" 
                          value={stake} 
                          onChange={(e) => setStake(Number(e.target.value))} 
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] pl-9 pr-4 py-2.5 text-sm font-mono focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 outline-none transition-all" 
                        />
                      </div>
                      <Button 
                        size="default" 
                        disabled={!position || isLoading || (CONTRACTS_DEPLOYED && stake > balance)} 
                        isLoading={isLoading}
                        onClick={(e) => { e.stopPropagation(); handlePlaceBet(m.id); }}
                        className="min-w-[140px]"
                      >
                        {isLoading ? "Confirming..." : `Place ${position ? position.toUpperCase() : 'Bet'}`}
                      </Button>
                    </div>
                    
                    {CONTRACTS_DEPLOYED && stake > balance && (
                      <p className="text-xs text-red-400 text-right mt-1">Insufficient USDC balance (${balance.toFixed(2)} available)</p>
                    )}
                    {needsApproval && CONTRACTS_DEPLOYED && (
                      <p className="text-xs text-amber-400 text-right mt-1 flex items-center justify-end gap-1">
                        <AlertCircle className="w-3 h-3" /> Requires USDC approval
                      </p>
                    )}
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
