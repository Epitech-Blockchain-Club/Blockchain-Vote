# Blockchain-Vote Backend

This is the blockchain backend for the Blockchain-Vote application. It manages smart contracts for election management and provides a REST API for the frontend.

## Tech Stack
- **Smart Contracts**: Solidity 0.8.20 (Hardhat)
- **API**: Express.js (Node.js)
- **Blockchain Library**: Ethers.js v6
- **Storage**: In-memory (for dev) / MongoDB (optional)

## Architecture
- **ScrutinFactory**: Deploys individual `Scrutin` contracts.
- **Scrutin**: Manages election metadata and `VoteSession` deployments.
- **VoteSession**: Handles vote casting (hashed identifiers) and moderator validation.

## Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and fill in the values.

3. **Start the local blockchain and API**:
   ```bash
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

4. **Run tests**:
   ```bash
   npx hardhat test
   ```

## API Endpoints
- `POST /api/scrutins`: Create a new election.
- `GET /api/scrutins`: List all elections.
- `POST /api/votes/cast`: Cast a vote.
- `POST /api/moderators/decision`: Moderator validation/invalidation.
