"use client";

import { useCallback, useState } from "react";
import { usePublicClient } from "wagmi";

export type TxStatus = "idle" | "pending" | "confirming" | "confirmed" | "error";

export interface UseTxResult {
  status: TxStatus;
  txHash: `0x${string}` | undefined;
  error: string | undefined;
  isLoading: boolean;
  /**
   * Send a transaction and wait for confirmation.
   * Does NOT handle game settlement, must call handleGameSettlement explicitly.
   */
  send: (txFn: () => Promise<`0x${string}`>) => Promise<`0x${string}` | undefined>;
  reset: () => void;
}

export function useTx(): UseTxResult {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();
  const publicClient = usePublicClient();

  const send = useCallback(
    async (txFn: () => Promise<`0x${string}`>) => {
      setError(undefined);
      setTxHash(undefined);
      setStatus("pending");

      try {
        const hash = await txFn();
        setTxHash(hash);
        setStatus("confirming");

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
            timeout: 30_000,
          });
        }

        setStatus("confirmed");
        return hash;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
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
    [publicClient]
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

