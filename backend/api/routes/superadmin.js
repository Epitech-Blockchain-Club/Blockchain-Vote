import express from 'express';

const router = express.Router();

// In-memory store for org creation requests / vote-launch requests
// In production, this would be a DB collection
let pendingRequests = [];

/**
 * POST /api/superadmin/notifications
 * Called by RequestVotePage (or any public page) when an entity wants to request an org/vote
 */
router.post('/notifications', (req, res) => {
    const { email, orgName, message } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const entry = {
        id: Date.now().toString(),
        email,
        orgName: orgName || 'Non précisé',
        message: message || `${email} souhaite créer une organisation et lancer un vote`,
        timestamp: new Date().toISOString(),
    };

    pendingRequests.unshift(entry);
    // Keep last 50
    if (pendingRequests.length > 50) pendingRequests = pendingRequests.slice(0, 50);

    console.log(`[SuperAdmin] New notification from ${email}`);
    res.json({ success: true, data: entry });
});

/**
 * GET /api/superadmin/notifications
 * Polled by the Navbar and SuperAdminDashboard
 */
router.get('/notifications', (req, res) => {
    res.json({ success: true, data: pendingRequests });
});

/**
 * DELETE /api/superadmin/notifications/:id
 * Mark a request as handled / dismiss it
 */
router.delete('/notifications/:id', (req, res) => {
    const { id } = req.params;
    pendingRequests = pendingRequests.filter(r => r.id !== id);
    res.json({ success: true });
});

export default router;
