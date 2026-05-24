export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;

export const TREASURY_ADDRESS = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const CASINO_ADDRESS = (process.env.NEXT_PUBLIC_CASINO_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const PREDICTION_ADDRESS = (process.env.NEXT_PUBLIC_PREDICTION_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const REWARDS_ADDRESS = (process.env.NEXT_PUBLIC_REWARDS_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }], name: "transfer", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
] as const;

export const TREASURY_ABI = [
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "addBankroll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdrawBankroll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "player", type: "address" }], name: "getPlayerBalance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTreasuryBalance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalBankroll", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "paused", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "player", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "Deposited", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "player", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "Withdrawn", type: "event" },
] as const;

export const CASINO_ABI = [
  { inputs: [{ name: "betType", type: "uint8" }, { name: "choice", type: "uint256" }, { name: "amount", type: "uint256" }], name: "playRoulette", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "playBlackjack", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "playSlots", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "player", type: "address" }], name: "getPlayerStats", outputs: [{ components: [{ name: "totalBets", type: "uint256" }, { name: "totalWon", type: "uint256" }, { name: "totalLost", type: "uint256" }, { name: "totalWagered", type: "uint256" }, { name: "totalWinnings", type: "uint256" }, { name: "currentStreak", type: "uint256" }, { name: "bestStreak", type: "uint256" }, { name: "lastBetTime", type: "uint256" }], type: "tuple" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "betId", type: "uint256" }], name: "getBet", outputs: [{ components: [{ name: "player", type: "address" }, { name: "gameType", type: "uint8" }, { name: "betType", type: "uint8" }, { name: "amount", type: "uint256" }, { name: "choice", type: "uint256" }, { name: "timestamp", type: "uint256" }, { name: "resolved", type: "bool" }, { name: "won", type: "bool" }, { name: "payout", type: "uint256" }], type: "tuple" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "betCounter", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "minBet", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "maxBet", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { anonymous: false, inputs: [{ indexed: true, name: "betId", type: "uint256" }, { indexed: true, name: "player", type: "address" }, { indexed: false, name: "won", type: "bool" }, { indexed: false, name: "payout", type: "uint256" }, { indexed: false, name: "result", type: "uint256" }], name: "BetResolved", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "betId", type: "uint256" }, { indexed: false, name: "number", type: "uint256" }, { indexed: false, name: "color", type: "string" }], name: "RouletteResult", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "betId", type: "uint256" }, { indexed: false, name: "reel1", type: "uint256" }, { indexed: false, name: "reel2", type: "uint256" }, { indexed: false, name: "reel3", type: "uint256" }], name: "SlotsResult", type: "event" },
] as const;

export const PREDICTION_ABI = [
  { inputs: [{ name: "marketId", type: "uint256" }, { name: "position", type: "uint8" }, { name: "amount", type: "uint256" }], name: "takePosition", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "marketId", type: "uint256" }], name: "claimWinnings", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "marketId", type: "uint256" }], name: "getMarket", outputs: [{ components: [{ name: "id", type: "uint256" }, { name: "description", type: "string" }, { name: "creator", type: "address" }, { name: "deadline", type: "uint256" }, { name: "settleTime", type: "uint256" }, { name: "status", type: "uint8" }, { name: "yesPool", type: "uint256" }, { name: "noPool", type: "uint256" }, { name: "outcome", type: "uint8" }, { name: "totalParticipants", type: "uint256" }], type: "tuple" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "marketId", type: "uint256" }], name: "getOdds", outputs: [{ name: "yesOdds", type: "uint256" }, { name: "noOdds", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "marketCounter", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

export const REWARDS_ABI = [
  { inputs: [], name: "claimDailyReward", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "code", type: "bytes32" }], name: "generateReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "code", type: "bytes32" }], name: "useReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "player", type: "address" }], name: "getPlayerRewards", outputs: [{ components: [{ name: "xp", type: "uint256" }, { name: "tier", type: "uint8" }, { name: "dailyStreak", type: "uint256" }, { name: "lastClaimDay", type: "uint256" }, { name: "totalClaimed", type: "uint256" }, { name: "referrer", type: "address" }, { name: "referralEarnings", type: "uint256" }, { name: "referralCount", type: "uint256" }], type: "tuple" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "player", type: "address" }], name: "canClaimDaily", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "jackpotPool", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
] as const;
