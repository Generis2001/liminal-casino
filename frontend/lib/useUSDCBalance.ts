"use client";

import {
  useAccount,
  useReadContract,
  useBlockNumber,
  usePublicClient,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { formatUnits } from "viem";
import { USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { arcTestnet } from "@/lib/arcChain";

// Stable query key — used everywhere to invalidate the USDC balance cache
export function usdcBalanceQueryKey(address: `0x${string}` | undefined) {
  return [
    "readContract",
    {
      address: USDC_ADDRESS,
      functionName: "balanceOf",
      args: [address],
      chainId: arcTestnet.id,
    },
  ] as const;
}

export interface USDCBalance {
  /** Raw BigInt value from contract */
  raw: bigint;
  /** Formatted number (6 decimals) */
  value: number;
  /** Display string e.g. "1,234.56" */
  formatted: string;
  /** True while fetching after a tx */
  isPending: boolean;
  /** True on initial load */
  isLoading: boolean;
  /** Manually trigger a refetch */
  refetch: () => void;
}

/**
 * Production-grade USDC balance hook.
 *
 * Features:
 * - Reads `balanceOf()` directly from the ERC-20 contract (not native balance)
 * - Re-fetches on every new block (via `watch: true`) for ~1s sync
 * - Deduplicated — same query key, so all consumers share one subscription
 * - Exposes `refetch` for instant post-tx invalidation
 */
export function useUSDCBalance(): USDCBalance {
  const { address } = useAccount();

  const {
    data: rawBalance,
    isLoading,
    isFetching,
    refetch,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      // Consider data stale immediately so any invalidation triggers a refetch
      staleTime: 0,
    },
  });

  const raw = rawBalance ?? 0n;
  const value = Number(formatUnits(raw, 6));
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    raw,
    value,
    formatted,
    isPending: isFetching && !isLoading,
    isLoading,
    refetch,
  };
}

/**
 * Watches new blocks and refetches USDC balance within ~1 block of any change.
 * Mount this once at the app root (BalanceSyncProvider).
 */
export function useUSDCBlockSync() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: arcTestnet.id,
    query: { staleTime: 0 },
  });

  const prevBlockRef = useRef<bigint | undefined>(undefined);

  useEffect(() => {
    if (!address || blockNumber === undefined) return;
    // Only refetch on genuinely new blocks, not re-renders
    if (prevBlockRef.current === blockNumber) return;
    prevBlockRef.current = blockNumber;

    queryClient.invalidateQueries({
      queryKey: ["readContract", { address: USDC_ADDRESS, functionName: "balanceOf" }],
    });
  }, [blockNumber, address, queryClient]);
}

/**
 * Call this after any transaction that spends or receives USDC.
 * Immediately invalidates the cache → wagmi refetches from chain.
 */
export function useInvalidateUSDCBalance() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  return useCallback(
    async (txHash?: `0x${string}`) => {
      if (!address) return;

      // If we have a hash, wait for the receipt first (confirmed = onchain)
      if (txHash && publicClient) {
        try {
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 1,
            timeout: 30_000,
          });
        } catch {
          // Timeout or error — still try to refetch
        }
      }

      // Invalidate specifically the balanceOf query for USDC
      queryClient.invalidateQueries({
        queryKey: ["readContract", { address: USDC_ADDRESS, functionName: "balanceOf" }],
      });
    },
    [address, queryClient, publicClient]
  );
}
