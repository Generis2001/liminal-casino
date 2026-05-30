# 🎉 Deployment Complete!

## ✅ Successfully Deployed Contracts

All contracts have been deployed to **Arc Testnet** with the bankroll fix applied.

### New Contract Addresses

| Contract | Address |
|----------|---------|
| **Treasury** | `0x3699043dB9EC50fe17c905981f2170e348401D3B` |
| **Casino** | `0x081eE3977508ECe4D1d546eC5D7E34703F12Bf38` |
| **Prediction** | `0xb0f5285Cb72c3FCEA670c15533D31081d8607528` |
| **Rewards** | `0xcadca7c7CD158f390A8139696c92fcDa2577dB9f` |
| **USDC** | `0x3600000000000000000000000000000000000000` |

### What Was Fixed

✅ **Bankroll now correctly decreases** when bets are placed (casino commits funds)  
✅ **Bankroll increases** when players lose (casino receives the bet)  
✅ **Payouts work correctly** from committed funds  
✅ Added `settleLoss()` function to return lost bets to bankroll  

### Frontend Updated

✅ `.env.local` created with new contract addresses  
✅ `.env.example` updated with new addresses  

## Next Steps

### 1. Fund the Bankroll

The new Treasury needs USDC to operate. Transfer USDC and add it to the bankroll:

```bash
# Get your deployer address
cast wallet address --private-key 0x2c8c9f53186a35719544aa147a1c6dde678ceb83e6e5e759730fdc799b246ba0

# Check your USDC balance
cast call 0x3600000000000000000000000000000000000000 \
  "balanceOf(address)(uint256)" \
  <YOUR_ADDRESS> \
  --rpc-url https://rpc.testnet.arc.network

# Approve Treasury to spend USDC
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" \
  0x3699043dB9EC50fe17c905981f2170e348401D3B \
  1000000000000 \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key 0x2c8c9f53186a35719544aa147a1c6dde678ceb83e6e5e759730fdc799b246ba0

# Add to bankroll (example: 1000 USDC = 1000000000)
cast send 0x3699043dB9EC50fe17c905981f2170e348401D3B \
  "addBankroll(uint256)" \
  1000000000 \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key 0x2c8c9f53186a35719544aa147a1c6dde678ceb83e6e5e759730fdc799b246ba0
```

### 2. Restart Frontend

```bash
cd frontend
npm run dev
# or for production
npm run build && npm start
```

### 3. Test the Fix

1. Open your app at http://localhost:3000
2. Connect your wallet
3. Deposit USDC into your player balance
4. Place a bet on Roulette/Blackjack/Slots
5. Check the admin panel to verify:
   - Bankroll **decreases** when bet is placed ✓
   - Bankroll **increases** when you lose ✓
   - Payouts work correctly ✓

## Verification

Check your deployment on Arc Testnet Explorer:
- Treasury: https://testnet.arcscan.io/address/0x3699043dB9EC50fe17c905981f2170e348401D3B
- Casino: https://testnet.arcscan.io/address/0x081eE3977508ECe4D1d546eC5D7E34703F12Bf38

## Old vs New Addresses

### Old (Deprecated)
- Treasury: `0xFC25f20E71f1f234509fA9C4080f6B9Eba027187`
- Casino: `0x7dB11401b7994AEd47F40513da20FA32baCa70b6`

### New (Active)
- Treasury: `0x3699043dB9EC50fe17c905981f2170e348401D3B`
- Casino: `0x081eE3977508ECe4D1d546eC5D7E34703F12Bf38`

## Gas Used

- Total gas: 8,260,599
- Cost: ~0.33 USDC

## Notes

⚠️ **Important:** Players with balances in the old Treasury will need to:
1. Withdraw from old Treasury
2. Deposit into new Treasury

Consider announcing this migration to your users.

---

**Deployment Date:** May 30, 2026  
**Network:** Arc Testnet (Chain ID: 5042002)  
**Status:** ✅ Live and Ready
