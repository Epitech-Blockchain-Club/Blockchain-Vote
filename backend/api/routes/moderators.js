import express from 'express';
import { getVoteSessionContract, getNextNonce } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { notifyAdminOfDecision, sendModeratorMonitorLink } from '../services/email.js';

const router = express.Router();

const resolveEmail = (m) => (typeof m === 'string' ? m : m?.email) || '';

const notifyModeratorsOnConsensus = async (sessionMetadata, sessionId) => {
    const parentScrutin = await storage.getScrutinBySessionAddress(sessionId);
    if (!parentScrutin) return;
    const monitorLink = `${process.env.FRONTEND_URL}/monitor/${parentScrutin.address}`;
    const emails = (sessionMetadata.moderators || []).map(resolveEmail).filter(Boolean);
    Promise.all(emails.map(email =>
        sendModeratorMonitorLink(email, parentScrutin.title, sessionMetadata.title, monitorLink)
            .catch(err => console.error(`[EMAIL] Monitor link to ${email} failed:`, err))
    ));
};

// POST /api/moderators/decision
router.post('/decision', async (req, res) => {
    try {
        const { sessionId, decision, reason, token } = req.body;

        if (!sessionId || !decision || !token)
            return res.status(400).json({ success: false, error: 'Paramètres manquants (Session, Décision ou Token)' });

        const tokenData = await storage.getModeratorToken(token);
        if (!tokenData)
            return res.status(401).json({ success: false, error: "Lien d'invitation invalide ou expiré" });

        const moderatorEmail = tokenData.email;

        const sessionMetadata = await storage.getSessionMetadata(sessionId);
        if (!sessionMetadata)
            return res.status(404).json({ success: false, error: 'Session introuvable' });

        const modEmails = (sessionMetadata.moderators || []).map(m => resolveEmail(m).toLowerCase());
        if (!modEmails.includes(moderatorEmail.toLowerCase()))
            return res.status(403).json({ success: false, error: "Vous n'êtes pas autorisé à modérer cette session." });

        if (await storage.hasModeratorDecided(moderatorEmail, sessionId))
            return res.status(400).json({ success: false, error: 'Vous avez déjà soumis votre décision pour cette session.' });

        const sessionContract = getVoteSessionContract(sessionId);
        let tx;

        if (decision === 'validate') {
            const allDecisions = await storage.getSessionDecisions(sessionId);
            const otherValidations = allDecisions.filter(d =>
                d.email.toLowerCase() !== moderatorEmail.toLowerCase() && d.decision === 'validate'
            ).length;
            const totalRequired = sessionMetadata.moderators?.length || 0;

            if (otherValidations + 1 >= totalRequired) {
                console.log(`[CONSENSUS] 100% reached for session ${sessionId}. Validating on-chain...`);
                tx = await sessionContract.validate({ nonce: await getNextNonce() });

                notifyModeratorsOnConsensus(sessionMetadata, sessionId);
            } else {
                console.log(`[CONSENSUS] ${otherValidations + 1}/${totalRequired} for session ${sessionId}.`);
            }
        } else {
            console.log(`[CONSENSUS] Moderator ${moderatorEmail} invalidated session ${sessionId}.`);
            tx = await sessionContract.invalidate(reason || 'Aucune raison fournie', { nonce: await getNextNonce() });
        }

        if (tx) {
            const receipt = await tx.wait();
            res.json({ success: true, decision, txHash: receipt.hash, onChain: true });
        } else {
            res.json({ success: true, decision, onChain: false });
        }

        await storage.saveModeratorDecision(moderatorEmail, sessionId, decision, reason);
        await storage.deleteModeratorToken(token);
        notifyAdminOfDecision('admin@epivote.epitech.eu', decision, moderatorEmail, 'Session Vote');
    } catch (error) {
        console.error('Error processing moderator decision:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/moderators/batch-decision
router.post('/batch-decision', async (req, res) => {
    try {
        const { decisions: batchDecisions, token } = req.body;

        if (!batchDecisions || !Array.isArray(batchDecisions) || !token)
            return res.status(400).json({ success: false, error: 'Paramètres manquants (Decisions ou Token)' });

        const tokenData = await storage.getModeratorToken(token);
        if (!tokenData)
            return res.status(401).json({ success: false, error: "Lien d'invitation invalide ou expiré" });

        const moderatorEmail = tokenData.email;
        const results = [];

        for (const item of batchDecisions) {
            const { sessionId, decision, reason } = item;
            try {
                const sessionMetadata = await storage.getSessionMetadata(sessionId);
                if (!sessionMetadata) {
                    results.push({ sessionId, success: false, error: 'Session introuvable' });
                    continue;
                }

                const modEmails = (sessionMetadata.moderators || []).map(m =>
                    (typeof m === 'string' ? m : m?.email || '').toLowerCase()
                );
                if (!modEmails.includes(moderatorEmail.toLowerCase())) {
                    results.push({ sessionId, success: false, error: `Non autorisé pour cette session` });
                    continue;
                }

                if (await storage.hasModeratorDecided(moderatorEmail, sessionId)) {
                    results.push({ sessionId, success: true, warning: 'Déjà décidé' });
                    continue;
                }

                const sessionContract = getVoteSessionContract(sessionId);
                let tx;

                if (decision === 'validate') {
                    const allDecisions = await storage.getSessionDecisions(sessionId);
                    const otherValidations = allDecisions.filter(d =>
                        d.email.toLowerCase() !== moderatorEmail.toLowerCase() && d.decision === 'validate'
                    ).length;
                    const totalRequired = sessionMetadata.moderators?.length || 0;
                    if (otherValidations + 1 >= totalRequired) {
                        tx = await sessionContract.validate({ nonce: await getNextNonce() });
                        notifyModeratorsOnConsensus(sessionMetadata, sessionId);
                    }
                } else {
                    tx = await sessionContract.invalidate(reason || 'Aucune raison fournie', { nonce: await getNextNonce() });
                }

                if (tx) {
                    const receipt = await tx.wait();
                    results.push({ sessionId, success: true, txHash: receipt.hash, onChain: true });
                } else {
                    results.push({ sessionId, success: true, onChain: false });
                }

                await storage.saveModeratorDecision(moderatorEmail, sessionId, decision, reason);
                notifyAdminOfDecision('admin@epivote.epitech.eu', decision, moderatorEmail, `Session: ${sessionId}`);
            } catch (err) {
                console.error(`Error in batch for session ${sessionId}:`, err);
                results.push({ sessionId, success: false, error: err.message });
            }
        }

        await storage.deleteModeratorToken(token);
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error processing batch moderator decision:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/moderators/notifications
router.get('/notifications', async (req, res) => {
    try {
        const recent = await storage.getRecentDecisions(20);
        res.json({ success: true, data: recent });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
