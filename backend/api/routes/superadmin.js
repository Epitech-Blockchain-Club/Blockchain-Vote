import express from 'express';
import { storage } from '../services/storage.js';

const router = express.Router();

// POST /api/superadmin/notifications
router.post('/notifications', async (req, res) => {
    try {
        const { email, orgName, message } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email required' });

        const notif = {
            email,
            orgName: orgName || 'Non précisé',
            message: message || `${email} souhaite créer une organisation et lancer un vote`,
            type: 'ORG_REQUEST',
        };

        await storage.addNotification(notif);
        console.log(`[SuperAdmin] New notification received.`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/superadmin/notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await storage.getNotifications();
        // Keep same response shape as before (max 50)
        res.json({ success: true, data: notifications.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/superadmin/notifications/:id
router.delete('/notifications/:id', async (req, res) => {
    try {
        await storage.deleteNotification(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
