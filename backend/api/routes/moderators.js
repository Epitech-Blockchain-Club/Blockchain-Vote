import express from 'express';
import { getVoteSessionContract, getNextNonce } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { notifyAdminOfDecision } from '../services/email.js';

const router = express.Router();

// POST /api/moderators/decision - Validate or invalidate a session
router.post('/decision', async (req, res) => {
    try {
        const { sessionId, decision, reason, token } = req.body;

        if (!sessionId || !decision || !token) {
            return res.status(400).json({ success: false, error: "Paramètres manquants (Session, Décision ou Token)" });
        }

        // 1. Verify token and identify moderator
        const tokenData = storage.getModeratorToken(token);
        if (!tokenData) {
            return res.status(401).json({ success: false, error: "Lien d'invitation invalide ou expiré" });
        }

        const moderatorEmail = tokenData.email;

        // 2. Verify session-specific permission
        const sessionMetadata = storage.getSessionMetadata(sessionId);
        if (!sessionMetadata) {
            return res.status(404).json({ success: false, error: "Session introuvable" });
        }

        // Moderators can be stored as raw email strings OR as objects with .email property
        const modEmails = (sessionMetadata.moderators || []).map(m =>
            (typeof m === 'string' ? m : m?.email || '').toLowerCase()
        );
        if (!modEmails.includes(moderatorEmail.toLowerCase())) {
            return res.status(403).json({ success: false, error: "Vous n'êtes pas autorisé à modérer cette session." });
        }

        // 3. Prevent double decisions
        if (storage.hasModeratorDecided(moderatorEmail, sessionId)) {
            return res.status(400).json({ success: false, error: "Vous avez déjà soumis votre décision pour cette session." });
        }

        const sessionContract = getVoteSessionContract(sessionId);
        let tx;
        if (decision === 'validate') {
            // Check for 100% consensus
            const allDecisions = storage.getSessionDecisions(sessionId);
            const otherValidations = allDecisions.filter(d => d.email.toLowerCase() !== moderatorEmail.toLowerCase() && d.decision === 'validate').length;
            const totalRequired = sessionMetadata.moderators?.length || 0;

            if (otherValidations + 1 >= totalRequired) {
                console.log(`[CONSENSUS] 100% reached for session ${sessionId}. Validating on-chain...`);
                tx = await sessionContract.validate({ nonce: await getNextNonce() });
            } else {
                console.log(`[CONSENSUS] ${otherValidations + 1}/${totalRequired} validations for session ${sessionId}. Saving locally.`);
            }
        } else {
            // Immediate invalidation
            console.log(`[CONSENSUS] Moderator ${moderatorEmail} invalidated session ${sessionId}. Invalidating on-chain...`);
            tx = await sessionContract.invalidate(reason || "Aucune raison fournie", { nonce: await getNextNonce() });
        }

        if (tx) {
            const receipt = await tx.wait();
            res.json({
                success: true,
                decision,
                txHash: receipt.hash,
                onChain: true
            });
        } else {
            res.json({
                success: true,
                decision,
                onChain: false
            });
        }

        // 3. Mark as decided and INVALIDATE token (one-time use)
        storage.saveModeratorDecision(moderatorEmail, sessionId, decision, reason);
        storage.deleteModeratorToken(token);

        // Background: Notify admin
        notifyAdminOfDecision('admin@votechain.com', decision, moderatorEmail, 'Session Vote');
    } catch (error) {
        console.error("Error processing moderator decision:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/moderators/batch-decision - Handle multiple decisions at once
router.post('/batch-decision', async (req, res) => {
    try {
        const { decisions: batchDecisions, token } = req.body;

        if (!batchDecisions || !Array.isArray(batchDecisions) || !token) {
            return res.status(400).json({ success: false, error: "Paramètres manquants (Decisions ou Token)" });
        }

        // 1. Verify token once
        const tokenData = storage.getModeratorToken(token);
        if (!tokenData) {
            return res.status(401).json({ success: false, error: "Lien d'invitation invalide ou expiré" });
        }

        const moderatorEmail = tokenData.email;
        const results = [];

        // 2. Process all decisions
        for (const item of batchDecisions) {
            const { sessionId, decision, reason } = item;

            try {
                // Verify session-specific permission
                const sessionMetadata = storage.getSessionMetadata(sessionId);
                if (!sessionMetadata) {
                    results.push({ sessionId, success: false, error: "Session introuvable" });
                    continue;
                }

                // Moderators can be stored as raw email strings OR as objects with .email property
                const modEmails = (sessionMetadata.moderators || []).map(m =>
                    (typeof m === 'string' ? m : m?.email || '').toLowerCase()
                );
                if (!modEmails.includes(moderatorEmail.toLowerCase())) {
                    results.push({ sessionId, success: false, error: `Non autorisé pour cette session (${moderatorEmail} non trouvé parmi ${modEmails.join(', ')})` });
                    continue;
                }

                // Skip if already decided
                if (storage.hasModeratorDecided(moderatorEmail, sessionId)) {
                    results.push({ sessionId, success: true, warning: "Déjà décidé" });
                    continue;
                }

                const sessionContract = getVoteSessionContract(sessionId);
                let tx;
                if (decision === 'validate') {
                    // Check for 100% consensus
                    const allDecisions = storage.getSessionDecisions(sessionId);
                    const otherValidations = allDecisions.filter(d => d.email.toLowerCase() !== moderatorEmail.toLowerCase() && d.decision === 'validate').length;
                    const totalRequired = sessionMetadata.moderators?.length || 0;

                    if (otherValidations + 1 >= totalRequired) {
                        tx = await sessionContract.validate({ nonce: await getNextNonce() });
                    }
                } else {
                    tx = await sessionContract.invalidate(reason || "Aucune raison fournie", { nonce: await getNextNonce() });
                }

                if (tx) {
                    const receipt = await tx.wait();
                    results.push({ sessionId, success: true, txHash: receipt.hash, onChain: true });
                } else {
                    results.push({ sessionId, success: true, onChain: false });
                }

                storage.saveModeratorDecision(moderatorEmail, sessionId, decision, reason);

                // Notify admin for each
                notifyAdminOfDecision('admin@votechain.com', decision, moderatorEmail, `Session: ${sessionId}`);
            } catch (err) {
                console.error(`Error in batch for session ${sessionId}:`, err);
                results.push({ sessionId, success: false, error: err.message });
            }
        }

        // 3. Delete token after successful batch processing (or attempt)
        storage.deleteModeratorToken(token);

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error("Error processing batch moderator decision:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/moderators/notifications
router.get('/notifications', (req, res) => {
    try {
        const recent = storage.getRecentDecisions(20);
        res.json({ success: true, data: recent });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
