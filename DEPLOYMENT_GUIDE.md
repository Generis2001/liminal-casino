# Liminal Casino - Bankroll Fix Deployment Guide

## What Was Fixed
The bankroll deduction logic has been corrected in `LiminalTreasury.sol` and `LiminalCasino.sol`. The casino bankroll now properly:
- **Decreases** when bets are placed (casino commits funds)
- **Increases** when players lose (casino receives the bet)
- Correctly handles payouts from committed funds

## Current Deployed Addresses (OLD - Need Replacement)
- Treasury: `0xFC25f20E71f1f234509fA9C4080f6B9Eba027187`
- Casino: `0x7dB11401b7994AEd47F40513da20FA32baCa70b6`
- Prediction: `0x196B618c6a31A5100b5F9774089E3f6913B9aa55` (no changes needed)
- Rewards: `0x3eF17D9Cd787030Eb68Eb6b2FC6D7F298B9B136F` (no changes needed)

## Deployment Steps

### 1. Set Up Environment Variables

Create `contracts/.env` file:
```bash
cd contracts
cat > .env << 'EOF'
ARC_TESTNET_RPC_URL="https://rpc.testnet.arc.network"
PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
EOF
```

**⚠️ IMPORTANT:** Replace `YOUR_PRIVATE_KEY_HERE` with your actual private key (the account that will own the contracts).

### 2. Deploy Updated Contracts

Run the deployment script:
```bash
forge script script/Deploy.s.sol \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

This will deploy:
- ✅ New LiminalTreasury (with fixed bankroll logic)
- ✅ New LiminalCasino (with settleLoss calls)
- ✅ New LiminalPrediction (unchanged, but redeployed for consistency)
- ✅ New LiminalRewards (unchanged, but redeployed for consistency)

### 3. Save New Addresses

After deployment, the script will output the new contract addresses. Save them:
```
Treasury: 0x...
Casino: 0x...
Prediction: 0x...
Rewards: 0x...
```

### 4. Fund the New Bankroll

Transfer USDC to the new Treasury contract to fund the bankroll:
```bash
# Using cast (Foundry)
cast send 0x3600000000000000000000000000000000000000 \
  "transfer(address,uint256)" \
  <NEW_TREASURY_ADDRESS> \
  <AMOUNT_IN_USDC_UNITS> \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY

# Then add it to bankroll
cast send <NEW_TREASURY_ADDRESS> \
  "addBankroll(uint256)" \
  <AMOUNT_IN_USDC_UNITS> \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 5. Update Frontend Environment Variables

Update `frontend/.env.local` (or `.env`) with the new addresses:
```bash
cd ../frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_TREASURY_ADDRESS=<NEW_TREASURY_ADDRESS>
NEXT_PUBLIC_CASINO_ADDRESS=<NEW_CASINO_ADDRESS>
NEXT_PUBLIC_PREDICTION_ADDRESS=<NEW_PREDICTION_ADDRESS>
NEXT_PUBLIC_REWARDS_ADDRESS=<NEW_REWARDS_ADDRESS>
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
EOF
```

### 6. Restart Frontend

```bash
npm run dev
# or if deployed
npm run build && npm start
```

### 7. Test the Fix

1. **Deposit USDC** into your player balance
2. **Place a bet** on Roulette/Blackjack/Slots
3. **Check the bankroll** in the admin panel:
   - Should **decrease** when bet is placed
   - Should **increase** when you lose
   - Should stay the same when you win (payout from committed funds)

## Verification Checklist

- [ ] Contracts compiled successfully
- [ ] Deployment transaction confirmed on Arc Testnet
- [ ] New contract addresses saved
- [ ] Bankroll funded with USDC
- [ ] Frontend environment variables updated
- [ ] Frontend restarted
- [ ] Test bet placed successfully
- [ ] Bankroll decreases on bet placement ✓
- [ ] Bankroll increases on player loss ✓
- [ ] Payouts work correctly ✓

## Rollback Plan

If issues occur, you can:
1. Update frontend `.env.local` back to old addresses
2. Restart frontend
3. Old contracts will still be functional (with the old bankroll logic)

## Notes

- The old contracts will remain on-chain but won't be used
- Players with balances in the old Treasury will need to withdraw and re-deposit
- Consider announcing the migration to users
- Monitor the new bankroll balance closely for the first few hours

## Support

If you encounter issues:
1. Check transaction logs on Arc Testnet explorer
2. Verify contract addresses are correct in frontend
3. Ensure USDC approvals are set correctly
4. Check that Casino is set as operator on Treasury (done automatically in deploy script)
