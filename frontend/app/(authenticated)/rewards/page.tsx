"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Gift, Flame, Trophy, Copy, Users, Star, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { REWARDS_ADDRESS, REWARDS_ABI } from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { formatUnits } from "viem";

const CONTRACTS_DEPLOYED = REWARDS_ADDRESS !== "0x0000000000000000000000000000000000000000";

const vipTiers = [
  { name: "Bronze", xp: 0, color: "#CD7F32", perks: ["1x daily reward", "Basic games"] },
  { name: "Silver", xp: 1000, color: "#C0C0C0", perks: ["1.25x daily reward", "Priority support"] },
  { name: "Gold", xp: 5000, color: "#FFD700", perks: ["1.5x daily reward", "Exclusive games", "Reduced fees"] },
  { name: "Diamond", xp: 25000, color: "#B9F2FF", perks: ["1.75x daily reward", "VIP events", "Cashback"] },
  { name: "Platinum", xp: 100000, color: "#E5E4E2", perks: ["2x daily reward", "All perks", "Custom avatar"] },
];

export default function RewardsPage() {
  const { address } = useAccount();
  const [referralCopied, setReferralCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { send, status: txStatus, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  const { data: rewardsData, refetch: refetchRewards } = useReadContract({
    address: REWARDS_ADDRESS,
    abi: REWARDS_ABI,
    functionName: "getPlayerRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address && CONTRACTS_DEPLOYED }
  });

  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: REWARDS_ADDRESS,
    abi: REWARDS_ABI,
    functionName: "canClaimDaily",
    args: address ? [address] : undefined,
    query: { enabled: !!address && CONTRACTS_DEPLOYED }
  });

  const currentXP = rewardsData ? Number(rewardsData.xp) : 5240;
  const currentTierIndex = rewardsData ? Number(rewardsData.tier) : 2;
  const currentTier = Math.min(currentTierIndex, vipTiers.length - 1);
  const nextTier = currentTier < vipTiers.length - 1 ? vipTiers[currentTier + 1] : vipTiers[currentTier];
  
  let progress = 100;
  if (currentTier < vipTiers.length - 1) {
    progress = ((currentXP - vipTiers[currentTier].xp) / (nextTier.xp - vipTiers[currentTier].xp)) * 100;
    progress = Math.max(0, Math.min(100, progress));
  }

  const streak = rewardsData ? Number(rewardsData.dailyStreak) : 7;
  const referralCount = rewardsData ? Number(rewardsData.referralCount) : 12;
  const referralEarnings = rewardsData ? Number(formatUnits(rewardsData.referralEarnings, 6)) : 234;

  const isClaimable = CONTRACTS_DEPLOYED ? !!canClaim : true;

  const copyReferral = () => {
    const code = address ? `ARC-${address.slice(2, 8).toUpperCase()}` : "LIMINAL-8A3FC2";
    navigator.clipboard.writeText(code);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (isClaiming || !isClaimable) return;

    if (!CONTRACTS_DEPLOYED || !address) {
      setIsClaiming(true);
      setTimeout(() => {
        setIsClaiming(false);
        alert("Demo mode: Claimed Daily Reward!");
      }, 1000);
      return;
    }

    setIsClaiming(true);
    try {
      await send(() =>
        writeContractAsync({
          address: REWARDS_ADDRESS,
          abi: REWARDS_ABI,
          functionName: "claimDailyReward",
        })
      );
      await refetchRewards();
      await refetchCanClaim();
    } catch {
      // handled by useTx
    } finally {
      setIsClaiming(false);
    }
  };

  const baseReward = 1.00;
  const streakBonus = Math.min(streak * 0.50, 3.50);
  const tierMultiplier = 1 + (currentTier * 0.25);
  const estimatedReward = (baseReward + streakBonus) * tierMultiplier;
  
  const isLoading = isClaiming || txStatus === "pending" || txStatus === "confirming";

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Rewards & VIP</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Earn XP, climb tiers, claim rewards</p>
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
                Data shown is simulated. Deploy contracts and set <code className="text-amber-400">NEXT_PUBLIC_REWARDS_ADDRESS</code>.
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
              <span className="text-sm text-emerald-400">Daily reward claimed successfully!</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Reward */}
          <motion.div variants={staggerItem}>
            <Card glow className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-accent-gold" />
                <h2 className="font-display font-semibold text-lg">Daily Reward</h2>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-[var(--text-muted)]'}`} />
                  <span className={`text-sm font-bold ${streak > 0 ? 'text-orange-400' : 'text-[var(--text-muted)]'}`}>{streak} day streak</span>
                </div>
                {isClaimable ? (
                  <Badge variant="success">Claimable</Badge>
                ) : (
                  <Badge variant="default">Already Claimed</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-accent-gold font-mono mb-2">${estimatedReward.toFixed(2)} <span className="text-sm text-[var(--text-muted)]">USDC</span></p>
              <p className="text-xs text-[var(--text-muted)] mb-4">Base $1.00 + Streak ${streakBonus.toFixed(2)} ({vipTiers[currentTier].name} {tierMultiplier}x)</p>
              <Button 
                className="w-full" 
                onClick={handleClaim} 
                disabled={!isClaimable || isLoading}
                isLoading={isLoading}
              >
                <Zap className="w-4 h-4" /> {isLoading ? "Claiming..." : "Claim Daily Reward"}
              </Button>
            </Card>
          </motion.div>

          {/* Referral */}
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-accent-gold" />
                <h2 className="font-display font-semibold text-lg">Referral Program</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3">Earn 5% of your referrals&apos; bet volume</p>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-mono text-[var(--text-primary)] truncate">
                  {address ? `ARC-${address.slice(2, 8).toUpperCase()}` : "LIMINAL-8A3FC2"}
                </code>
                <Button size="sm" variant="secondary" onClick={copyReferral}>
                  <Copy className="w-3 h-3" /> {referralCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-card)]"><p className="text-xs text-[var(--text-muted)]">Referrals</p><p className="text-lg font-bold text-[var(--text-primary)]">{referralCount}</p></div>
                <div className="p-3 rounded-xl bg-[var(--bg-card)]"><p className="text-xs text-[var(--text-muted)]">Earned</p><p className="text-lg font-bold text-emerald-400 font-mono">${referralEarnings.toLocaleString()}</p></div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* VIP Tiers */}
        <motion.div variants={staggerItem}>
          <h2 className="text-lg font-display font-semibold mb-4">VIP Progression</h2>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5" style={{ color: vipTiers[currentTier].color }} />
              <span className="font-bold" style={{ color: vipTiers[currentTier].color }}>{vipTiers[currentTier].name}</span>
              {currentTier < vipTiers.length - 1 && (
                <span className="text-xs text-[var(--text-muted)]">→ {nextTier.name}</span>
              )}
            </div>
            <div className="relative h-3 rounded-full bg-[var(--bg-card)] mb-2 overflow-hidden border border-[var(--border-color)]">
              <motion.div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-accent-gold to-accent-warm" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            {currentTier < vipTiers.length - 1 ? (
              <p className="text-xs text-[var(--text-muted)]">{currentXP.toLocaleString()} / {nextTier.xp.toLocaleString()} XP</p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">{currentXP.toLocaleString()} XP (Max Tier)</p>
            )}
            <div className="grid grid-cols-5 gap-2 mt-6">
              {vipTiers.map((tier, i) => (
                <div key={tier.name} className={`p-2 sm:p-3 rounded-xl text-center ${i <= currentTier ? "bg-[var(--bg-card-hover)] border border-[var(--border-color)]" : "bg-[var(--bg-card)] opacity-40 border border-transparent"}`}>
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1" style={{ color: tier.color }} />
                  <p className="text-[10px] sm:text-xs font-semibold" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">{(tier.xp / 1000).toFixed(0)}K XP</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
