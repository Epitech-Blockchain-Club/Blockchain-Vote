#!/bin/bash
set -e

# Kill any existing processes
pkill -f "node api/server.js" || true
pkill -f "hardhat node" || true
sleep 2

# Start Hardhat node in background
echo "Starting Hardhat node..."
# Explicitly target hardhat.config.cjs because the project is in ESM mode
npx hardhat node --hostname 127.0.0.1 --port 1337 --config hardhat.config.cjs > node.log 2>&1 &
NODE_PID=$!

# Wait for node to be ready (with timeout)
echo "Waiting for node on port 1337..."
MAX_ATTEMPTS=30
ATTEMPT=0
until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://127.0.0.1:1337 > /dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "Timeout waiting for Hardhat node."
    echo "Check node.log for errors:"
    cat node.log
    kill $NODE_PID || true
    exit 1
  fi
  sleep 1
done
echo "Node is ready."

# Deploy
echo "Deploying contracts..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost --config hardhat.config.cjs)
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
