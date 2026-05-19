// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20.sol";

/// @title LiminalRewards
/// @notice Reward distribution, VIP tiers, referrals, streaks, and jackpots
contract LiminalRewards {
    // ─── Types ───────────────────────────────────────────────────────────
    enum VIPTier { Bronze, Silver, Gold, Diamond, Platinum }
    
    struct PlayerRewards {
        uint256 xp;
        VIPTier tier;
        uint256 dailyStreak;
        uint256 lastClaimDay;
        uint256 totalClaimed;
        address referrer;
        uint256 referralEarnings;
        uint256 referralCount;
    }
    
    // ─── State ───────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    address public owner;
    bool public paused;
    uint256 private _locked = 1;
    
    mapping(address => PlayerRewards) public rewards;
    mapping(bytes32 => address) public referralCodes;
    mapping(address => bytes32) public playerReferralCode;
    
    // VIP thresholds (XP required)
    uint256[5] public vipThresholds = [0, 1000, 5000, 25000, 100000];
    
    // Reward amounts (USDC, 6 decimals)
    uint256 public dailyReward = 1e6;          // 1 USDC
    uint256 public streakBonus = 500000;        // 0.5 USDC per streak day (capped)
    uint256 public referralCommissionBps = 500; // 5% of referee's bets
    uint256 public maxStreakBonus = 7;          // Max 7-day streak bonus
    
    // Jackpot
    uint256 public jackpotPool;
    uint256 public jackpotContributionBps = 100; // 1% of bets go to jackpot
    
    // Reward pool
    uint256 public rewardPool;
    
    // ─── Events ──────────────────────────────────────────────────────────
    event DailyRewardClaimed(address indexed player, uint256 amount, uint256 streak);
    event XPEarned(address indexed player, uint256 amount, uint256 totalXP);
    event VIPTierUpgraded(address indexed player, VIPTier newTier);
    event ReferralRegistered(address indexed player, bytes32 code);
    event ReferralUsed(address indexed referee, address indexed referrer);
    event ReferralEarningsPaid(address indexed referrer, uint256 amount);
    event JackpotWon(address indexed player, uint256 amount);
    event JackpotContribution(uint256 amount);
    event RewardPoolFunded(uint256 amount);
    
    // ─── Errors ──────────────────────────────────────────────────────────
    error NotOwner();
    error ContractPaused();
    error AlreadyClaimedToday();
    error AlreadyHasReferrer();
    error InvalidReferralCode();
    error CodeAlreadyExists();
    error InsufficientRewardPool();
    error TransferFailed();
    error Reentrancy();
    error SelfReferral();
    
    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier whenNotPaused() { if (paused) revert ContractPaused(); _; }
    modifier nonReentrant() { if (_locked == 2) revert Reentrancy(); _locked = 2; _; _locked = 1; }
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }
    
    // ─── Daily Rewards ───────────────────────────────────────────────────
    
    /// @notice Claim daily reward
    function claimDailyReward() external whenNotPaused nonReentrant {
        PlayerRewards storage pr = rewards[msg.sender];
        uint256 today = block.timestamp / 1 days;
        
        if (pr.lastClaimDay == today) revert AlreadyClaimedToday();
        
        // Update streak
        if (pr.lastClaimDay == today - 1) {
            pr.dailyStreak++;
        } else {
            pr.dailyStreak = 1;
        }
        pr.lastClaimDay = today;
        
        // Calculate reward with streak bonus
        uint256 streakDays = pr.dailyStreak > maxStreakBonus ? maxStreakBonus : pr.dailyStreak;
        uint256 reward = dailyReward + (streakBonus * streakDays);
        
        // VIP multiplier
        uint256 multiplier = 100 + (uint256(pr.tier) * 25); // Bronze=100%, Plat=200%
        reward = (reward * multiplier) / 100;
        
        if (rewardPool < reward) revert InsufficientRewardPool();
        rewardPool -= reward;
        
        bool success = usdc.transfer(msg.sender, reward);
        if (!success) revert TransferFailed();
        
        pr.totalClaimed += reward;
        
        // Earn XP for claiming
        _addXP(msg.sender, 10);
        
        emit DailyRewardClaimed(msg.sender, reward, pr.dailyStreak);
    }
    
    // ─── XP & VIP ────────────────────────────────────────────────────────
    
    /// @notice Add XP to player (called by casino contracts or internally)
    function addXP(address player, uint256 amount) external onlyOwner {
        _addXP(player, amount);
    }
    
    function _addXP(address player, uint256 amount) internal {
        PlayerRewards storage pr = rewards[player];
        pr.xp += amount;
        emit XPEarned(player, amount, pr.xp);
        
        // Check for tier upgrade
        VIPTier newTier = _calculateTier(pr.xp);
        if (newTier > pr.tier) {
            pr.tier = newTier;
            emit VIPTierUpgraded(player, newTier);
        }
    }
    
    function _calculateTier(uint256 xp) internal view returns (VIPTier) {
        if (xp >= vipThresholds[4]) return VIPTier.Platinum;
        if (xp >= vipThresholds[3]) return VIPTier.Diamond;
        if (xp >= vipThresholds[2]) return VIPTier.Gold;
        if (xp >= vipThresholds[1]) return VIPTier.Silver;
        return VIPTier.Bronze;
    }
    
    // ─── Referrals ───────────────────────────────────────────────────────
    
    /// @notice Generate a referral code
    function generateReferralCode(bytes32 code) external whenNotPaused {
        if (referralCodes[code] != address(0)) revert CodeAlreadyExists();
        referralCodes[code] = msg.sender;
        playerReferralCode[msg.sender] = code;
        emit ReferralRegistered(msg.sender, code);
    }
    
    /// @notice Use a referral code
    function useReferralCode(bytes32 code) external whenNotPaused {
        PlayerRewards storage pr = rewards[msg.sender];
        if (pr.referrer != address(0)) revert AlreadyHasReferrer();
        
        address referrer = referralCodes[code];
        if (referrer == address(0)) revert InvalidReferralCode();
        if (referrer == msg.sender) revert SelfReferral();
        
        pr.referrer = referrer;
        rewards[referrer].referralCount++;
        
        emit ReferralUsed(msg.sender, referrer);
    }
    
    /// @notice Pay referral commission (called when player bets)
    function payReferralCommission(address player, uint256 betAmount) external onlyOwner nonReentrant {
        PlayerRewards storage pr = rewards[player];
        if (pr.referrer == address(0)) return;
        
        uint256 commission = (betAmount * referralCommissionBps) / 10000;
        if (rewardPool < commission) return; // Silently skip if pool empty
        
        rewardPool -= commission;
        rewards[pr.referrer].referralEarnings += commission;
        
        bool success = usdc.transfer(pr.referrer, commission);
        if (!success) revert TransferFailed();
        
        emit ReferralEarningsPaid(pr.referrer, commission);
    }
    
    // ─── Jackpot ─────────────────────────────────────────────────────────
    
    /// @notice Contribute to jackpot pool
    function contributeToJackpot(uint256 amount) external onlyOwner {
        jackpotPool += amount;
        emit JackpotContribution(amount);
    }
    
    /// @notice Award jackpot to winner
    function awardJackpot(address winner) external onlyOwner nonReentrant {
        uint256 amount = jackpotPool;
        jackpotPool = 0;
        
        bool success = usdc.transfer(winner, amount);
        if (!success) revert TransferFailed();
        
        emit JackpotWon(winner, amount);
    }
    
    // ─── Admin ───────────────────────────────────────────────────────────
    
    /// @notice Fund the reward pool
    function fundRewardPool(uint256 amount) external onlyOwner nonReentrant {
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }
    
    function setDailyReward(uint256 amount) external onlyOwner { dailyReward = amount; }
    function setStreakBonus(uint256 amount) external onlyOwner { streakBonus = amount; }
    function setReferralCommission(uint256 bps) external onlyOwner { referralCommissionBps = bps; }
    function togglePause() external onlyOwner { paused = !paused; }
    function transferOwnership(address newOwner) external onlyOwner { owner = newOwner; }
    
    // ─── View ────────────────────────────────────────────────────────────
    
    function getPlayerRewards(address player) external view returns (PlayerRewards memory) {
        return rewards[player];
    }
    
    function getVIPTier(address player) external view returns (VIPTier) {
        return rewards[player].tier;
    }
    
    function canClaimDaily(address player) external view returns (bool) {
        return rewards[player].lastClaimDay != block.timestamp / 1 days;
    }
}
