#!/bin/bash
set -e

# Kill any existing processes
pkill -f "node api/server.js" || true
pkill -f "hardhat node" || true
sleep 2

# Start Hardhat node in background
echo "Starting Hardhat node..."
npx hardhat node --hostname 127.0.0.1 --port 1337 > node.log 2>&1 &
NODE_PID=$!

# Wait for node to be ready
echo "Waiting for node..."
until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://127.0.0.1:1337 > /dev/null; do
  sleep 1
done
echo "Node is ready."

# Deploy
echo "Deploying contracts..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost)
echo "$DEPLOY_OUTPUT"
FACTORY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "ScrutinFactory deployed to:" | awk '{print $NF}')

if [ -z "$FACTORY_ADDR" ]; then
  echo "Failed to get Factory address"
  kill $NODE_PID
  exit 1
fi

echo "Factory Address: $FACTORY_ADDR"

# Update .env
sed -i "s/^FACTORY_ADDRESS=.*/FACTORY_ADDRESS=$FACTORY_ADDR/" .env
sed -i "s/^RPC_URL=.*/RPC_URL=http:\/\/127.0.0.1:1337/" .env

# Start API
echo "Starting API server..."
node api/server.js > api.log 2>&1 &
API_PID=$!

echo "Backend started successfully."
echo "Streaming logs (Ctrl+C to stop, server will keep running in background)..."
tail -f api.log --pid=$API_PID
