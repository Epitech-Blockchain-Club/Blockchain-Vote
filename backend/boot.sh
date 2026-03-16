#!/bin/bash
set -e

echo "Starting Backend Boot Script..."

# 1. Wait for MongoDB
echo "Waiting for MongoDB ($MONGO_URI)..."
MAX_ATTEMPTS=30
ATTEMPT=0
# Since we might not have a full mongo client, we check the port TCP connection using nc or wait for the API to retry.
# Better: wait for Besu which is slower
echo "Skipping strict Mongo wait, Mongoose will handle reconnection retries."

# 2. Wait for Besu Blockchain RPC
echo "Waiting for Besu RPC at $RPC_URL..."
MAX_ATTEMPTS=60
ATTEMPT=0
until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' "$RPC_URL" > /dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "Timeout waiting for Besu node at $RPC_URL"
    exit 1
  fi
  echo "Besu not ready yet... waiting 2s"
  sleep 2
done
echo "Besu Node is ready!"

# 3. Deploy Factory Contract if FACTORY_ADDRESS is not provided
if [ -z "$FACTORY_ADDRESS" ]; then
  echo "FACTORY_ADDRESS is block. Deploying ScrutinFactory..."
  DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network besu --config hardhat.config.cjs)
  echo "$DEPLOY_OUTPUT"
  FACTORY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "ScrutinFactory deployed to:" | awk '{print $NF}')
  
  if [ -z "$FACTORY_ADDR" ]; then
    echo "Failed to extract Factory address from deployment output."
    exit 1
  fi
  echo "Extracted Factory Address: $FACTORY_ADDR"
  # Export it so the Node.js API can read it
  export FACTORY_ADDRESS=$FACTORY_ADDR
else
  echo "Using existing FACTORY_ADDRESS: $FACTORY_ADDRESS"
fi

# 4. Start the Express API
echo "Starting Express API on port ${PORT:-3001}..."
exec node api/server.js
