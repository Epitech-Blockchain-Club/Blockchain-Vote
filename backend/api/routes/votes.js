import express from 'express';
import { getScrutinContract, getVoteSessionContract } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { ethers } from 'ethers';

const router = express.Router();

// POST /api/votes/cast - Cast a vote
router.post('/cast', async (req, res) => {
    try {
        const { sessionId, voterEmail, optionIndex, scrutinId } = req.body;

        if (!sessionId || !voterEmail || optionIndex === undefined) {
            return res.status(400).json({ success: false, error: "Missing parameters" });
        }

        // If scrutinId is provided, check for double voting
        if (scrutinId) {
            const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);
            if (hasVoted) {
                return res.status(409).json({
                    success: false,
                    error: "Voter has already voted in this scrutin"
                });
            }
        }

        const sessionContract = getVoteSessionContract(sessionId);

        // Hash the email for privacy and to prevent double voting on-chain
        const voterHash = ethers.keccak256(ethers.toUtf8Bytes(voterEmail.toLowerCase()));

        // Call contract (backend/relayer signs)
        const tx = await sessionContract.castVote(voterHash, optionIndex);
        const receipt = await tx.wait();

        storage.logVote({
            sessionId,
            voterHash,
            optionIndex,
            txHash: receipt.hash
        });

        // Mark voter as voted if scrutinId is provided
        if (scrutinId) {
            storage.markVoterAsVoted(voterEmail, scrutinId, receipt.hash);
        }

        console.log(`[VOTE] Vote cast for session ${sessionId}, option ${optionIndex} by ${voterHash.substring(0, 10)}...`);

        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("Error casting vote:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
