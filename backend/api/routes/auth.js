import express from 'express';
import { storage } from '../services/storage.js';
import { sendCredentials } from '../services/email.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Basic auth for development purposes
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const user = storage.getUser(email);

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Return user data (excluding password)
        const { password: _, ...userData } = user;
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * POST /api/auth/verify
 * Dummy session verification
 */
router.post('/verify', async (req, res) => {
    const { email } = req.body;
    const user = storage.getUser(email);
    if (user) {
        const { password: _, ...userData } = user;
        res.json({ success: true, user: userData });
    } else {
        res.status(401).json({ success: false });
    }
});

/**
 * GET /api/auth/users
 * List all users (SuperAdmin only in real app)
 */
router.get('/users', (req, res) => {
    const allUsers = storage.getAllUsers();
    // Exclude passwords
    const sanitized = allUsers.map(({ password: _, ...u }) => u);
    res.json({ success: true, data: sanitized });
});

/**
 * POST /api/auth/register
 * Create a new user (Admin)
 */
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    if (storage.getUser(email)) return res.status(400).json({ success: false, error: 'User already exists' });

    storage.createUser({ email, password, name, role: role || 'admin' });

    // Send real email with credentials
    sendCredentials(email, name, password, role || 'admin');

    res.status(201).json({ success: true });
});

/**
 * GET /api/auth/organizations
 */
router.get('/organizations', (req, res) => {
    const orgs = storage.getAllOrganizations();
    res.json({ success: true, data: orgs });
});

/**
 * POST /api/auth/organizations/assign
 */
router.post('/organizations/assign', (req, res) => {
    const { orgId, adminEmail } = req.body;
    if (!orgId || !adminEmail) return res.status(400).json({ success: false, error: 'Missing params' });

    storage.assignAdminToOrg(orgId, adminEmail);
    res.json({ success: true });
});

/**
 * POST /api/auth/organizations
 * Create a new organization
 */
router.post('/organizations', (req, res) => {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Organization name required' });

    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (storage.getAllOrganizations().find(o => o.id === id)) {
        return res.status(400).json({ success: false, error: 'Organization already exists' });
    }

    const newOrg = {
        id,
        name,
        location: location || 'France',
        admins: [],
        status: 'Active',
        createdAt: new Date()
    };

    storage.saveOrganization(newOrg);
    res.status(201).json({ success: true, data: newOrg });
});

export default router;
