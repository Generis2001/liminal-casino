"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Gift, Flame, Trophy, Copy, Users, Star, Zap } from "lucide-react";
import { useState } from "react";

const vipTiers = [
  { name: "Bronze", xp: 0, color: "#CD7F32", perks: ["1x daily reward", "Basic games"] },
  { name: "Silver", xp: 1000, color: "#C0C0C0", perks: ["1.25x daily reward", "Priority support"] },
  { name: "Gold", xp: 5000, color: "#FFD700", perks: ["1.5x daily reward", "Exclusive games", "Reduced fees"] },
  { name: "Diamond", xp: 25000, color: "#B9F2FF", perks: ["1.75x daily reward", "VIP events", "Cashback"] },
  { name: "Platinum", xp: 100000, color: "#E5E4E2", perks: ["2x daily reward", "All perks", "Custom avatar"] },
];

export default function RewardsPage() {
  const [referralCopied, setReferralCopied] = useState(false);
  const currentXP = 5240;
  const currentTier = 2; // Gold
  const nextTier = vipTiers[currentTier + 1];
  const progress = ((currentXP - vipTiers[currentTier].xp) / (nextTier.xp - vipTiers[currentTier].xp)) * 100;

  const copyReferral = () => {
    navigator.clipboard.writeText("LIMINAL-8A3FC2");
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Rewards & VIP</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Earn XP, climb tiers, claim rewards</p>
        </motion.div>

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
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400">7 day streak</span>
                </div>
                <Badge variant="success">Claimable</Badge>
              </div>
              <p className="text-3xl font-bold text-accent-gold font-mono mb-2">$4.50 <span className="text-sm text-[var(--text-muted)]">USDC</span></p>
              <p className="text-xs text-[var(--text-muted)] mb-4">Base $1.00 + Streak $3.50 (Gold 1.5x)</p>
              <Button className="w-full"><Zap className="w-4 h-4" /> Claim Daily Reward</Button>
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
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-mono">LIMINAL-8A3FC2</code>
                <Button size="sm" variant="secondary" onClick={copyReferral}>
                  <Copy className="w-3 h-3" /> {referralCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-card)]"><p className="text-xs text-[var(--text-muted)]">Referrals</p><p className="text-lg font-bold">12</p></div>
                <div className="p-3 rounded-xl bg-[var(--bg-card)]"><p className="text-xs text-[var(--text-muted)]">Earned</p><p className="text-lg font-bold text-emerald-400 font-mono">$234</p></div>
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
              <span className="text-xs text-[var(--text-muted)]">→ {nextTier.name}</span>
            </div>
            <div className="relative h-3 rounded-full bg-[var(--bg-card)] mb-2 overflow-hidden">
              <motion.div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-accent-gold to-accent-warm" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">{currentXP.toLocaleString()} / {nextTier.xp.toLocaleString()} XP</p>
            <div className="grid grid-cols-5 gap-2 mt-6">
              {vipTiers.map((tier, i) => (
                <div key={tier.name} className={`p-3 rounded-xl text-center ${i <= currentTier ? "bg-[var(--bg-card-hover)]" : "bg-[var(--bg-card)] opacity-50"}`}>
                  <Star className="w-4 h-4 mx-auto mb-1" style={{ color: tier.color }} />
                  <p className="text-xs font-semibold" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{(tier.xp / 1000).toFixed(0)}K XP</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
