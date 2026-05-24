"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnimatedCounter } from "@/components/ui/Counter";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Shield, Pause, Play, Settings, Plus, AlertTriangle, Lock, Coins, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { TREASURY_ADDRESS, TREASURY_ABI, USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { parseUnits } from "viem";
import { useWalletBalance } from "@/lib/useUSDCBalance";

export default function AdminPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [newMarket, setNewMarket] = useState("");
  const [bankrollAmount, setBankrollAmount] = useState("");
  
  const { address } = useAccount();
  const walletBalance = useWalletBalance();
  const { writeContractAsync } = useWriteContract();
  const { send, status, isLoading, error } = useTx();
  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, TREASURY_ADDRESS] : undefined,
    query: { enabled: !!address }
  });
  const allowance = allowanceData ?? 0n;

  const handleAddBankroll = async () => {
    if (!bankrollAmount || isNaN(Number(bankrollAmount)) || Number(bankrollAmount) <= 0) return;
    const amountBigInt = parseUnits(bankrollAmount, 6);
    
    if (allowance < amountBigInt) {
      const approveHash = await send(async () => {
        return writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [TREASURY_ADDRESS, amountBigInt],
        });
      });
      if (!approveHash) return;
      await refetchAllowance();
    }
    
    await send(async () => {
      return writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "addBankroll",
        args: [amountBigInt],
      });
    });
    setBankrollAmount("");
  };

  const handleWithdrawBankroll = async () => {
    if (!bankrollAmount || isNaN(Number(bankrollAmount)) || Number(bankrollAmount) <= 0) return;
    const amountBigInt = parseUnits(bankrollAmount, 6);
    
    await send(async () => {
      return writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "withdrawBankroll",
        args: [amountBigInt],
      });
    });
    setBankrollAmount("");
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Panel</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Contract management & configuration</p>
          </div>
          <Badge variant={isPaused ? "danger" : "success"}>
            {isPaused ? <><Pause className="w-3 h-3 mr-1" />Paused</> : <><Play className="w-3 h-3 mr-1" />Active</>}
          </Badge>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">Total Players</p>
            <AnimatedCounter value={1247} decimals={0} className="text-xl font-bold font-display" />
          </Card>
          <Card className="p-4" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">24h Bets</p>
            <AnimatedCounter value={3842} decimals={0} className="text-xl font-bold font-display" />
          </Card>
          <Card className="p-4" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">Revenue</p>
            <AnimatedCounter value={3420} prefix="$" decimals={0} className="text-xl font-bold text-emerald-400" />
          </Card>
          <Card className="p-4" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">House Edge</p>
            <p className="text-xl font-bold text-accent-gold">2.7%</p>
          </Card>
        </motion.div>

        {/* Bankroll Management */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 border-accent-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-accent-gold" />
              <h2 className="font-display font-semibold">Treasury Bankroll Liquidity</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-muted)]">Your Admin Wallet USDC:</span>
                <span className="font-mono font-semibold">{walletBalance.formatted}</span>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input 
                    label="Amount (USDC)" 
                    type="number" 
                    placeholder="0.00" 
                    value={bankrollAmount} 
                    onChange={(e) => setBankrollAmount(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={handleAddBankroll} 
                  disabled={!bankrollAmount || isLoading} 
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <ArrowDownToLine className="w-4 h-4 mr-1" /> Inject Bankroll
                </Button>
                <Button 
                  onClick={handleWithdrawBankroll} 
                  disabled={!bankrollAmount || isLoading} 
                  variant="secondary"
                >
                  <ArrowUpFromLine className="w-4 h-4 mr-1" /> Withdraw
                </Button>
              </div>
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>
          </Card>
        </motion.div>

        {/* Emergency Controls */}
        <motion.div variants={staggerItem}>
          <Card className="p-6 border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-display font-semibold">Emergency Controls</h2>
            </div>
            <div className="flex gap-3">
              <Button variant={isPaused ? "primary" : "danger"} onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? <><Play className="w-4 h-4" /> Unpause All Games</> : <><Pause className="w-4 h-4" /> Pause All Games</>}
              </Button>
              <Button variant="danger">
                <Lock className="w-4 h-4" /> Emergency Withdraw
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Game Config */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-accent-gold" />
              <h2 className="font-display font-semibold">Game Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Min Bet (USDC)" type="number" defaultValue="1" />
              <Input label="Max Bet (USDC)" type="number" defaultValue="1000" />
              <Input label="House Edge (bps)" type="number" defaultValue="270" />
            </div>
            <Button className="mt-4" size="sm"><Settings className="w-3 h-3" /> Update Config</Button>
          </Card>
        </motion.div>

        {/* Create Prediction Market */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-accent-gold" />
              <h2 className="font-display font-semibold">Create Prediction Market</h2>
            </div>
            <div className="space-y-3">
              <Input label="Market Description" placeholder="e.g., ETH will reach $5,000 by Q2 2026" value={newMarket} onChange={(e) => setNewMarket(e.target.value)} />
              <Input label="Deadline" type="datetime-local" />
              <Button size="sm"><Plus className="w-3 h-3" /> Create Market</Button>
            </div>
          </Card>
        </motion.div>

        {/* Contract Info */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h2 className="font-display font-semibold mb-4">Deployed Contracts</h2>
            <div className="space-y-2 text-sm">
              {[
                { name: "Treasury", status: "Active" },
                { name: "Casino", status: isPaused ? "Paused" : "Active" },
                { name: "Prediction", status: "Active" },
                { name: "Rewards", status: "Active" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-accent-gold" /><span>{c.name}</span></div>
                  <Badge variant={c.status === "Active" ? "success" : "danger"}>{c.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
