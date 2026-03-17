import express from 'express';
import crypto from 'crypto';
import { storage } from '../services/storage.js';
import { requireAdmin } from '../middleware/auth.js';
import {
    sendVoterAdditionRequest,
    notifyAdminOfVoterAdditionDecision,
    notifyAdminVoterAdditionApproved,
    notifyAdminVoterAdditionRejected,
} from '../services/email.js';
import ModeratorToken from '../models/ModeratorToken.js';

const router = express.Router();

const FRONTEND_URL = () => process.env.FRONTEND_URL || '';

// POST /api/voter-addition-requests — admin initiates a voter addition request
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { scrutinAddress, sessionIdx, emails } = req.body;
        if (!scrutinAddress || sessionIdx === undefined || !Array.isArray(emails) || emails.length === 0)
            return res.status(400).json({ success: false, error: 'scrutinAddress, sessionIdx, and emails are required' });

        const metadata = await storage.getScrutin(scrutinAddress.toLowerCase());
        if (!metadata) return res.status(404).json({ success: false, error: 'Scrutin not found' });

        const session = metadata.sessions?.[sessionIdx];
        if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

        const cleanEmails = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.includes('@')))];
        if (cleanEmails.length === 0)
            return res.status(400).json({ success: false, error: 'No valid emails provided' });

        const resolveEmail = (m) => (typeof m === 'string' ? m : m?.email) || '';
        const moderators = (session.moderators || []).map(m => resolveEmail(m).toLowerCase()).filter(Boolean);

        if (moderators.length === 0)
            return res.status(400).json({ success: false, error: 'This session has no moderators to validate the request' });

        const adminEmail = req.jwtUser?.email || '';

        const additionRequest = await storage.createVoterAdditionRequest({
            scrutinAddress: scrutinAddress.toLowerCase(),
            sessionIdx,
            sessionTitle: session.title || `Session ${sessionIdx + 1}`,
            scrutinTitle: metadata.title || '',
            emails: cleanEmails,
            requestedBy: adminEmail,
            moderators,
        });

        // Send a single review link per moderator
        for (const modEmail of moderators) {
            const token = crypto.randomBytes(32).toString('hex');
            await ModeratorToken.create({
                token,
                email: modEmail,
                scrutinId: additionRequest._id.toString(),
                type: 'voter-addition',
            });

            const reviewLink = `${FRONTEND_URL()}/voter-addition/${additionRequest._id}?token=${token}`;

            await sendVoterAdditionRequest(
                modEmail,
                metadata.title,
                session.title || `Session ${sessionIdx + 1}`,
                cleanEmails,
                reviewLink,
            );
        }

        res.status(201).json({ success: true, request: additionRequest });
    } catch (error) {
        console.error('Error creating voter addition request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/voter-addition-requests?scrutinAddress=... — admin fetches all requests for a scrutin
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { scrutinAddress } = req.query;
        if (!scrutinAddress)
            return res.status(400).json({ success: false, error: 'scrutinAddress query param required' });

        const requests = await storage.getVoterAdditionRequests(scrutinAddress.toLowerCase());
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/voter-addition-requests/:id/review?token=... — moderator loads request details (no auth)
router.get('/:id/review', async (req, res) => {
    try {
        const { token } = req.query;
        const { id } = req.params;

        if (!token) return res.status(400).json({ success: false, error: 'Token required' });

        const tokenDoc = await ModeratorToken.findOne({ token, type: 'voter-addition', scrutinId: id });
        if (!tokenDoc) return res.status(403).json({ success: false, error: 'Lien invalide ou expiré' });

        const request = await storage.getVoterAdditionRequest(id);
        if (!request) return res.status(404).json({ success: false, error: 'Demande introuvable' });

        // Return request details + moderator identity (without exposing other token data)
        res.json({
            success: true,
            request: {
                _id:          request._id,
                scrutinTitle: request.scrutinTitle,
                sessionTitle: request.sessionTitle,
                emails:       request.emails,
                status:       request.status,
                createdAt:    request.createdAt,
                moderatorCount: request.moderators.length,
                validateCount:  request.decisions.filter(d => d.decision === 'validate').length,
            },
            moderatorEmail: tokenDoc.email,
        });
    } catch (error) {
        console.error('Error fetching voter addition request for review:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/voter-addition-requests/:id/decide — moderator submits decision
router.post('/:id/decide', async (req, res) => {
    try {
        const { id } = req.params;
        const { token, decision, reason } = req.body;

        if (!token || !['validate', 'invalidate'].includes(decision))
            return res.status(400).json({ success: false, error: 'token and decision (validate|invalidate) are required' });

        if (decision === 'invalidate' && !reason?.trim())
            return res.status(400).json({ success: false, error: 'Une raison est requise pour invalider' });

        const tokenDoc = await ModeratorToken.findOne({ token, type: 'voter-addition', scrutinId: id });
        if (!tokenDoc) return res.status(403).json({ success: false, error: 'Lien invalide ou expiré' });

        const additionRequest = await storage.getVoterAdditionRequest(id);
        if (!additionRequest) return res.status(404).json({ success: false, error: 'Demande introuvable' });

        if (additionRequest.status !== 'pending')
            return res.status(409).json({ success: false, error: `Cette demande est déjà ${additionRequest.status === 'approved' ? 'approuvée' : 'rejetée'}` });

        const updated = await storage.recordVoterAdditionDecision(id, tokenDoc.email, decision, reason?.trim() || '');
        await ModeratorToken.deleteOne({ token });

        const validates = updated.decisions.filter(d => d.decision === 'validate').length;
        const adminEmail = updated.requestedBy;

        // Notify admin of this individual decision
        await notifyAdminOfVoterAdditionDecision(
            adminEmail, tokenDoc.email, decision, reason?.trim() || '',
            updated.scrutinTitle, updated.sessionTitle,
            validates, updated.moderators.length
        );

        // If consensus reached → apply voters
        if (updated.status === 'approved') {
            await storage.appendSessionVoters(updated.scrutinAddress, updated.sessionIdx, updated.emails);
            await notifyAdminVoterAdditionApproved(adminEmail, updated.emails, updated.scrutinTitle, updated.sessionTitle);
        }

        // If rejected → notify admin with reason
        if (updated.status === 'rejected') {
            await notifyAdminVoterAdditionRejected(adminEmail, tokenDoc.email, reason?.trim() || '', updated.scrutinTitle, updated.sessionTitle);
        }

        res.json({ success: true, status: updated.status });
    } catch (error) {
        console.error('Error processing voter addition decision:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
