// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20.sol";

/// @title LiminalPrediction
/// @notice Decentralized prediction market engine for Liminal Casino
/// @dev Users take YES/NO positions on prediction rounds with USDC stakes
contract LiminalPrediction {
    // ─── Types ───────────────────────────────────────────────────────────
    enum MarketStatus { Open, Locked, Settled, Cancelled }
    enum Position { None, Yes, No }
    
    struct Market {
        uint256 id;
        string description;
        address creator;
        uint256 deadline;
        uint256 settleTime;
        MarketStatus status;
        uint256 yesPool;
        uint256 noPool;
        Position outcome;
        uint256 totalParticipants;
    }
    
    struct UserPosition {
        Position position;
        uint256 amount;
        bool claimed;
    }
    
    // ─── State ───────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    address public owner;
    bool public paused;
    uint256 private _locked = 1;
    
    uint256 public marketCounter;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserPosition)) public positions;
    mapping(address => uint256[]) public userMarkets;
    
    uint256 public platformFeeBps = 200; // 2% platform fee
    uint256 public minStake = 1e6;       // 1 USDC
    
    // ─── Events ──────────────────────────────────────────────────────────
    event MarketCreated(uint256 indexed marketId, string description, uint256 deadline);
    event PositionTaken(uint256 indexed marketId, address indexed user, Position position, uint256 amount);
    event MarketLocked(uint256 indexed marketId);
    event MarketSettled(uint256 indexed marketId, Position outcome);
    event MarketCancelled(uint256 indexed marketId);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    // ─── Errors ──────────────────────────────────────────────────────────
    error NotOwner();
    error ContractPaused();
    error MarketNotOpen();
    error MarketNotSettled();
    error MarketExpired();
    error MarketNotExpired();
    error AlreadyHasPosition();
    error NoPosition();
    error AlreadyClaimed();
    error InvalidOutcome();
    error StakeTooLow();
    error TransferFailed();
    error Reentrancy();
    
    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier whenNotPaused() { if (paused) revert ContractPaused(); _; }
    modifier nonReentrant() { if (_locked == 2) revert Reentrancy(); _locked = 2; _; _locked = 1; }
    
    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }
    
    // ─── Market Management ───────────────────────────────────────────────
    
    /// @notice Create a new prediction market
    function createMarket(string calldata description, uint256 deadline) external onlyOwner whenNotPaused {
        require(deadline > block.timestamp, "Deadline must be in future");
        
        uint256 marketId = marketCounter++;
        markets[marketId] = Market({
            id: marketId,
            description: description,
            creator: msg.sender,
            deadline: deadline,
            settleTime: 0,
            status: MarketStatus.Open,
            yesPool: 0,
            noPool: 0,
            outcome: Position.None,
            totalParticipants: 0
        });
        
        emit MarketCreated(marketId, description, deadline);
    }
    
    /// @notice Take a YES or NO position
    function takePosition(uint256 marketId, Position position, uint256 amount) 
        external whenNotPaused nonReentrant 
    {
        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Open) revert MarketNotOpen();
        if (block.timestamp >= market.deadline) revert MarketExpired();
        if (position == Position.None) revert InvalidOutcome();
        if (amount < minStake) revert StakeTooLow();
        
        UserPosition storage userPos = positions[marketId][msg.sender];
        
        // Allow adding to existing position of same type
        if (userPos.position != Position.None && userPos.position != position) {
            revert AlreadyHasPosition();
        }
        
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        if (userPos.position == Position.None) {
            market.totalParticipants++;
            userMarkets[msg.sender].push(marketId);
        }
        
        userPos.position = position;
        userPos.amount += amount;
        
        if (position == Position.Yes) {
            market.yesPool += amount;
        } else {
            market.noPool += amount;
        }
        
        emit PositionTaken(marketId, msg.sender, position, amount);
    }
    
    /// @notice Lock market after deadline (no more positions)
    function lockMarket(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Open) revert MarketNotOpen();
        market.status = MarketStatus.Locked;
        emit MarketLocked(marketId);
    }
    
    /// @notice Settle market with outcome
    function settleMarket(uint256 marketId, Position outcome) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open || market.status == MarketStatus.Locked, "Cannot settle");
        if (outcome == Position.None) revert InvalidOutcome();
        
        market.status = MarketStatus.Settled;
        market.outcome = outcome;
        market.settleTime = block.timestamp;
        
        emit MarketSettled(marketId, outcome);
    }
    
    /// @notice Claim winnings from a settled market
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        if (market.status != MarketStatus.Settled) revert MarketNotSettled();
        
        UserPosition storage userPos = positions[marketId][msg.sender];
        if (userPos.position == Position.None) revert NoPosition();
        if (userPos.claimed) revert AlreadyClaimed();
        
        userPos.claimed = true;
        
        // Losers get nothing
        if (userPos.position != market.outcome) return;
        
        // Winner payout: proportional share of total pool minus platform fee
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 winningPool = market.outcome == Position.Yes ? market.yesPool : market.noPool;
        
        uint256 platformFee = (totalPool * platformFeeBps) / 10000;
        uint256 distributablePool = totalPool - platformFee;
        
        uint256 payout = (userPos.amount * distributablePool) / winningPool;
        
        bool success = usdc.transfer(msg.sender, payout);
        if (!success) revert TransferFailed();
        
        emit WinningsClaimed(marketId, msg.sender, payout);
    }
    
    /// @notice Cancel market and refund all participants
    function cancelMarket(uint256 marketId) external onlyOwner nonReentrant {
        Market storage market = markets[marketId];
        require(market.status != MarketStatus.Settled, "Already settled");
        market.status = MarketStatus.Cancelled;
        emit MarketCancelled(marketId);
    }
    
    /// @notice Claim refund from cancelled market
    function claimRefund(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Cancelled, "Not cancelled");
        
        UserPosition storage userPos = positions[marketId][msg.sender];
        if (userPos.position == Position.None) revert NoPosition();
        if (userPos.claimed) revert AlreadyClaimed();
        
        userPos.claimed = true;
        bool success = usdc.transfer(msg.sender, userPos.amount);
        if (!success) revert TransferFailed();
    }
    
    // ─── View Functions ──────────────────────────────────────────────────
    
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }
    
    function getUserPosition(uint256 marketId, address user) external view returns (UserPosition memory) {
        return positions[marketId][user];
    }
    
    function getOdds(uint256 marketId) external view returns (uint256 yesOdds, uint256 noOdds) {
        Market storage market = markets[marketId];
        uint256 total = market.yesPool + market.noPool;
        if (total == 0) return (5000, 5000); // 50/50 default
        yesOdds = (market.yesPool * 10000) / total;
        noOdds = (market.noPool * 10000) / total;
    }
    
    function getUserMarkets(address user) external view returns (uint256[] memory) {
        return userMarkets[user];
    }
    
    // ─── Admin ───────────────────────────────────────────────────────────
    
    function setPlatformFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= 1000, "Max 10%");
        platformFeeBps = feeBps;
    }
    
    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }
    
    function togglePause() external onlyOwner {
        paused = !paused;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
    
    /// @notice Withdraw accumulated platform fees
    function withdrawFees(uint256 amount) external onlyOwner nonReentrant {
        bool success = usdc.transfer(owner, amount);
        if (!success) revert TransferFailed();
    }
}
