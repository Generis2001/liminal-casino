// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LiminalTreasury.sol";
import "../src/LiminalCasino.sol";
import "../src/LiminalPrediction.sol";
import "../src/LiminalRewards.sol";

/// @title Deploy Liminal Casino to Arc Testnet
/// @notice Deploys all contracts and configures operator permissions
contract DeployLiminal is Script {
    // Arc Testnet USDC address (system precompile)
    address constant ARC_USDC = 0x3600000000000000000000000000000000000000;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Treasury
        LiminalTreasury treasury = new LiminalTreasury(ARC_USDC);
        console.log("Treasury deployed at:", address(treasury));
        
        // 2. Deploy Casino
        LiminalCasino casino = new LiminalCasino(address(treasury));
        console.log("Casino deployed at:", address(casino));
        
        // 3. Deploy Prediction Market
        LiminalPrediction prediction = new LiminalPrediction(ARC_USDC);
        console.log("Prediction deployed at:", address(prediction));
        
        // 4. Deploy Rewards
        LiminalRewards rewards = new LiminalRewards(ARC_USDC);
        console.log("Rewards deployed at:", address(rewards));
        
        // 5. Configure: Set Casino as operator on Treasury
        treasury.setOperator(address(casino), true);
        console.log("Casino set as Treasury operator");
        
        vm.stopBroadcast();
        
        // Output summary
        console.log("========================================");
        console.log("Liminal Casino - Arc Testnet Deployment");
        console.log("========================================");
        console.log("Network: Arc Testnet (Chain ID: 5042002)");
        console.log("USDC:", ARC_USDC);
        console.log("Treasury:", address(treasury));
        console.log("Casino:", address(casino));
        console.log("Prediction:", address(prediction));
        console.log("Rewards:", address(rewards));
        console.log("========================================");
    }
}
