"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUSDCBalance, useWalletBalance, useGameSettlement } from "@/lib/useUSDCBalance";
import { useTx } from "@/lib/useTx";
import { USDC_ADDRESS, TREASURY_ADDRESS, ERC20_ABI, TREASURY_ABI } from "@/lib/contracts";
import { parseUnits } from "viem";
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Landmark } from "lucide-react";
import { UsdcLogo } from "@/components/ui/UsdcLogo";

export function WalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  
  const { address } = useAccount();
  const playerBalance = useUSDCBalance();
  const walletBalance = useWalletBalance();
  const { handleGameSettlement } = useGameSettlement();
  
  const { send, status, isLoading, error } = useTx();
  const { writeContractAsync } = useWriteContract();
  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, TREASURY_ADDRESS] : undefined,
    query: { enabled: !!address }
  });
  const allowance = allowanceData ?? 0n;
  
  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const amountBigInt = parseUnits(amount, 6);
    
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
    
    const txHash = await send(async () => {
      return writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "deposit",
        args: [amountBigInt],
      });
    });
    
    if (txHash) {
      setAmount("");
      await handleGameSettlement(txHash);
    }
  };
  
  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const amountBigInt = parseUnits(amount, 6);
    
    const txHash = await send(async () => {
      return writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "withdraw",
        args: [amountBigInt],
      });
    });
    
    if (txHash) {
      setAmount("");
      await handleGameSettlement(txHash);
    }
  };

  const handleMax = () => {
    if (tab === "deposit") {
      setAmount(walletBalance.value.toString());
    } else {
      setAmount(playerBalance.value.toString());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Treasury Wallet" size="md">
      <div className="flex gap-2 p-1 bg-[var(--bg-card)] rounded-xl mb-6">
        <button
          onClick={() => { setTab("deposit"); setAmount(""); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "deposit" ? "bg-accent-gold text-black shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          Deposit
        </button>
        <button
          onClick={() => { setTab("withdraw"); setAmount(""); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "withdraw" ? "bg-[var(--bg-card-hover)] text-white shadow-md border border-[var(--border-color)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          Withdraw
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 flex flex-col items-center justify-center gap-1">
          <UsdcLogo size={20} className="mb-1" />
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Wallet USDC</span>
          <span className="font-mono font-bold">{walletBalance.formatted}</span>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 flex flex-col items-center justify-center gap-1">
          <UsdcLogo size={20} className="mb-1" />
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Casino Bankroll</span>
          <span className="font-mono font-bold text-accent-gold">{playerBalance.formatted}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
            Amount (USDC)
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16 text-lg font-mono"
            />
            <button 
              onClick={handleMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded border border-[var(--border-color)] text-accent-gold font-semibold transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={tab === "deposit" ? handleDeposit : handleWithdraw}
          disabled={!amount || Number(amount) <= 0 || isLoading}
          variant={tab === "deposit" ? "primary" : "secondary"}
          className="w-full h-12 text-lg"
        >
          {isLoading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {tab === "deposit" ? (
                <>
                  <ArrowDownToLine className="w-5 h-5" />
                  Deposit to Casino
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-5 h-5" />
                  Withdraw to Wallet
                </>
              )}
            </span>
          )}
        </Button>
      </div>
    </Modal>
  );
}
