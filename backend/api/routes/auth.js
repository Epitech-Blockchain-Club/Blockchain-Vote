import express from 'express';
import { storage } from '../services/storage.js';
import { sendCredentials } from '../services/email.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, error: 'Email and password required' });

        const user = await storage.getUser(email);
        if (!user || user.password !== password)
            return res.status(401).json({ success: false, error: 'Invalid email or password' });

        const { password: _, ...userData } = user;
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await storage.getUser(email);
        if (user) {
            const { password: _, ...userData } = user;
            res.json({ success: true, user: userData });
        } else {
            res.status(401).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await storage.getAllUsers();
        const sanitized = allUsers.map(({ password: _, ...u }) => u);
        res.json({ success: true, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, error: 'Email and password required' });

        if (await storage.getUser(email))
            return res.status(400).json({ success: false, error: 'User already exists' });

        await storage.createUser({ email, password, name, role: role || 'admin' });
        sendCredentials(email, name, password, role || 'admin');
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/auth/organizations
router.get('/organizations', async (req, res) => {
    try {
        const orgs = await storage.getAllOrganizations();
        res.json({ success: true, data: orgs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/auth/organizations/assign
router.post('/organizations/assign', async (req, res) => {
    try {
        const { orgId, adminEmail } = req.body;
        if (!orgId || !adminEmail)
            return res.status(400).json({ success: false, error: 'Missing params' });

        await storage.assignAdminToOrg(orgId, adminEmail);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/auth/organizations
router.post('/organizations', async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name)
            return res.status(400).json({ success: false, error: 'Organization name required' });

        const id = name.toLowerCase().replace(/\s+/g, '-');
        const existing = await storage.getAllOrganizations();
        if (existing.find(o => o.id === id))
            return res.status(400).json({ success: false, error: 'Organization already exists' });

        const newOrg = { id, name, location: location || 'France', admins: [], status: 'Active' };
        await storage.saveOrganization(newOrg);
        res.status(201).json({ success: true, data: newOrg });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/auth/add-admin-to-org
router.post('/add-admin-to-org', async (req, res) => {
    try {
        const { email, name, orgId, orgName, password } = req.body;
        if (!email || !orgId || !password)
            return res.status(400).json({ success: false, error: 'email, orgId and password are required' });

        const normalizedEmail = email.toLowerCase();
        const displayName = name || normalizedEmail.split('@')[0];

        const existing = await storage.getUser(normalizedEmail);
        await storage.createUser({
            ...(existing || {}),
            email: normalizedEmail,
            name: displayName,
            password,
            role: 'admin',
            org: orgId,
        });
        console.log(`[ADD-ADMIN] ${existing ? 'Updated' : 'Created'} admin ${normalizedEmail} for org ${orgId}`);

        await storage.assignAdminToOrg(orgId, normalizedEmail);

        try {
            await sendCredentials(normalizedEmail, displayName, password, 'admin', orgName || orgId);
        } catch (mailErr) {
            console.warn(`[ADD-ADMIN] Email failed (account still created): ${mailErr.message}`);
        }

        res.json({ success: true, message: `Admin ${normalizedEmail} created/updated and linked to ${orgId}` });
    } catch (error) {
        console.error('[ADD-ADMIN] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/oauth-login
router.post('/oauth-login', async (req, res) => {
    try {
        const { email, name, provider } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email required' });

        const normalizedEmail = email.toLowerCase();
        let user = await storage.getUser(normalizedEmail);

        if (!user) {
            const allScrutins = await storage.getAllScrutins();

            const isMod = allScrutins.some(s =>
                s.sessions?.some(session =>
                    session.moderators?.some(m =>
                        (typeof m === 'string' ? m : m?.email)?.toLowerCase() === normalizedEmail
                    )
                )
            );

            if (isMod) {
                user = { email: normalizedEmail, name: name || 'Modérateur', role: 'moderator', provider };
            } else {
                const isVoter = allScrutins.some(s =>
                    s.sessions?.some(session =>
                        session.voters?.some(v => v.toLowerCase() === normalizedEmail)
                    )
                );
                if (isVoter) {
                    user = { email: normalizedEmail, name: name || 'Électeur', role: 'voter', provider };
                }
            }
        }

        if (user) {
            const { password: _, ...userData } = user;
            res.json({ success: true, user: { ...userData, provider } });
        } else {
            res.status(401).json({ success: false, error: "Votre compte n'est pas enregistré dans le système de vote." });
        }
    } catch (error) {
        console.error('OAuth Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ALL /api/auth/moderator/verify
router.all('/moderator/verify', async (req, res) => {
    try {
        const token = req.query.token || req.body.token;
        if (!token) return res.status(400).json({ success: false, error: 'Token required' });

        const tokenData = await storage.getModeratorToken(token);
        if (!tokenData) return res.status(401).json({ success: false, error: 'Invalid or expired token' });

        res.json({
            success: true,
            user: {
                email: tokenData.email,
                role: tokenData.type || 'moderator',
                name: tokenData.type === 'voter' ? 'Électeur' : 'Modérateur',
                scrutinId: tokenData.scrutinId,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/auth/oauth-config
router.get('/oauth-config', (req, res) => {
    res.json({
        success: true,
        version: '1.0.1-tenant-fix',
        googleClientId:    process.env.GOOGLE_CLIENT_ID || '',
        microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
        microsoftTenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    });
});

// POST /api/auth/verify-voter
router.post('/verify-voter', async (req, res) => {
    try {
        const { email, scrutinId } = req.body;
        if (!email || !scrutinId)
            return res.status(400).json({ success: false, error: 'Email and scrutinId are required' });

        const voterEmail = email.toLowerCase();
        const scrutinMetadata = await storage.getScrutin(scrutinId);
        if (!scrutinMetadata)
            return res.status(404).json({ success: false, error: 'Scrutin not found' });

        const hasVoted = await storage.hasVoterVoted(voterEmail, scrutinId);
        const authorizedSessions = [];
        let isAuthorized = false;

        const globalVoters = scrutinMetadata.voters || [];
        if (globalVoters.some(v => v.toLowerCase() === voterEmail)) {
            isAuthorized = true;
            scrutinMetadata.sessions?.forEach((session, index) => {
                authorizedSessions.push({
                    id: index,
                    name: session.title,
                    description: session.description,
                    candidates: session.options || [],
                });
            });
        } else {
            scrutinMetadata.sessions?.forEach((session, index) => {
                const sessionVoters = session.voters || [];
                if (sessionVoters.some(v => v.toLowerCase() === voterEmail)) {
                    isAuthorized = true;
                    authorizedSessions.push({
                        id: index,
                        name: session.title,
                        description: session.description,
                        candidates: session.options || [],
                    });
                }
            });
        }

        if (!isAuthorized)
            return res.status(403).json({ success: false, error: 'Voter not authorized for this scrutin' });

        res.json({ success: true, authorized: true, hasVoted, sessions: authorizedSessions });
    } catch (error) {
        console.error('Voter verification error:', error);
        res.status(500).json({ success: false, error: 'Server error during voter verification' });
    }
});

export default router;
