"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { CircleDot, Spade, Cherry, TrendingUp, Star, Users, Zap, Flame } from "lucide-react";
import Link from "next/link";

const games = [
  {
    id: "roulette", name: "European Roulette", icon: CircleDot, href: "/roulette",
    description: "Classic 37-number roulette with multiple bet types",
    minBet: 1, maxBet: 1000, players: 234, hot: true,
    gradient: "from-red-500/10 via-orange-500/10 to-yellow-500/10",
  },
  {
    id: "blackjack", name: "Blackjack", icon: Spade, href: "/blackjack",
    description: "Beat the dealer to 21 with provably fair cards",
    minBet: 5, maxBet: 500, players: 182, hot: false,
    gradient: "from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
  },
  {
    id: "slots", name: "Quantum Slots", icon: Cherry, href: "/slots",
    description: "3-reel slot machine with dynamic jackpots up to 100x",
    minBet: 1, maxBet: 200, players: 567, hot: true,
    gradient: "from-purple-500/10 via-pink-500/10 to-rose-500/10",
  },
  {
    id: "predictions", name: "Prediction Markets", icon: TrendingUp, href: "/predictions",
    description: "Take YES/NO positions on real-world events",
    minBet: 1, maxBet: 10000, players: 89, hot: false,
    gradient: "from-blue-500/10 via-indigo-500/10 to-violet-500/10",
  },
];

const featured = games[2]; // Slots featured

export default function LobbyPage() {
  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Casino Lobby</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Choose your game. All bets settled on Arc Testnet.</p>
        </motion.div>

        {/* Featured Game Banner */}
        <motion.div variants={staggerItem}>
          <Link href={featured.href}>
            <Card glow className={`p-8 bg-gradient-to-r ${featured.gradient} relative overflow-hidden group`}>
              <div className="absolute top-4 right-4">
                <Badge variant="accent"><Star className="w-3 h-3 mr-1" /> Featured</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <featured.icon className="w-8 h-8 text-accent-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">{featured.name}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{featured.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-[var(--text-muted)]"><Users className="w-3 h-3 inline mr-1" />{featured.players} playing</span>
                    <span className="text-xs text-[var(--text-muted)]">Up to 100x payout</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* All Games Grid */}
        <motion.div variants={staggerItem}>
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-4">All Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <Link key={game.id} href={game.href}>
                <Card glow className={`p-6 bg-gradient-to-br ${game.gradient} group cursor-pointer h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <game.icon className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div className="flex items-center gap-2">
                      {game.hot && (
                        <Badge variant="warning"><Flame className="w-3 h-3 mr-1" /> Hot</Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-[var(--text-primary)] mb-1">{game.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                      <span>${game.minBet} - ${game.maxBet}</span>
                      <span><Users className="w-3 h-3 inline mr-1" />{game.players}</span>
                    </div>
                    <Button size="sm" variant="ghost"><Zap className="w-3 h-3" /> Play</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
