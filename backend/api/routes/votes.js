import express from 'express';
import { getVoteSessionContract } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { ethers } from 'ethers';

const router = express.Router();

// POST /api/votes/cast
router.post('/cast', async (req, res) => {
    try {
        const { sessionId, voterEmail, optionIndex, scrutinId } = req.body;

        if (!sessionId || !voterEmail || optionIndex === undefined)
            return res.status(400).json({ success: false, error: 'Missing parameters' });

        if (scrutinId && await storage.hasVoterVoted(voterEmail, scrutinId))
            return res.status(409).json({ success: false, error: 'Voter has already voted in this scrutin' });

        const sessionContract = getVoteSessionContract(sessionId);
        const voterHash = ethers.keccak256(ethers.toUtf8Bytes(voterEmail.toLowerCase()));

        const tx = await sessionContract.castVote(voterHash, optionIndex);
        const receipt = await tx.wait();

        await storage.logVote({ sessionId, voterHash, optionIndex, txHash: receipt.hash });

        if (scrutinId) {
            await storage.markVoterAsVoted(voterEmail, scrutinId, receipt.hash);
        }

        console.log(`[VOTE] Cast for session ${sessionId}, option ${optionIndex} by ${voterHash.substring(0, 10)}...`);
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
