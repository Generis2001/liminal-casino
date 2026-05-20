"use client";

import { useCallback, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useInvalidateUSDCBalance } from "@/lib/useUSDCBalance";

export type TxStatus = "idle" | "pending" | "confirming" | "confirmed" | "error";

export interface UseTxResult {
  status: TxStatus;
  txHash: `0x${string}` | undefined;
  error: string | undefined;
  isLoading: boolean;
  /**
   * Send a transaction, wait for confirmation, then invalidate USDC balance.
   * Pass an async function that sends the tx and returns the hash.
   */
  send: (txFn: () => Promise<`0x${string}`>) => Promise<`0x${string}` | undefined>;
  reset: () => void;
}

/**
 * Production-grade transaction wrapper.
 *
 * Usage:
 *   const { send, status, isLoading } = useTx();
 *   const hash = await send(() => writeContractAsync({ ... }));
 *
 * After confirmation the USDC balance is automatically invalidated
 * so the UI updates within ~1 second.
 */
export function useTx(): UseTxResult {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();
  const invalidateBalance = useInvalidateUSDCBalance();

  const send = useCallback(
    async (txFn: () => Promise<`0x${string}`>) => {
      setError(undefined);
      setTxHash(undefined);
      setStatus("pending");

      try {
        // 1. Submit tx to wallet
        const hash = await txFn();
        setTxHash(hash);
        setStatus("confirming");

        // 2. Wait for on-chain confirmation then invalidate balance
        // invalidateBalance() awaits waitForTransactionReceipt internally
        await invalidateBalance(hash);

        setStatus("confirmed");
        return hash;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        // User rejected
        if (
          message.includes("rejected") ||
          message.includes("denied") ||
          message.includes("cancel")
        ) {
          setError("Transaction cancelled");
        } else {
          setError(message.slice(0, 120));
        }
        setStatus("error");
        return undefined;
      }
    },
    [invalidateBalance]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(undefined);
    setError(undefined);
  }, []);

  return {
    status,
    txHash,
    error,
    isLoading: status === "pending" || status === "confirming",
    send,
    reset,
  };
}
