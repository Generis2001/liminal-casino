#!/bin/bash
set -e

echo "=========================================="
echo "Liminal Casino - Quick Deploy Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f "contracts/.env" ]; then
    echo "❌ Error: contracts/.env not found"
    echo ""
    echo "Please create contracts/.env with:"
    echo "  ARC_TESTNET_RPC_URL=\"https://rpc.testnet.arc.network\""
    echo "  PRIVATE_KEY=\"0xYOUR_PRIVATE_KEY_HERE\""
    echo ""
    exit 1
fi

# Load environment variables
source contracts/.env

echo "✓ Environment loaded"
echo ""

# Build contracts
echo "📦 Building contracts..."
cd contracts
forge build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✓ Build successful"
echo ""

# Deploy contracts
echo "🚀 Deploying contracts to Arc Testnet..."
echo ""
forge script script/Deploy.s.sol \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy the new contract addresses from above"
echo "2. Update frontend/.env.local with new addresses"
echo "3. Fund the new Treasury bankroll"
echo "4. Restart the frontend"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
