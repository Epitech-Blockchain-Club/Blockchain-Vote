#!/bin/bash
# render-start.sh : Startup script for Render Free Tier (Lightweight)
set -e

echo "🚀 Starting Render Boot Sequence..."

# 1. Start a local Hardhat node in the background
# We use --hostname 0.0.0.0 so the API can reach it internally if needed,
# though here they share the same container.
echo "⛓️ Starting internal Hardhat node..."
npx hardhat node --port 1337 --network hardhat > /app/hardhat_node.log 2>&1 &

# Wait for Hardhat node to be ready
echo "⏳ Waiting for Hardhat node to initialize..."
until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://127.0.0.1:1337 > /dev/null; do
  sleep 2
done
echo "✅ Hardhat node is ready!"

# 2. Deploy contracts to the internal node
echo "📜 Deploying contracts to internal network..."
# We use the localhost network defined in hardhat.config.cjs which points to 127.0.0.1:1337
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost --config hardhat.config.cjs)
echo "$DEPLOY_OUTPUT"

# Extract Factory address
FACTORY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "ScrutinFactory deployed to:" | awk '{print $NF}')
if [ -z "$FACTORY_ADDR" ]; then
    echo "❌ Deployment failed. Check logs."
    exit 1
fi
echo "📍 ScrutinFactory: $FACTORY_ADDR"
export FACTORY_ADDRESS=$FACTORY_ADDR
export RPC_URL="http://127.0.0.1:1337"

# 3. Start the Express API
echo "🌐 Starting Express API on port ${PORT:-3001}..."
exec node api/server.js
