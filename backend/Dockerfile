# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies for Hardhat compilation)
RUN npm ci

COPY . .
# Use pre-compiled artifacts (avoids downloading Solidity compiler in restricted networks)
# To recompile locally: npx hardhat compile
RUN if [ ! -d "artifacts/contracts" ]; then npx hardhat compile; fi

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app
# Install curl for the boot script readiness checks
RUN apk add --no-cache curl bash

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/cache ./cache
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/api ./api
COPY --from=builder /app/hardhat.config.cjs ./
COPY boot.sh ./

# Ensure boot script has LF line endings and is executable (guards against Windows CRLF)
RUN sed -i 's/\r//' boot.sh && chmod +x boot.sh

# Prune dev dependencies to reduce image size (Optional, but Hardhat deploy needs ethers which is in dependencies)
# RUN npm prune --production

EXPOSE 3001

CMD ["./boot.sh"]
