"use client";

import {
  useAccount,
  useBlockNumber,
  usePublicClient,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { formatUnits } from "viem";
import { USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { arcTestnet } from "@/lib/arcChain";

// Stable query key — used everywhere to invalidate the USDC balance cache
export const usdcBalanceQueryKey = (address: string) => [
  "usdcBalance",
  address
];

export interface USDCBalance {
  raw: bigint;
  value: number;
  formatted: string;
  isPending: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function useUSDCBalance(): USDCBalance {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const {
    data: rawBalance,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: address ? usdcBalanceQueryKey(address) : ["usdcBalance", "undefined"],
    queryFn: async () => {
      if (!address || !publicClient) return 0n;
      return publicClient.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
    },
    enabled: !!address && !!publicClient,
    staleTime: 0,
    refetchInterval: 800,
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
    if (prevBlockRef.current === blockNumber) return;
    prevBlockRef.current = blockNumber;

    queryClient.invalidateQueries({
      queryKey: usdcBalanceQueryKey(address),
    });
  }, [blockNumber, address, queryClient]);
}

/**
 * Unified post-game settlement handler
 */
export function useGameSettlement() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  const handleGameSettlement = useCallback(
    async (txHash?: `0x${string}`) => {
      if (!address) return;

      if (txHash && publicClient) {
        try {
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 1,
            timeout: 30_000,
          });
        } catch {
          // Ignore timeout
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usdcBalanceQueryKey(address) }),
        queryClient.invalidateQueries({ queryKey: ["playerBalance"] }),
        queryClient.invalidateQueries({ queryKey: ["gameState"] })
      ]);
    },
    [address, queryClient, publicClient]
  );

  return { handleGameSettlement };
}

