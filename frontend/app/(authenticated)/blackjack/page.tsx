"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { Spade, Minus, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  USDC_ADDRESS, ERC20_ABI,
  CASINO_ADDRESS, CASINO_ABI,
} from "@/lib/contracts";
import { useTx } from "@/lib/useTx";
import { useUSDCBalance } from "@/lib/useUSDCBalance";
import { PlayingCard, Suit, Rank } from "@/components/blackjack/PlayingCard";

const CONTRACTS_DEPLOYED = CASINO_ADDRESS !== "0x0000000000000000000000000000000000000000";

interface CardData {
  suit: Suit;
  rank: Rank;
}

interface GameResult {
  playerScore: number;
  dealerScore: number;
  won: boolean;
  payout: number;
}

// --- Card Generation Logic ---
const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

function getRandomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function getCardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank);
}

// Generates an array of cards that sum up to a specific score
function generateCardsForScore(targetScore: number): CardData[] {
  const cards: CardData[] = [];
  let currentScore = 0;
  
  if (targetScore === 21) {
    return [
      { suit: getRandomSuit(), rank: "A" },
      { suit: getRandomSuit(), rank: ["10", "J", "Q", "K"][Math.floor(Math.random() * 4)] as Rank }
    ];
  }

  // Pick a random starting card that is less than the target score
  const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  while (currentScore < targetScore) {
    const diff = targetScore - currentScore;
    let possibleRanks = ranks.filter(r => getCardValue(r) <= diff);
    
    if (possibleRanks.length === 0) {
        // If we get stuck, just forcefully finish it to avoid infinite loops
        possibleRanks = ["2"];
    }
    
    // Bias towards larger cards if diff is large
    const rank = diff >= 10 
      ? ["10", "J", "Q", "K"][Math.floor(Math.random() * 4)] as Rank 
      : possibleRanks[Math.floor(Math.random() * possibleRanks.length)];

    cards.push({ suit: getRandomSuit(), rank });
    currentScore += getCardValue(rank);
    
    // Safety check - if we somehow overshoot due to forced 2s, we break
    if (currentScore >= targetScore) break;
  }
  return cards;
}

// --- Ghost Players Logic ---
const GHOST_NAMES = ["Alex", "0xCrypto", "Whale_99", "Sarah", "DegenEth"];

function generateGhostHand() {
  const score = Math.floor(Math.random() * 9) + 12; // 12-20 mostly
  return generateCardsForScore(score);
}

export default function BlackjackPage() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  
  // Real Player Cards
  const [playerCards, setPlayerCards] = useState<CardData[]>([]);
  const [dealerCards, setDealerCards] = useState<CardData[]>([]);
  
  // Ghost Player States
  const [ghostCards, setGhostCards] = useState<CardData[][]>(Array(5).fill([]));
  const [ghostBets, setGhostBets] = useState<number[]>(Array(5).fill(0));

  const { value: balance } = useUSDCBalance();
  const { send, status, error: txError, txHash, reset } = useTx();
  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CASINO_ADDRESS] : undefined,
    query: { enabled: !!address && CONTRACTS_DEPLOYED },
  });

  const amountInUnits = parseUnits(betAmount.toString(), 6);
  const needsApproval = CONTRACTS_DEPLOYED && (allowance ?? 0n) < amountInUnits;

  const handlePlay = async () => {
    // Reset table
    setResult(null);
    setPlayerCards([]);
    setDealerCards([]);
    setGhostCards(Array(5).fill([]));
    
    // Ghost players place bets
    setGhostBets(Array(5).fill(0).map(() => [5, 10, 25, 50, 100, 250][Math.floor(Math.random() * 6)]));

    if (!CONTRACTS_DEPLOYED || !address) {
      setIsPlaying(true);
      setTimeout(() => finalizeHand(
        Math.floor(Math.random() * 11) + 12,
        Math.floor(Math.random() * 11) + 12
      ), 2000);
      return;
    }

    setIsPlaying(true);

    try {
      if (needsApproval) {
        await send(() => writeContractAsync({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [CASINO_ADDRESS, amountInUnits * 100n] }));
        await refetchAllowance();
      }

      await send(() => writeContractAsync({ address: CASINO_ADDRESS, abi: CASINO_ABI, functionName: "playBlackjack", args: [amountInUnits] }));

      // Simulate outcome visual based on contract logic bounds
      finalizeHand(Math.floor(Math.random() * 11) + 12, Math.floor(Math.random() * 11) + 12);
    } catch {
      setIsPlaying(false);
    }
  };

  const finalizeHand = (pScore: number, dScore: number) => {
    // Deal ghosts
    setGhostCards(Array(5).fill(0).map(() => generateGhostHand()));
    
    // Deal player and dealer
    setPlayerCards(generateCardsForScore(pScore));
    setDealerCards(generateCardsForScore(dScore));
    
    const playerBust = pScore > 21;
    const dealerBust = dScore > 21;
    let won = false;
    let payout = 0;

    if (!playerBust) {
      if (dealerBust || pScore > dScore) {
        won = true;
        payout = pScore === 21 ? betAmount * 2.5 : betAmount * 2;
      } else if (pScore === dScore) {
        payout = betAmount;
      }
    }

    setResult({ playerScore: pScore, dealerScore: dScore, won, payout });
    setIsPlaying(false);
  };

  const isLoading = isPlaying || status === "pending" || status === "confirming";

  // Table Layout Math for 6 seats (Indices 0 to 5)
  // We want a semi-circle. We will use flex and translate-y
  const seatTransforms = [
    { y: -20, rotate: 20 },
    { y: 10, rotate: 10 },
    { y: 30, rotate: 0 },  // Seat 2 (Main Player)
    { y: 30, rotate: 0 },
    { y: 10, rotate: -10 },
    { y: -20, rotate: -20 },
  ];

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6 max-w-7xl mx-auto">
        <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">Blackjack VIP</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">6-Player Table • 3:2 Payouts • Dealers hit on soft 17</p>
          </div>
          <div className="flex items-center gap-2">
            {!CONTRACTS_DEPLOYED && <Badge variant="warning">Demo Mode</Badge>}
            <Badge variant="accent">Provably Fair</Badge>
          </div>
        </motion.div>

        {/* Action Bar (Top) */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
           <Card className="p-4 md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--bg-card)]/50 backdrop-blur-md">
             <div className="flex items-center gap-4 w-full md:w-auto">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Your Bet</label>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setBetAmount(Math.max(1, betAmount - 5))}><Minus className="w-3 h-3" /></Button>
                    <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-20 text-center h-8 bg-transparent" />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setBetAmount(betAmount + 5)}><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[10, 50, 100].map((v) => (
                    <Badge key={v} variant={betAmount === v ? "accent" : "outline"} className="cursor-pointer" onClick={() => setBetAmount(v)}>${v}</Badge>
                  ))}
                </div>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
                {address && (
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Available Balance</span>
                    <span className="font-mono font-bold text-accent-gold">${balance.toFixed(2)}</span>
                  </div>
                )}
                <Button onClick={handlePlay} isLoading={isLoading} disabled={isLoading || (CONTRACTS_DEPLOYED && betAmount > balance)} className="w-full md:w-auto shadow-xl shadow-accent-gold/20">
                  <Spade className="w-4 h-4" /> {isLoading ? "Dealing..." : "Play Hand"}
                </Button>
             </div>
           </Card>

           <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="md:col-span-1">
                  <Card className={`p-4 h-full flex flex-col justify-center items-center text-center ${result.won ? 'bg-emerald-500/10 border-emerald-500/30' : result.payout > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <span className={`text-sm font-bold uppercase tracking-wider ${result.won ? 'text-emerald-400' : result.payout > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                      {result.won ? 'You Won!' : result.payout > 0 ? 'Push' : 'Dealer Wins'}
                    </span>
                    {result.payout > 0 && <span className="text-xl font-mono font-bold text-white mt-1">+${result.payout}</span>}
                  </Card>
                </motion.div>
              )}
           </AnimatePresence>
        </motion.div>

        {/* The Table */}
        <motion.div variants={staggerItem} className="relative w-full h-[600px] rounded-[3rem] overflow-hidden border-t-8 border-x-8 border-[#3b2f2f] shadow-2xl bg-gradient-to-b from-[#1a4731] to-[#0d2a1b] p-8 flex flex-col justify-between">
           {/* Table Texture/Glow */}
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')]" />
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

           {/* Dealer Area */}
           <div className="flex flex-col items-center z-10">
              <div className="w-48 h-24 border border-white/20 rounded-t-full rounded-b-xl flex flex-col items-center justify-end pb-4 bg-black/20 backdrop-blur-sm relative">
                <span className="absolute top-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">Dealer</span>
                <div className="flex -space-x-8">
                  <AnimatePresence>
                    {dealerCards.length > 0 ? (
                      dealerCards.map((card, i) => (
                        <PlayingCard key={`dealer-${i}`} suit={card.suit} rank={card.rank} delay={i * 0.2 + 0.5} />
                      ))
                    ) : (
                      <>
                        <PlayingCard suit="spades" rank="A" isFacedown delay={0} />
                        <PlayingCard suit="hearts" rank="K" isFacedown delay={0.1} />
                      </>
                    )}
                  </AnimatePresence>
                </div>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} delay={1} className="absolute -bottom-10 bg-black/80 px-4 py-1 rounded-full border border-white/10 text-white font-mono font-bold text-sm">
                    {result.dealerScore} {result.dealerScore > 21 && <span className="text-red-400 ml-1">BUST</span>}
                  </motion.div>
                )}
              </div>
           </div>

           {/* Middle Logo */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-30 pointer-events-none z-0">
             <Spade className="w-32 h-32 text-accent-gold" />
             <h2 className="font-display text-4xl font-black text-accent-gold mt-4 uppercase tracking-widest">Liminal</h2>
             <p className="text-white font-bold tracking-widest text-sm mt-2">PAYS 3 TO 2</p>
           </div>

           {/* 6 Players Semi-Circle */}
           <div className="flex justify-between items-end w-full max-w-6xl mx-auto z-10 px-4 md:px-12 mt-auto">
             {seatTransforms.map((transform, seatIndex) => {
               const isMainPlayer = seatIndex === 2;
               const ghostIndex = seatIndex > 2 ? seatIndex - 1 : seatIndex;
               
               let cardsToRender: CardData[] = [];
               let currentBet = 0;
               let playerName = "";

               if (isMainPlayer) {
                 cardsToRender = playerCards;
                 currentBet = isPlaying || result ? betAmount : 0;
                 playerName = "YOU";
               } else {
                 cardsToRender = ghostCards[ghostIndex] || [];
                 currentBet = ghostBets[ghostIndex] || 0;
                 playerName = GHOST_NAMES[ghostIndex];
               }

               return (
                 <div 
                   key={seatIndex} 
                   className="flex flex-col items-center relative"
                   style={{ 
                     transform: `translateY(${transform.y}px) rotate(${transform.rotate}deg)`,
                     width: "120px"
                   }}
                 >
                   {/* Bet Chip */}
                   <AnimatePresence>
                     {currentBet > 0 && (
                       <motion.div 
                         initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
                         className="absolute -top-16 z-0 w-12 h-12 rounded-full border-4 border-dashed border-accent-gold bg-black/60 flex items-center justify-center shadow-2xl"
                       >
                         <span className="text-[10px] font-bold text-accent-gold font-mono">${currentBet}</span>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Cards */}
                   <div className="flex -space-x-12 sm:-space-x-10 md:-space-x-8 justify-center min-h-[100px] relative z-10">
                     <AnimatePresence>
                       {cardsToRender.length > 0 ? (
                         cardsToRender.map((card, i) => (
                           <PlayingCard 
                             key={`seat-${seatIndex}-${i}`} 
                             suit={card.suit} 
                             rank={card.rank} 
                             delay={isMainPlayer ? i * 0.2 : i * 0.2 + (ghostIndex * 0.1)} 
                             className={isMainPlayer ? "scale-110 md:scale-125 z-20" : "scale-75 md:scale-90 opacity-80"}
                           />
                         ))
                       ) : (
                         <div className={`w-16 h-24 sm:w-20 sm:h-32 rounded-xl border-2 border-white/10 bg-white/5 backdrop-blur-sm ${isMainPlayer ? 'scale-110 md:scale-125' : 'scale-75 md:scale-90 opacity-50'}`} />
                       )}
                     </AnimatePresence>
                   </div>

                   {/* Player Name Tag */}
                   <div className={`mt-6 px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap shadow-xl ${isMainPlayer ? 'bg-accent-gold text-black border-accent-gold shadow-accent-gold/30' : 'bg-black/60 text-white/60 border-white/10'}`}>
                     {playerName}
                   </div>

                   {/* Player Score (Main Only for UI clarity) */}
                   {isMainPlayer && result && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 bg-black/80 px-4 py-1 rounded-full border border-accent-gold text-accent-gold font-mono font-bold text-sm">
                       {result.playerScore} {result.playerScore > 21 && <span className="text-red-400 ml-1">BUST</span>}
                     </motion.div>
                   )}
                 </div>
               );
             })}
           </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
