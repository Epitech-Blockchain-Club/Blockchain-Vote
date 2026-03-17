import express from 'express';
import { storage } from '../services/storage.js';
import { requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings — public (frontend needs it without auth)
router.get('/', async (req, res) => {
    try {
        const settings = await storage.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/settings — superadmin only
router.patch('/', requireSuperAdmin, async (req, res) => {
    try {
        const allowed = ['showResultsToVoters'];
        const updates = {};
        for (const key of allowed) {
            if (key in req.body) updates[key] = req.body[key];
        }
        const settings = await storage.updateSettings(updates);
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
