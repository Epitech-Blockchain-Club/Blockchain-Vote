import express from 'express';
import { getScrutinContract, getVoteSessionContract } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { ethers } from 'ethers';

const router = express.Router();

// POST /api/votes/cast - Cast a vote
router.post('/cast', async (req, res) => {
    try {
        const { sessionId, voterEmail, optionIndex } = req.body;

        if (!sessionId || !voterEmail || optionIndex === undefined) {
            return res.status(400).json({ success: false, error: "Missing parameters" });
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

        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("Error casting vote:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
