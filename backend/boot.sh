#!/bin/bash
set -e

echo "Starting Backend Boot Script..."

DATA_DIR=${DATA_DIR:-/app/data}
export DATA_DIR
FACTORY_FILE="$DATA_DIR/factory.address"

# Ensure data directory exists (in case the volume isn't mounted yet)
mkdir -p "$DATA_DIR"

# 1. Wait for MongoDB
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

# 3. Resolve FACTORY_ADDRESS — priority: ENV var > persisted file > fresh deploy
if [ -z "$FACTORY_ADDRESS" ] && [ -f "$FACTORY_FILE" ]; then
  FACTORY_ADDRESS=$(cat "$FACTORY_FILE")
  echo "Loaded FACTORY_ADDRESS from persisted file: $FACTORY_ADDRESS"
  export FACTORY_ADDRESS
fi

# 3b. Validate that the factory contract actually exists on-chain
#     (protects against blockchain reset while factory.address file persists)
if [ -n "$FACTORY_ADDRESS" ]; then
  echo "Validating factory contract at $FACTORY_ADDRESS on-chain..."
  CODE=$(curl -s -X POST -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$FACTORY_ADDRESS\",\"latest\"],\"id\":1}" \
    "$RPC_URL" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

  if [ "$CODE" = "0x" ] || [ -z "$CODE" ]; then
    echo "WARNING: Factory contract not found on-chain (blockchain may have been reset)."
    echo "Clearing stale factory address and re-deploying..."
    rm -f "$FACTORY_FILE"
    FACTORY_ADDRESS=""
  else
    echo "Factory contract validated on-chain."
  fi
fi

if [ -z "$FACTORY_ADDRESS" ]; then
  echo "No FACTORY_ADDRESS found. Deploying ScrutinFactory..."
  DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network besu --config hardhat.config.cjs)
  echo "$DEPLOY_OUTPUT"
  FACTORY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "ScrutinFactory deployed to:" | awk '{print $NF}')

  if [ -z "$FACTORY_ADDR" ]; then
    echo "Failed to extract Factory address from deployment output."
    exit 1
  fi

  echo "Extracted Factory Address: $FACTORY_ADDR"
  echo "$FACTORY_ADDR" > "$FACTORY_FILE"
  echo "Factory address saved to $FACTORY_FILE"
  export FACTORY_ADDRESS=$FACTORY_ADDR
else
  echo "Using existing FACTORY_ADDRESS: $FACTORY_ADDRESS"
fi

# 4. Start the Express API
echo "Starting Express API on port ${PORT:-3001}..."
exec node api/server.js
