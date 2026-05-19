# Liminal Casino — Decentralized Casino on Arc Testnet

> **the LIMINAL space** — A premium, institutional-grade decentralized casino protocol powered by Arc Testnet.

## Architecture

```
liminal-casino/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/            # Contract source files
│   ├── script/         # Deployment scripts
│   └── test/           # Contract tests
└── frontend/           # Next.js 15 application
    ├── app/            # App Router pages
    ├── components/     # UI components
    ├── lib/            # Chain config, ABIs, utilities
    ├── providers/      # Web3 & Theme providers
    ├── stores/         # Zustand state management
    └── animations/     # Framer Motion configs
```

## Arc Testnet Configuration

| Parameter | Value |
|-----------|-------|
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| WebSocket | `wss://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| USDC Address | `0x3600000000000000000000000000000000000000` |
| Gas Token | USDC |
| Faucet | `https://faucet.circle.com` |

## Smart Contracts

### Prerequisites
- [Foundry](https://getfoundry.sh/) installed

### Deploy to Arc Testnet

```bash
cd contracts

# Copy env and add your private key
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# Load environment
source .env

# Test contracts
forge test -vvv

# Deploy all contracts
forge script script/Deploy.s.sol:DeployLiminal \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Or deploy individually
forge create src/LiminalTreasury.sol:LiminalTreasury \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --constructor-args 0x3600000000000000000000000000000000000000
```

### Contracts
- **LiminalTreasury** — Bankroll management, player deposits/withdrawals
- **LiminalCasino** — Roulette, Blackjack, Slots with provably fair mechanics
- **LiminalPrediction** — YES/NO prediction markets with pool-based settlement
- **LiminalRewards** — Daily rewards, streaks, VIP tiers, referral system

## Frontend

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env and configure
cp .env.example .env.local
# Add deployed contract addresses to .env.local

# Start dev server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
NEXT_PUBLIC_CASINO_ADDRESS=0x...
NEXT_PUBLIC_PREDICTION_ADDRESS=0x...
NEXT_PUBLIC_REWARDS_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Via CLI
npx vercel

# Or connect GitHub repo to Vercel dashboard
# Framework: Next.js
# Root Directory: frontend
# Build Command: npm run build
# Output Directory: .next
```

## Features

- **Wallet Authentication** — MetaMask & Zerion with auto Arc Testnet switching
- **Theme System** — Dark/Light with localStorage persistence and smooth transitions
- **Casino Games** — Roulette, Blackjack, Slots with animated UI
- **Prediction Markets** — YES/NO positions with odds visualization
- **Rewards & VIP** — Daily claims, streaks, referrals, tier progression
- **Treasury Dashboard** — Bankroll health, utilization metrics
- **Transaction History** — Full history with Arc explorer links
- **Admin Panel** — Emergency pause, game config, market creation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, CSS custom properties
- **Animations**: Framer Motion, Canvas particles
- **State**: Zustand, React Query
- **Web3**: Wagmi v2, Viem
- **Contracts**: Solidity 0.8.24, Foundry
- **Network**: Arc Testnet (Chain ID: 5042002)
- **Currency**: USDC (native gas token)

## License

MIT
