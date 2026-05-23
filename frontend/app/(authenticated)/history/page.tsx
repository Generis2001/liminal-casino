"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Clock, ExternalLink, Filter, Loader2, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import {
  CASINO_ADDRESS,
  TREASURY_ADDRESS,
  REWARDS_ADDRESS,
  PREDICTION_ADDRESS,
} from "@/lib/contracts";
import { getTimeAgo } from "@/lib/utils";

const txTypes = ["All", "Bets", "Wins", "Deposits", "Withdrawals", "Rewards"];

interface OnchainTransaction {
  hash: string;
  type: "Bet" | "Win" | "Deposit" | "Withdrawal" | "Reward";
  game: string;
  amount: number;
  result: string;
  timestamp: number;
  status: "Confirmed" | "Pending";
}

export default function HistoryPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const [transactions, setTransactions] = useState<OnchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!address || !publicClient) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    async function fetchOnchainHistory() {
      setIsLoading(true);
      try {
        const blockCache: Record<number, number> = {};
        const getBlockTimestamp = async (blockNumber: bigint) => {
          const num = Number(blockNumber);
          if (blockCache[num] !== undefined) return blockCache[num];
          try {
            const block = await publicClient.getBlock({ blockNumber });
            const ts = Number(block.timestamp);
            blockCache[num] = ts;
            return ts;
          } catch {
            return Math.floor(Date.now() / 1000);
          }
        };

        // Fetch logs in parallel
        const [
          depositedLogs,
          withdrawnLogs,
          rewardLogs,
          predictionPositionLogs,
          predictionWinningsLogs,
          betPlacedLogs,
          betResolvedLogs,
        ] = await Promise.all([
          publicClient.getLogs({
            address: TREASURY_ADDRESS,
            event: parseAbiItem("event Deposited(address indexed player, uint256 amount)"),
            args: { player: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: TREASURY_ADDRESS,
            event: parseAbiItem("event Withdrawn(address indexed player, uint256 amount)"),
            args: { player: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: REWARDS_ADDRESS,
            event: parseAbiItem("event DailyRewardClaimed(address indexed player, uint256 amount, uint256 streak)"),
            args: { player: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: PREDICTION_ADDRESS,
            event: parseAbiItem("event PositionTaken(uint256 indexed marketId, address indexed user, uint8 position, uint256 amount)"),
            args: { user: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: PREDICTION_ADDRESS,
            event: parseAbiItem("event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)"),
            args: { user: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: CASINO_ADDRESS,
            event: parseAbiItem("event BetPlaced(uint256 indexed betId, address indexed player, uint8 gameType, uint256 amount)"),
            args: { player: address },
            fromBlock: 0n,
          }).catch(() => []),
          publicClient.getLogs({
            address: CASINO_ADDRESS,
            event: parseAbiItem("event BetResolved(uint256 indexed betId, address indexed player, bool won, uint256 payout, uint256 result)"),
            args: { player: address },
            fromBlock: 0n,
          }).catch(() => []),
        ]);

        if (!active) return;

        const allTransactions: OnchainTransaction[] = [];

        // 1. Deposits
        for (const log of depositedLogs) {
          const amount = Number(formatUnits(log.args.amount || 0n, 6));
          const ts = await getBlockTimestamp(log.blockNumber);
          allTransactions.push({
            hash: log.transactionHash,
            type: "Deposit",
            game: "-",
            amount: amount,
            result: "-",
            timestamp: ts,
            status: "Confirmed",
          });
        }

        // 2. Withdrawals
        for (const log of withdrawnLogs) {
          const amount = Number(formatUnits(log.args.amount || 0n, 6));
          const ts = await getBlockTimestamp(log.blockNumber);
          allTransactions.push({
            hash: log.transactionHash,
            type: "Withdrawal",
            game: "-",
            amount: -amount,
            result: "-",
            timestamp: ts,
            status: "Confirmed",
          });
        }

        // 3. Rewards
        for (const log of rewardLogs) {
          const amount = Number(formatUnits(log.args.amount || 0n, 6));
          const ts = await getBlockTimestamp(log.blockNumber);
          allTransactions.push({
            hash: log.transactionHash,
            type: "Reward",
            game: "Daily",
            amount: amount,
            result: "-",
            timestamp: ts,
            status: "Confirmed",
          });
        }

        // 4. Predictions: Position taken
        for (const log of predictionPositionLogs) {
          const amount = Number(formatUnits(log.args.amount || 0n, 6));
          const ts = await getBlockTimestamp(log.blockNumber);
          allTransactions.push({
            hash: log.transactionHash,
            type: "Bet",
            game: "Prediction",
            amount: -amount,
            result: "Pending",
            timestamp: ts,
            status: "Confirmed",
          });
        }

        // 5. Predictions: Winnings claimed
        for (const log of predictionWinningsLogs) {
          const amount = Number(formatUnits(log.args.amount || 0n, 6));
          const ts = await getBlockTimestamp(log.blockNumber);
          allTransactions.push({
            hash: log.transactionHash,
            type: "Win",
            game: "Prediction",
            amount: amount,
            result: "Win",
            timestamp: ts,
            status: "Confirmed",
          });
        }

        // 6. Bets & Wins from Casino
        const placedMap: Record<string, any> = {};
        for (const log of betPlacedLogs) {
          const betId = log.args.betId?.toString();
          if (betId) {
            placedMap[betId] = log;
          }
        }

        for (const log of betResolvedLogs) {
          const betId = log.args.betId?.toString();
          const placed = betId ? placedMap[betId] : null;

          const ts = await getBlockTimestamp(log.blockNumber);

          const rawAmount = placed?.args.amount || 0n;
          const amount = Number(formatUnits(rawAmount, 6));

          const rawPayout = log.args.payout || 0n;
          const payout = Number(formatUnits(rawPayout, 6));

          const gameTypeNum = placed?.args.gameType ?? 0; // 0=Roulette, 1=Blackjack, 2=Slots
          const gameNames = ["Roulette", "Blackjack", "Slots"];
          const gameName = gameNames[gameTypeNum] || "Casino";

          const won = log.args.won || false;

          // Add Bet entry
          allTransactions.push({
            hash: log.transactionHash,
            type: "Bet",
            game: gameName,
            amount: -amount,
            result: won ? "Win" : "Loss",
            timestamp: ts,
            status: "Confirmed",
          });

          // Add Win entry if won
          if (won && payout > 0) {
            allTransactions.push({
              hash: log.transactionHash,
              type: "Win",
              game: gameName,
              amount: payout,
              result: payout > amount * 5 ? "Jackpot" : "Win",
              timestamp: ts,
              status: "Confirmed",
            });
          }
        }

        // Sort descending by timestamp
        allTransactions.sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(allTransactions);
      } catch (err) {
        console.error("Failed to load onchain transactions:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchOnchainHistory();

    return () => {
      active = false;
    };
  }, [address, publicClient]);

  const filtered = activeFilter === "All"
    ? transactions
    : transactions.filter((t) => t.type === activeFilter.slice(0, -1));

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Transaction History</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">All onchain transactions on Arc Testnet</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={staggerItem} className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          {txTypes.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f
                  ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-hover)]"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Transactions */}
        <motion.div variants={staggerItem} className="space-y-2">
          {!address ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed border-[var(--border-color)]">
              <Wallet className="w-8 h-8 text-[var(--text-muted)] mb-3 animate-pulse" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">Wallet Not Connected</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                Connect your wallet to fetch your real game, reward, deposit, and withdrawal history directly from the smart contracts.
              </p>
            </Card>
          ) : isLoading ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="w-8 h-8 text-accent-gold animate-spin mb-3" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">Fetching on-chain transaction history...</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Directly querying smart contract event logs on Arc Testnet</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed border-[var(--border-color)]">
              <Clock className="w-8 h-8 text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">No Transactions Found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                You haven't initiated any {activeFilter === "All" ? "" : activeFilter.toLowerCase().slice(0, -1)} transactions yet.
              </p>
            </Card>
          ) : (
            filtered.map((tx, i) => (
              <motion.div
                key={tx.hash + i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}
                  >
                    <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.amount > 0 ? "+" : "-"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{tx.type}</span>
                      {tx.game !== "-" && <Badge>{tx.game}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs font-mono text-[var(--text-muted)]">
                        {tx.hash ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-8)}` : ""}
                      </code>
                      {tx.hash && (
                        <a
                          href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3 text-accent-gold" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-0.5">
                    <Badge variant={tx.status === "Confirmed" ? "success" : "warning"} size="sm">
                      {tx.status}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(tx.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
