#!/bin/bash
set -e

echo "Starting Render Boot Script (Backend + Local Hardhat Blockchain)"

# Start Hardhat node in background
echo "Starting Hardhat node..."
npx hardhat node --hostname 127.0.0.1 --port 1337 --config hardhat.config.cjs > node.log 2>&1 &
NODE_PID=$!

echo "Waiting for node on port 1337..."
MAX_ATTEMPTS=30
ATTEMPT=0
until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://127.0.0.1:1337 > /dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "Timeout waiting for Hardhat node."
    cat node.log
    kill $NODE_PID || true
    exit 1
  fi
  sleep 1
done
echo "Node is ready."

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
export FACTORY_ADDRESS=$FACTORY_ADDR
export RPC_URL="http://127.0.0.1:1337"

echo "Starting Express API on port ${PORT:-3001}..."
exec node api/server.js
