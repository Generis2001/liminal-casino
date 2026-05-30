// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20.sol";

/// @title LiminalTreasury
/// @notice Core treasury and bankroll management for Liminal Casino on Arc Testnet
/// @dev Uses USDC (Arc native) for all financial operations
contract LiminalTreasury {
    // ─── State ───────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    address public owner;

    mapping(address => bool) public operators;
    mapping(address => uint256) public playerBalances;

    uint256 public totalBankroll;
    uint256 public maxExposurePercent = 10; // Max 10% of bankroll per bet
    bool public paused;

    // Reentrancy guard
    uint256 private _locked = 1;

    // ─── Events ──────────────────────────────────────────────────────────
    event Deposited(address indexed player, uint256 amount);
    event Withdrawn(address indexed player, uint256 amount);
    event BankrollAdded(address indexed from, uint256 amount);
    event BankrollWithdrawn(address indexed to, uint256 amount);
    event PayoutSent(address indexed player, uint256 amount, string gameType);
    event BetReceived(address indexed player, uint256 amount, string gameType);
    event BetLost(address indexed player, uint256 amount, string gameType);
    event OperatorUpdated(address indexed operator, bool status);
    event PauseToggled(bool paused);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    // ─── Errors ──────────────────────────────────────────────────────────
    error NotOwner();
    error NotOperator();
    error ContractPaused();
    error InsufficientBalance();
    error InsufficientBankroll();
    error ExposureTooHigh();
    error ZeroAmount();
    error TransferFailed();
    error Reentrancy();

    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOperator() {
        if (!operators[msg.sender] && msg.sender != owner) revert NotOperator();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 2) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
        operators[msg.sender] = true;
    }

    // ─── Player Functions ────────────────────────────────────────────────

    /// @notice Deposit USDC into player balance
    /// @param amount Amount of USDC to deposit (6 decimals)
    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        playerBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /// @notice Withdraw USDC from player balance
    /// @param amount Amount of USDC to withdraw
    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (playerBalances[msg.sender] < amount) revert InsufficientBalance();
        playerBalances[msg.sender] -= amount;
        bool success = usdc.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    // ─── Operator Functions (Casino contracts) ───────────────────────────

    /// @notice Deduct bet amount from player balance and commit bankroll (called by casino contract)
    function deductBet(address player, uint256 amount, string calldata gameType) external onlyOperator whenNotPaused {
        if (playerBalances[player] < amount) revert InsufficientBalance();
        if (totalBankroll < amount) revert InsufficientBankroll();
        playerBalances[player] -= amount;
        totalBankroll -= amount;
        emit BetReceived(player, amount, gameType);
    }

    /// @notice Return lost bet to bankroll (called by casino contract when player loses)
    function settleLoss(address player, uint256 amount, string calldata gameType) external onlyOperator whenNotPaused {
        totalBankroll += amount;
        emit BetLost(player, amount, gameType);
    }

    /// @notice Send payout to player (called by casino contract)
    function sendPayout(address player, uint256 amount, string calldata gameType) external onlyOperator whenNotPaused nonReentrant {
        playerBalances[player] += amount;
        emit PayoutSent(player, amount, gameType);
    }

    /// @notice Check if a bet amount is within exposure limits
    function isWithinExposure(uint256 potentialPayout) external view returns (bool) {
        if (totalBankroll == 0) return false;
        return (potentialPayout * 100) / totalBankroll <= maxExposurePercent;
    }

    // ─── Admin Functions ─────────────────────────────────────────────────

    /// @notice Add USDC to bankroll (house funding)
    function addBankroll(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        totalBankroll += amount;
        emit BankrollAdded(msg.sender, amount);
    }

    /// @notice Withdraw from bankroll
    function withdrawBankroll(uint256 amount) external onlyOwner nonReentrant {
        if (totalBankroll < amount) revert InsufficientBankroll();
        totalBankroll -= amount;
        bool success = usdc.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        emit BankrollWithdrawn(msg.sender, amount);
    }

    /// @notice Set operator status (casino contracts)
    function setOperator(address operator, bool status) external onlyOwner {
        operators[operator] = status;
        emit OperatorUpdated(operator, status);
    }

    /// @notice Update max exposure percentage
    function setMaxExposure(uint256 percent) external onlyOwner {
        maxExposurePercent = percent;
    }

    /// @notice Emergency pause toggle
    function togglePause() external onlyOwner {
        paused = !paused;
        emit PauseToggled(paused);
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ─── View Functions ──────────────────────────────────────────────────

    function getPlayerBalance(address player) external view returns (uint256) {
        return playerBalances[player];
    }

    function getTreasuryBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
