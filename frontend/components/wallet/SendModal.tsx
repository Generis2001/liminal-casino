"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { useTx } from "@/lib/useTx";
import { USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { useUSDCBalance } from "@/lib/useUSDCBalance";
import { Send, AlertCircle, ArrowRight } from "lucide-react";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const { address } = useAccount();
  const { value: balance } = useUSDCBalance();
  const { send, status, error: txError, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleMax = () => {
    setAmount(balance.toString());
  };

  const handleSend = async () => {
    if (!isAddress(recipient)) return;
    const amountInUnits = parseUnits(amount, 6);
    if (amountInUnits <= 0n) return;

    try {
      await send(() =>
        writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [recipient, amountInUnits],
        })
      );
      // Wait a moment then close
      setTimeout(() => {
        onClose();
        setRecipient("");
        setAmount("");
        reset();
      }, 2000);
    } catch {
      // Error is handled by useTx
    }
  };

  const isValidAddress = recipient === "" || isAddress(recipient);
  const isAmountValid = amount === "" || (Number(amount) > 0 && Number(amount) <= balance);
  const canSubmit = isAddress(recipient) && Number(amount) > 0 && Number(amount) <= balance && status !== "pending" && status !== "confirming";
  const isLoading = status === "pending" || status === "confirming";

  return (
    <Modal isOpen={isOpen} onClose={() => {
      onClose();
      reset();
      setRecipient("");
      setAmount("");
    }} title="Send USDC">
      <div className="flex flex-col gap-5 py-2">
        {/* Recipient Input */}
        <div>
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2 block">
            Recipient Address
          </label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={`font-mono text-sm ${!isValidAddress ? 'border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {!isValidAddress && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Invalid Ethereum address
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
              Amount (USDC)
            </label>
            <span className="text-xs text-[var(--text-muted)]">
              Balance: <span className="font-mono text-[var(--text-primary)]">{balance.toFixed(2)}</span>
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`font-mono text-lg pr-16 ${!isAmountValid && amount !== "" ? 'border-red-500 focus:ring-red-500/20' : ''}`}
            />
            <button
              onClick={handleMax}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-accent-gold hover:text-white transition-colors"
            >
              MAX
            </button>
          </div>
          {!isAmountValid && amount !== "" && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Insufficient balance or invalid amount
            </p>
          )}
        </div>

        {/* Error / Success Display */}
        {txError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {txError}
          </div>
        )}
        {status === "confirmed" && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center gap-2 font-semibold">
            Transaction Successful!
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={!canSubmit}
          isLoading={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? "Sending..." : (
            <>
              Send USDC <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
