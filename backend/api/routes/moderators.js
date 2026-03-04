import express from 'express';
import { getVoteSessionContract } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { notifyAdminOfDecision } from '../services/email.js';

const router = express.Router();

// POST /api/moderators/validate - Validate or invalidate a session
router.post('/decision', async (req, res) => {
    try {
        const { sessionId, decision, reason } = req.body;

        if (!sessionId || !decision) {
            return res.status(400).json({ success: false, error: "Missing parameters" });
        }

        const sessionContract = getVoteSessionContract(sessionId);

        // In this dev version, the backend wallet acts as the moderator
        // In production, we'd check if the backend wallet is in the moderators list or use EIP-712

        let tx;
        if (decision === 'validate') {
            tx = await sessionContract.validate();
        } else {
            tx = await sessionContract.invalidate(reason || "No reason provided");
        }

        const receipt = await tx.wait();

        res.json({
            success: true,
            decision,
            txHash: receipt.hash
        });

        // Background: Notify admin
        // Find the admin email for the scrutin this session belongs to
        // For now, we'll notify the 'admin@votechain.com' or the creator
        notifyAdminOfDecision('admin@votechain.com', decision, req.body.moderatorEmail || 'Anonyme', 'Session Vote');
    } catch (error) {
        console.error("Error processing moderator decision:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
