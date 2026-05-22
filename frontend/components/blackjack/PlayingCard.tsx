"use client";

import { motion } from "framer-motion";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  isFacedown?: boolean;
  className?: string;
  delay?: number;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-slate-800",
  spades: "text-slate-800",
};

export function PlayingCard({ suit, rank, isFacedown = false, className = "", delay = 0 }: PlayingCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, y: -50, opacity: 0, rotateY: 180 }}
      animate={{ scale: 1, y: 0, opacity: 1, rotateY: isFacedown ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
      className={`relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 rounded-xl shadow-xl flex-shrink-0 perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Back of Card */}
      <div
        className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 border-2 border-indigo-400/30 flex items-center justify-center backface-hidden shadow-2xl"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <div className="w-[85%] h-[90%] border border-indigo-400/40 rounded-lg flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80">
          <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center">
            <span className="text-accent-gold font-bold text-xs">L</span>
          </div>
        </div>
      </div>

      {/* Front of Card */}
      <div
        className="absolute inset-0 w-full h-full rounded-xl bg-white border border-gray-200 flex flex-col backface-hidden shadow-2xl overflow-hidden"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
      >
        {/* Top Left */}
        <div className={`absolute top-1 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center ${suitColors[suit]}`}>
          <span className="text-sm sm:text-lg font-bold leading-none">{rank}</span>
          <span className="text-xs sm:text-sm leading-none">{suitSymbols[suit]}</span>
        </div>

        {/* Center Symbol */}
        <div className={`flex-1 flex items-center justify-center ${suitColors[suit]}`}>
          <span className="text-4xl sm:text-5xl md:text-6xl drop-shadow-sm">{suitSymbols[suit]}</span>
        </div>

        {/* Bottom Right (Rotated) */}
        <div className={`absolute bottom-1 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center rotate-180 ${suitColors[suit]}`}>
          <span className="text-sm sm:text-lg font-bold leading-none">{rank}</span>
          <span className="text-xs sm:text-sm leading-none">{suitSymbols[suit]}</span>
        </div>
      </div>
    </motion.div>
  );
}
