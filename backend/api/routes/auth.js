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

/**
 * POST /api/auth/add-admin-to-org
 * Create or update an admin account linked to an organization,
 * generate a strong password, and send credentials by email.
 */
router.post('/add-admin-to-org', async (req, res) => {
    try {
        const { email, name, orgId, orgName, password } = req.body;
        if (!email || !orgId || !password) {
            return res.status(400).json({ success: false, error: 'email, orgId and password are required' });
        }

        const normalizedEmail = email.toLowerCase();
        const displayName = name || normalizedEmail.split('@')[0];

        // Create or update the user with admin role
        const existing = storage.getUser(normalizedEmail);
        if (existing) {
            // Update password and ensure admin role + org
            storage.createUser({
                ...existing,
                email: normalizedEmail,
                name: displayName,
                password,
                role: 'admin',
                org: orgId
            });
            console.log(`[ADD-ADMIN] Updated existing user ${normalizedEmail} → admin of ${orgId}`);
        } else {
            storage.createUser({
                email: normalizedEmail,
                name: displayName,
                password,
                role: 'admin',
                org: orgId
            });
            console.log(`[ADD-ADMIN] Created new admin user ${normalizedEmail} for org ${orgId}`);
        }

        // Link admin to organization
        storage.assignAdminToOrg(orgId, normalizedEmail);

        // Send credentials by email
        try {
            await sendCredentials(normalizedEmail, displayName, password, 'admin', orgName || orgId);
            console.log(`[ADD-ADMIN] Credentials email sent to ${normalizedEmail}`);
        } catch (mailErr) {
            console.warn(`[ADD-ADMIN] Email sending failed (account still created): ${mailErr.message}`);
        }

        res.json({ success: true, message: `Admin ${normalizedEmail} created/updated and linked to ${orgId}` });
    } catch (error) {
        console.error('[ADD-ADMIN] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/**
 * POST /api/auth/oauth-login
 * Handle OAuth login for Admins and Moderators
 */
router.post('/oauth-login', async (req, res) => {
    try {
        const { email, name, provider } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email required' });

        const normalizedEmail = email.toLowerCase();
        let user = storage.getUser(normalizedEmail);

        if (!user) {
            const allScrutins = storage.getAllScrutins();

            // Check if this person is a moderator for any scrutin session
            let isMod = false;
            for (const s of allScrutins) {
                if (s.sessions?.some(session =>
                    session.moderators?.some(m =>
                        (typeof m === 'string' ? m : m?.email)?.toLowerCase() === normalizedEmail
                    )
                )) {
                    isMod = true;
                    break;
                }
            }

            if (isMod) {
                user = { email: normalizedEmail, name: name || 'Modérateur', role: 'moderator', provider };
            } else {
                // Check if this person is a voter in any scrutin session
                let isVoter = false;
                for (const s of allScrutins) {
                    if (s.sessions?.some(session =>
                        session.voters?.some(v => v.toLowerCase() === normalizedEmail)
                    )) {
                        isVoter = true;
                        break;
                    }
                }

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

/**
 * ALL /api/auth/moderator/verify
 * Authenticate moderator via Magic Link token (GET supported for direct links, POST for app fetch)
 */
router.all('/moderator/verify', (req, res) => {
    const token = req.query.token || req.body.token;
    if (!token) return res.status(400).json({ success: false, error: 'Token required' });

    const tokenData = storage.getModeratorToken(token);
    if (!tokenData) return res.status(401).json({ success: false, error: 'Invalid or expired token' });

    // Return moderator data (temporary user structure)
    res.json({
        success: true,
        user: {
            email: tokenData.email,
            role: tokenData.type || 'moderator',
            name: tokenData.type === 'voter' ? 'Électeur' : 'Modérateur',
            scrutinId: tokenData.scrutinId
        }
    });
});

/**
 * GET /api/auth/oauth-config
 * Return OAuth Client IDs for frontend real verification
 */
router.get('/oauth-config', (req, res) => {
    res.json({
        success: true,
        version: '1.0.1-tenant-fix',
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
        microsoftTenantId: process.env.MICROSOFT_TENANT_ID || 'common'
    });
});

/**
 * POST /api/auth/verify-voter
 * Verify voter authorization and return accessible sessions
 */
router.post('/verify-voter', async (req, res) => {
    try {
        const { email, scrutinId } = req.body;

        if (!email || !scrutinId) {
            return res.status(400).json({
                success: false,
                error: 'Email and scrutinId are required'
            });
        }

        const voterEmail = email.toLowerCase();
        const scrutinMetadata = storage.getScrutin(scrutinId);

        if (!scrutinMetadata) {
            return res.status(404).json({
                success: false,
                error: 'Scrutin not found'
            });
        }

        // Check if voter has already voted
        const hasVoted = storage.hasVoterVoted(voterEmail, scrutinId);

        // Check voter authorization
        const authorizedSessions = [];
        let isAuthorized = false;

        // Check global voters list
        const globalVoters = scrutinMetadata.voters || [];
        const isGlobalVoter = globalVoters.some(v => v.toLowerCase() === voterEmail);

        if (isGlobalVoter) {
            // Global voter can access all sessions
            isAuthorized = true;
            scrutinMetadata.sessions?.forEach((session, index) => {
                authorizedSessions.push({
                    id: index,
                    name: session.title,
                    description: session.description,
                    candidates: session.options || []
                });
            });
        } else {
            // Check session-specific voters
            scrutinMetadata.sessions?.forEach((session, index) => {
                const sessionVoters = session.voters || [];
                if (sessionVoters.some(v => v.toLowerCase() === voterEmail)) {
                    isAuthorized = true;
                    authorizedSessions.push({
                        id: index,
                        name: session.title,
                        description: session.description,
                        candidates: session.options || []
                    });
                }
            });
        }

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Voter not authorized for this scrutin'
            });
        }

        res.json({
            success: true,
            authorized: true,
            hasVoted,
            sessions: authorizedSessions
        });

    } catch (error) {
        console.error('Voter verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during voter verification'
        });
    }
});

export default router;
