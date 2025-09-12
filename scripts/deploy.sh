#!/bin/bash

# KW Vault Deployment Script
# Usage: ./scripts/deploy.sh [testnet|mainnet]

set -e

NETWORK=${1:-testnet}
echo "🚀 Deploying KW Vault to $NETWORK..."

# Check environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    exit 1
fi

if [ -z "$KAIA_RPC_URL" ]; then
    echo "❌ Error: KAIA_RPC_URL environment variable not set"
    exit 1
fi

# Deploy smart contracts
echo "📝 Deploying smart contracts..."
cd contracts
npm run compile
npx hardhat run scripts/deploy.js --network kaia-$NETWORK
cd ..

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Start AI backend
echo "🤖 Starting AI backend..."
cd scripts
python ai_yield_predictor.py --train
python ai_api_server.py &
AI_PID=$!
cd ..

# Setup database indexes
echo "🗄️ Setting up database..."
node scripts/setup-db.js

echo "✅ Deployment complete!"
echo "📊 Frontend: http://localhost:3000"
echo "🤖 AI API: http://localhost:5000"
echo "🔗 Contracts deployed to Kaia $NETWORK"

# Keep AI server running
wait $AI_PID
