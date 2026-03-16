import express from 'express';
import { storage } from '../services/storage.js';

const router = express.Router();

// POST /api/request-vote
router.post('/', async (req, res) => {
    try {
        const { email, description } = req.body;
        if (!email || !description)
            return res.status(400).json({ success: false, error: 'Email et description requis' });

        const request = await storage.saveVoteRequest({ email, description });
        res.json({
            success: true,
            message: 'Demande enregistrée avec succès. Un administrateur vous contactera bientôt.',
            data: request,
        });
    } catch (error) {
        console.error('Error saving vote request:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// GET /api/request-vote
router.get('/', async (req, res) => {
    try {
        const requests = await storage.getVoteRequests();
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

export default router;
