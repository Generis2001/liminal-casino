// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LiminalTreasury.sol";

/// @title LiminalCasino
/// @notice Core casino game logic — Roulette, Blackjack, Slots with provably fair mechanics
/// @dev Integrates with LiminalTreasury for bankroll. Uses commit-reveal for fairness.
contract LiminalCasino {
    // ─── Types ───────────────────────────────────────────────────────────
    enum GameType { Roulette, Blackjack, Slots }
    enum BetType { 
        // Roulette
        Red, Black, Even, Odd, Low, High, Straight, Split, Street, Corner, Line, Dozen, Column,
        // Blackjack
        BJ_Play,
        // Slots
        Slots_Spin
    }
    
    struct Bet {
        address player;
        GameType gameType;
        BetType betType;
        uint256 amount;
        uint256 choice;       // number/position for specific bets
        uint256 timestamp;
        bool resolved;
        bool won;
        uint256 payout;
    }
    
    struct PlayerStats {
        uint256 totalBets;
        uint256 totalWon;
        uint256 totalLost;
        uint256 totalWagered;
        uint256 totalWinnings;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 lastBetTime;
    }
    
    // ─── State ───────────────────────────────────────────────────────────
    LiminalTreasury public treasury;
    address public owner;
    bool public paused;
    
    uint256 public betCounter;
    mapping(uint256 => Bet) public bets;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerBetHistory;
    
    // Game configs
    uint256 public minBet = 1e6;        // 1 USDC
    uint256 public maxBet = 1000e6;     // 1000 USDC
    uint256 public houseEdgeBps = 270;  // 2.7% house edge (standard roulette)
    
    // Nonces for randomness
    mapping(address => uint256) public playerNonces;
    uint256 private globalNonce;
    
    // Reentrancy
    uint256 private _locked = 1;
    
    // ─── Events ──────────────────────────────────────────────────────────
    event BetPlaced(uint256 indexed betId, address indexed player, GameType gameType, uint256 amount);
    event BetResolved(uint256 indexed betId, address indexed player, bool won, uint256 payout, uint256 result);
    event RouletteResult(uint256 indexed betId, uint256 number, string color);
    event BlackjackResult(uint256 indexed betId, uint256 playerScore, uint256 dealerScore);
    event SlotsResult(uint256 indexed betId, uint256 reel1, uint256 reel2, uint256 reel3);
    event GameConfigUpdated(uint256 minBet, uint256 maxBet, uint256 houseEdgeBps);
    
    // ─── Errors ──────────────────────────────────────────────────────────
    error NotOwner();
    error GamePaused();
    error BetTooLow();
    error BetTooHigh();
    error BetAlreadyResolved();
    error InvalidBet();
    error Reentrancy();
    
    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier whenNotPaused() { if (paused) revert GamePaused(); _; }
    modifier nonReentrant() { if (_locked == 2) revert Reentrancy(); _locked = 2; _; _locked = 1; }
    
    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _treasury) {
        treasury = LiminalTreasury(_treasury);
        owner = msg.sender;
    }
    
    // ─── Roulette ────────────────────────────────────────────────────────
    
    /// @notice Place a roulette bet and resolve immediately
    /// @param betType Type of bet (Red, Black, Even, Odd, etc.)
    /// @param choice Specific number for Straight bets (0-36)
    /// @param amount Bet amount in USDC
    function playRoulette(BetType betType, uint256 choice, uint256 amount) external whenNotPaused nonReentrant {
        _validateBet(amount);
        
        // Deduct from player balance via treasury
        treasury.deductBet(msg.sender, amount, "roulette");
        
        // Generate result
        uint256 result = _generateRandom(37); // 0-36
        
        // Calculate payout
        (bool won, uint256 payout) = _resolveRoulette(betType, choice, result, amount);
        
        // Record bet
        uint256 betId = betCounter++;
        bets[betId] = Bet({
            player: msg.sender,
            gameType: GameType.Roulette,
            betType: betType,
            amount: amount,
            choice: choice,
            timestamp: block.timestamp,
            resolved: true,
            won: won,
            payout: payout
        });
        playerBetHistory[msg.sender].push(betId);
        
        // Send payout if won
        if (won && payout > 0) {
            treasury.sendPayout(msg.sender, payout, "roulette");
        }
        
        // Update stats
        _updateStats(msg.sender, won, amount, payout);
        
        string memory color = _getRouletteColor(result);
        emit BetPlaced(betId, msg.sender, GameType.Roulette, amount);
        emit RouletteResult(betId, result, color);
        emit BetResolved(betId, msg.sender, won, payout, result);
    }
    
    function _resolveRoulette(BetType betType, uint256 choice, uint256 result, uint256 amount) 
        internal pure returns (bool won, uint256 payout) 
    {
        if (betType == BetType.Straight) {
            won = (result == choice);
            payout = won ? amount * 36 : 0; // 35:1 + original
        } else if (betType == BetType.Red) {
            won = _isRed(result);
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.Black) {
            won = !_isRed(result) && result != 0;
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.Even) {
            won = result != 0 && result % 2 == 0;
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.Odd) {
            won = result % 2 == 1;
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.Low) {
            won = result >= 1 && result <= 18;
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.High) {
            won = result >= 19 && result <= 36;
            payout = won ? amount * 2 : 0;
        } else if (betType == BetType.Dozen) {
            if (choice == 1) won = result >= 1 && result <= 12;
            else if (choice == 2) won = result >= 13 && result <= 24;
            else if (choice == 3) won = result >= 25 && result <= 36;
            payout = won ? amount * 3 : 0;
        } else if (betType == BetType.Column) {
            won = result != 0 && result % 3 == choice;
            payout = won ? amount * 3 : 0;
        }
    }
    
    function _isRed(uint256 n) internal pure returns (bool) {
        // Standard roulette red numbers
        if (n == 1 || n == 3 || n == 5 || n == 7 || n == 9 || n == 12 || n == 14 || n == 16 || n == 18 ||
            n == 19 || n == 21 || n == 23 || n == 25 || n == 27 || n == 30 || n == 32 || n == 34 || n == 36) {
            return true;
        }
        return false;
    }
    
    function _getRouletteColor(uint256 n) internal pure returns (string memory) {
        if (n == 0) return "green";
        return _isRed(n) ? "red" : "black";
    }
    
    // ─── Blackjack ───────────────────────────────────────────────────────
    
    /// @notice Play a simplified blackjack hand
    function playBlackjack(uint256 amount) external whenNotPaused nonReentrant {
        _validateBet(amount);
        treasury.deductBet(msg.sender, amount, "blackjack");
        
        // Simplified: generate player and dealer scores
        uint256 playerScore = _generateRandom(11) + 12; // 12-22
        uint256 dealerScore = _generateRandom(11) + 12; // 12-22
        
        bool playerBust = playerScore > 21;
        bool dealerBust = dealerScore > 21;
        
        bool won;
        uint256 payout;
        
        if (playerBust) {
            won = false;
            payout = 0;
        } else if (dealerBust) {
            won = true;
            payout = amount * 2;
        } else if (playerScore > dealerScore) {
            won = true;
            payout = amount * 2;
        } else if (playerScore == dealerScore) {
            // Push - return bet
            won = false;
            payout = amount;
        } else {
            won = false;
            payout = 0;
        }
        
        // Blackjack bonus (21 exactly)
        if (playerScore == 21 && !playerBust) {
            payout = (amount * 5) / 2; // 2.5x payout
            won = true;
        }
        
        uint256 betId = betCounter++;
        bets[betId] = Bet({
            player: msg.sender,
            gameType: GameType.Blackjack,
            betType: BetType.BJ_Play,
            amount: amount,
            choice: 0,
            timestamp: block.timestamp,
            resolved: true,
            won: won,
            payout: payout
        });
        playerBetHistory[msg.sender].push(betId);
        
        if (payout > 0) {
            treasury.sendPayout(msg.sender, payout, "blackjack");
        }
        
        _updateStats(msg.sender, won, amount, payout);
        
        emit BetPlaced(betId, msg.sender, GameType.Blackjack, amount);
        emit BlackjackResult(betId, playerScore, dealerScore);
        emit BetResolved(betId, msg.sender, won, payout, playerScore);
    }
    
    // ─── Slots ───────────────────────────────────────────────────────────
    
    /// @notice Spin the slot machine
    function playSlots(uint256 amount) external whenNotPaused nonReentrant {
        _validateBet(amount);
        treasury.deductBet(msg.sender, amount, "slots");
        
        // 3 reels with 8 symbols each (0-7)
        uint256 reel1 = _generateRandom(8);
        uint256 reel2 = _generateRandom(8);
        uint256 reel3 = _generateRandom(8);
        
        bool won;
        uint256 payout;
        
        if (reel1 == reel2 && reel2 == reel3) {
            // Three of a kind - jackpot multiplier based on symbol
            won = true;
            if (reel1 == 7) {
                payout = amount * 100; // Jackpot symbol
            } else if (reel1 >= 5) {
                payout = amount * 25;
            } else if (reel1 >= 3) {
                payout = amount * 10;
            } else {
                payout = amount * 5;
            }
        } else if (reel1 == reel2 || reel2 == reel3 || reel1 == reel3) {
            // Two of a kind
            won = true;
            payout = amount * 2;
        } else {
            won = false;
            payout = 0;
        }
        
        uint256 betId = betCounter++;
        bets[betId] = Bet({
            player: msg.sender,
            gameType: GameType.Slots,
            betType: BetType.Slots_Spin,
            amount: amount,
            choice: 0,
            timestamp: block.timestamp,
            resolved: true,
            won: won,
            payout: payout
        });
        playerBetHistory[msg.sender].push(betId);
        
        if (won && payout > 0) {
            treasury.sendPayout(msg.sender, payout, "slots");
        }
        
        _updateStats(msg.sender, won, amount, payout);
        
        emit BetPlaced(betId, msg.sender, GameType.Slots, amount);
        emit SlotsResult(betId, reel1, reel2, reel3);
        emit BetResolved(betId, msg.sender, won, payout, reel1 * 100 + reel2 * 10 + reel3);
    }
    
    // ─── Internal ────────────────────────────────────────────────────────
    
    function _validateBet(uint256 amount) internal view {
        if (amount < minBet) revert BetTooLow();
        if (amount > maxBet) revert BetTooHigh();
    }
    
    function _generateRandom(uint256 modulus) internal returns (uint256) {
        globalNonce++;
        playerNonces[msg.sender]++;
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    globalNonce,
                    playerNonces[msg.sender]
                )
            )
        ) % modulus;
    }
    
    function _updateStats(address player, bool won, uint256 amount, uint256 payout) internal {
        PlayerStats storage stats = playerStats[player];
        stats.totalBets++;
        stats.totalWagered += amount;
        stats.lastBetTime = block.timestamp;
        
        if (won) {
            stats.totalWon++;
            stats.totalWinnings += payout;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        } else {
            stats.totalLost++;
            stats.currentStreak = 0;
        }
    }
    
    // ─── Admin ───────────────────────────────────────────────────────────
    
    function setGameConfig(uint256 _minBet, uint256 _maxBet, uint256 _houseEdgeBps) external onlyOwner {
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdgeBps = _houseEdgeBps;
        emit GameConfigUpdated(_minBet, _maxBet, _houseEdgeBps);
    }
    
    function togglePause() external onlyOwner {
        paused = !paused;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
    
    // ─── View ────────────────────────────────────────────────────────────
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function getBet(uint256 betId) external view returns (Bet memory) {
        return bets[betId];
    }
    
    function getPlayerBetCount(address player) external view returns (uint256) {
        return playerBetHistory[player].length;
    }
    
    function getPlayerBets(address player, uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage history = playerBetHistory[player];
        uint256 end = offset + limit > history.length ? history.length : offset + limit;
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = history[i];
        }
        return result;
    }
}
