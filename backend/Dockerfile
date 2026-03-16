# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies for Hardhat compilation)
RUN npm ci

COPY . .
# Compile Hardhat contracts inside the container before running
RUN npx hardhat compile

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
COPY render-start.sh ./

# Ensure boot scripts are executable
RUN chmod +x boot.sh render-start.sh

# Prune dev dependencies to reduce image size (Optional, but Hardhat deploy needs ethers which is in dependencies)
# RUN npm prune --production

EXPOSE 3001

CMD ["./boot.sh"]
