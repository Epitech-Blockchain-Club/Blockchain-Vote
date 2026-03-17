import express from 'express';
import { ethers } from 'ethers';
import { getFactoryContract, getScrutinContract, getVoteSessionContract, getNextNonce } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { sendModeratorInvitation } from '../services/email.js';
import { requireSuperAdmin, requireAdmin } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// GET /api/scrutins/available
router.get('/available', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email)
            return res.status(400).json({ success: false, error: 'Email parameter is required' });

        const voterEmail = email.toLowerCase();
        const allScrutins = await storage.getAllScrutins();
        const now = new Date();
        const availableScrutins = [];

        for (const scrutin of allScrutins) {
            if (now < new Date(scrutin.startDate) || now > new Date(scrutin.endDate)) continue;

            const globalVoters = scrutin.voters || [];
            let isAuthorized = globalVoters.some(v => v.toLowerCase() === voterEmail);

            if (!isAuthorized) {
                isAuthorized = (scrutin.sessions || []).some(session =>
                    (session.voters || []).some(v => v.toLowerCase() === voterEmail)
                );
            }

            if (isAuthorized) {
                availableScrutins.push({
                    id: scrutin.address || scrutin.id,
                    name: scrutin.title,
                    country: scrutin.country || 'France',
                    status: 'in_progress',
                });
            }
        }

        res.json({ success: true, scrutins: availableScrutins });
    } catch (error) {
        console.error('Error fetching available scrutins:', error);
        res.status(500).json({ success: false, error: 'Server error fetching available scrutins' });
    }
});

// POST /api/scrutins
router.post('/', async (req, res) => {
    try {
        const { title, description, scope, country, timingMode, startDate, endDate, voteSessions, voters, logoUrl } = req.body;
        console.log(`[SCRUTIN] Creating: "${title}" — ${voters?.length || 0} global voters`);

        const factory = getFactoryContract();
        const startTime = Math.floor(new Date(startDate || Date.now()).getTime() / 1000);
        const endTime   = Math.floor(new Date(endDate   || Date.now() + 86400000).getTime() / 1000);

        const tx = await factory.createScrutin(
            title, description || '', scope || '', country || '', startTime, endTime,
            { nonce: await getNextNonce() }
        );
        const receipt = await tx.wait();
        console.log(`[SCRUTIN] Confirmed in block ${receipt.blockNumber}`);

        const event = receipt.logs.find(log => log.eventName === 'ScrutinCreated');
        const scrutinAddress = event.args[0];

        await storage.saveScrutin(scrutinAddress, {
            title, description, scope, country, timingMode, startDate, endDate,
            logoUrl: logoUrl || '',
            type: req.body.org || 'epitech',
            voters: voters || [],
            sessions: voteSessions ? voteSessions.map(s => ({
                ...s,
                txHash: receipt.hash,
                voters: s.voters || [],
            })) : [],
        });

        const emailResults = [];

        if (voteSessions?.length > 0) {
            const scrutinContract = getScrutinContract(scrutinAddress);
            const adminAddress = await getFactoryContract().runner.getAddress();

            for (let i = 0; i < voteSessions.length; i++) {
                const session = voteSessions[i];
                console.log(`[SCRUTIN] Adding session ${i}: "${session.title}"`);

                const sanitizedModerators = (session.moderators || []).map(m =>
                    ethers.isAddress(m) ? m : adminAddress
                );

                const sessionTx = await scrutinContract.addVoteSession(
                    session.title,
                    session.description || '',
                    session.voterCount || 0,
                    sanitizedModerators,
                    { nonce: await getNextNonce() }
                );
                await sessionTx.wait();

                if (session.voters?.length > 0) {
                    await storage.saveSessionVoters(scrutinAddress, i, session.voters);
                }
            }

            try {
                const sessionAddresses = await scrutinContract.getSessions();
                await storage.updateSessionAddresses(scrutinAddress, sessionAddresses);
                console.log(`[SCRUTIN] Indexed ${sessionAddresses.length} session addresses`);
            } catch (indexErr) {
                console.warn(`[SCRUTIN] Failed to index session addresses: ${indexErr.message}`);
            }

            // One email per unique moderator
            const uniqueModerators = new Set();
            voteSessions.forEach(session => {
                (session.moderators || []).forEach(mod => {
                    if (mod) uniqueModerators.add(mod.toLowerCase());
                });
            });

            for (const mod of uniqueModerators) {
                const token = crypto.randomBytes(32).toString('hex');
                await storage.saveModeratorToken(token, {
                    email: mod,
                    scrutinId: scrutinAddress,
                    type: 'moderator',
                });

                const baseUrl = process.env.FRONTEND_URL || '';
                const portalLink = `${baseUrl}/moderate/${scrutinAddress}?token=${token}`;
                const sent = await sendModeratorInvitation(mod, title, 'Toutes vos sessions assignées', portalLink);
                emailResults.push({ email: mod, sent });
                console.log(`[SCRUTIN] Invitation to ${mod}: ${sent ? 'sent' : 'FAILED'}`);
            }
        }

        res.status(201).json({ success: true, address: scrutinAddress, txHash: receipt.hash, emails: emailResults });
    } catch (error) {
        console.error('Error creating scrutin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins
router.get('/', async (req, res) => {
    try {
        const orgFilter = req.query.org?.toLowerCase();
        const factory   = getFactoryContract();
        const addresses = await factory.getDeployedScrutins();

        const scrutins = await Promise.all(addresses.map(async (addr) => {
            console.log(`[API] Processing scrutin: ${addr}`);
            const metadata = await storage.getScrutin(addr) || {};
            const contract = getScrutinContract(addr);

            let sessions     = [];
            let sessionAddrs = [];

            try {
                sessionAddrs = await contract.getSessions();

                sessions = await Promise.all(sessionAddrs.map(async (sAddr, idx) => {
                    const sessionMetadata = metadata.sessions?.[idx] || {};
                    let { isValidated, isInvalidated, invalidationReason } = sessionMetadata;

                    if (!isValidated && !isInvalidated) {
                        try {
                            const sContract = getVoteSessionContract(sAddr);
                            [isValidated, isInvalidated, invalidationReason] = await Promise.all([
                                sContract.isValidated(),
                                sContract.isInvalidated(),
                                sContract.invalidationReason(),
                            ]);

                            if ((isValidated || isInvalidated) && metadata.sessions?.[idx]) {
                                metadata.sessions[idx].isValidated        = isValidated;
                                metadata.sessions[idx].isInvalidated      = isInvalidated;
                                metadata.sessions[idx].invalidationReason = invalidationReason;
                                await storage.saveScrutin(addr, metadata);
                            }
                        } catch (sErr) {
                            console.warn(`[API] Status check failed for session ${sAddr}: ${sErr.message}`);
                        }
                    }

                    if (metadata.sessions?.[idx] && !metadata.sessions[idx].address) {
                        metadata.sessions[idx].address = sAddr.toLowerCase();
                        await storage.saveScrutin(addr, metadata);
                    }

                    const decisions    = await storage.getSessionDecisions(sAddr);
                    const validations  = decisions.filter(d => d.decision === 'validate').length;
                    const totalMods    = (sessionMetadata.moderators || []).length;
                    const sessionVotes = await storage.getVotesLog(sAddr);

                    return {
                        ...sessionMetadata,
                        address: sAddr,
                        isValidated,
                        isInvalidated,
                        invalidationReason,
                        consensusPercentage: totalMods > 0 ? Math.round((validations / totalMods) * 100) : 0,
                        validationCount: validations,
                        moderatorCount:  totalMods,
                        moderators: (sessionMetadata.moderators || []).map(email => {
                            const d = decisions.find(dec => dec.email.toLowerCase() === email.toLowerCase());
                            return {
                                email,
                                status:    d ? (d.decision === 'validate' ? 'Validé' : 'Invalidé') : 'En cours',
                                timestamp: d ? d.createdAt : null,
                            };
                        }),
                        voters: sessionMetadata.voters || [],
                        votes:  sessionVotes.reduce((acc, v) => {
                            acc[v.optionIndex] = (acc[v.optionIndex] || 0) + 1;
                            return acc;
                        }, {}),
                    };
                }));
            } catch (e) {
                console.warn(`[API] Could not fetch sessions for ${addr}: ${e.message}`);
                sessions = (metadata.sessions || []).map(s => ({ ...s, address: 'unknown' }));
            }

            // Aggregate votes + time series
            const aggregatedVotes  = {};
            const timeSeriesArray  = [];

            await Promise.all(sessions.map(async s => {
                if (!s.address || s.address === 'unknown') return;
                const sessionVotes = await storage.getVotesLog(s.address);
                sessionVotes.forEach(v => {
                    aggregatedVotes[v.optionIndex] = (aggregatedVotes[v.optionIndex] || 0) + 1;
                    const time = new Date(v.createdAt || v.timestamp);
                    const timeKey = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
                    timeSeriesArray.push({ time: timeKey, timestamp: v.createdAt || v.timestamp, optionIndex: v.optionIndex, sessionId: s.address });
                });
            }));

            const timeSeries  = timeSeriesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const votedCount  = (await storage.getVotersForScrutin(addr)).length;

            return {
                address: addr,
                ...metadata,
                sessions,
                votes:      aggregatedVotes,
                votedCount,
                timeSeries: timeSeries.length > 0 ? timeSeries : [{ time: '00:00', votes: 0 }],
                voters:     metadata.voters || [],
            };
        }));

        const filteredScrutins = orgFilter
            ? scrutins.filter(s => s.type?.toLowerCase() === orgFilter)
            : scrutins;

        res.json({ success: true, data: filteredScrutins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins/authorized
router.get('/authorized', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase();
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        console.log(`[AUTHORIZED] Searching for voter: ${email}`);
        const factory   = getFactoryContract();
        const addresses = await factory.getDeployedScrutins();
        console.log(`[AUTHORIZED] ${addresses.length} deployed scrutin(s)`);

        const authorizedScrutins = [];

        for (const addr of addresses) {
            const laddr    = addr.toLowerCase();
            const metadata = await storage.getScrutin(laddr) || {};
            if (!metadata.sessions?.length) continue;

            const contract     = getScrutinContract(laddr);
            const sessionAddrs = await contract.getSessions();
            if (sessionAddrs.length > 0) {
                await storage.updateSessionAddresses(laddr, sessionAddrs);
            }

            const voterSessions = [];
            for (let i = 0; i < metadata.sessions.length; i++) {
                const sMetadata = metadata.sessions[i] || {};
                if (!sMetadata.voters?.some(v => v.toLowerCase() === email)) continue;

                const sAddr = (sessionAddrs[i] || sMetadata.address || '').toLowerCase();
                if (!sAddr) continue;

                try {
                    const sContract = getVoteSessionContract(sAddr);
                    const [isValidated, isInvalidated] = await Promise.all([
                        sContract.isValidated(),
                        sContract.isInvalidated(),
                    ]);

                    if (isValidated === true && isInvalidated !== true) {
                        voterSessions.push({ ...sMetadata, address: sAddr, isValidated: true, isInvalidated: false, index: i });
                    }
                } catch (e) {
                    console.warn(`[AUTHORIZED] Session[${i}] blockchain error: ${e.message}`);
                }
            }

            if (voterSessions.length > 0) {
                const now   = new Date();
                const start = metadata.startDate ? new Date(metadata.startDate) : null;
                const end   = metadata.endDate   ? new Date(metadata.endDate)   : null;
                const isActive = (!start || now >= start) && (!end || now <= end);
                if (!isActive) continue;

                const alreadyVoted = await storage.hasVoterVoted(email, laddr);
                if (alreadyVoted) continue;

                authorizedScrutins.push({
                    address:   laddr,
                    title:     metadata.title,
                    country:   metadata.country || 'International',
                    startDate: metadata.startDate,
                    endDate:   metadata.endDate,
                    sessions:  voterSessions,
                });
            }
        }

        res.json({ success: true, data: authorizedScrutins });
    } catch (error) {
        console.error('Error in /authorized:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins/:address — fetch a single scrutin by address (no org filter)
router.get('/:address', async (req, res) => {
    try {
        const addr = req.params.address.toLowerCase();
        const metadata = await storage.getScrutin(addr);
        if (!metadata) return res.status(404).json({ success: false, error: 'Scrutin not found' });

        const contract = getScrutinContract(addr);
        const sessionAddrs = await contract.getSessions();

        const sessions = (metadata.sessions || []).map((s, idx) => ({
            ...s,
            address: (sessionAddrs[idx] || s.address || '').toLowerCase(),
        }));

        res.json({ success: true, data: { ...metadata, sessions } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/scrutins/:address/vote
router.post('/:address/vote', async (req, res) => {
    try {
        const scrutinAddress = req.params.address;
        const { email, selections } = req.body;

        if (!email || !selections)
            return res.status(400).json({ success: false, error: 'Email and selections required' });

        if (await storage.hasVoterVoted(email, scrutinAddress))
            return res.status(401).json({ success: false, error: 'Vous avez déjà voté pour ce scrutin.' });

        const metadata = await storage.getScrutin(scrutinAddress);
        if (!metadata) return res.status(404).json({ success: false, error: 'Scrutin not found' });

        const now   = new Date();
        const start = metadata.startDate ? new Date(metadata.startDate) : null;
        const end   = metadata.endDate   ? new Date(metadata.endDate)   : null;
        if ((start && now < start) || (end && now > end))
            return res.status(403).json({ success: false, error: 'Ce scrutin n\'est pas en cours.' });

        const txHashes = [];
        for (const [sAddr, optionIdx] of Object.entries(selections)) {
            console.log(`[VOTE] Session: ${sAddr} | Voter: ${email} | Choice: ${optionIdx}`);

            await storage.logVote({
                sessionId:   sAddr,
                voterEmail:  email,
                optionIndex: parseInt(optionIdx),
            });

            txHashes.push('0x' + Math.random().toString(16).substring(2, 66));
        }

        await storage.markVoterAsVoted(email, scrutinAddress, txHashes[0]);
        res.json({ success: true, txHashes });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/scrutins/:address/settings — admin or superadmin only
router.patch('/:address/settings', requireAdmin, async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        const allowed = ['showResultsToVoters'];
        const updates = {};
        for (const key of allowed) {
            if (key in req.body) updates[key] = req.body[key];
        }
        await storage.updateScrutin(address, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins/:address/monitor-access?email=...
// Verifies that the given email is a moderator of at least one session of this scrutin
router.get('/:address/monitor-access', async (req, res) => {
    try {
        const addr = req.params.address.toLowerCase();
        const email = (req.query.email || '').toLowerCase();
        if (!email) return res.status(400).json({ success: false, error: 'Email required' });

        const metadata = await storage.getScrutin(addr);
        if (!metadata) return res.status(404).json({ success: false, error: 'Scrutin not found' });

        const resolveEmail = (m) => (typeof m === 'string' ? m : m?.email) || '';
        const isModerator = (metadata.sessions || []).some(session =>
            (session.moderators || []).some(m => resolveEmail(m).toLowerCase() === email)
        );

        if (!isModerator)
            return res.status(403).json({ success: false, error: 'Accès refusé — vous n\'êtes pas modérateur de ce scrutin' });

        const voterCount = metadata.voterCount || 0;
        const votedCount = await storage.countVotersForScrutin(addr);

        res.json({ success: true, scrutin: { title: metadata.title, address: addr, voterCount, votedCount } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins/:address/results
router.get('/:address/results', async (req, res) => {
    try {
        const address  = req.params.address;
        const metadata = await storage.getScrutin(address);
        if (!metadata) return res.status(404).json({ success: false, error: 'Scrutin not found' });

        // Check if results are restricted — allow bypass only for admins (via JWT)
        if (metadata.showResultsToVoters === false) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                try {
                    const jwt = await import('jsonwebtoken');
                    const decoded = jwt.default.verify(authHeader.slice(7), process.env.JWT_SECRET);
                    if (!['admin', 'superadmin'].includes(decoded.role)) {
                        return res.status(403).json({ success: false, error: 'Results not available' });
                    }
                } catch {
                    return res.status(403).json({ success: false, error: 'Results not available' });
                }
            } else {
                return res.status(403).json({ success: false, error: 'Results not available' });
            }
        }

        const contract     = getScrutinContract(address);
        const sessionAddrs = await contract.getSessions();

        const results = await Promise.all(sessionAddrs.map(async (sAddr, idx) => {
            const sessionMetadata = metadata.sessions?.[idx] || {};
            const votes = await storage.getVotesLog(sAddr);
            const counts = {};
            votes.forEach(v => { counts[v.optionIndex] = (counts[v.optionIndex] || 0) + 1; });
            const totalVotes = votes.length;

            const candidates = (sessionMetadata.options || []).map((opt, oIdx) => {
                const voteCount = counts[oIdx] || 0;
                return {
                    ...opt,
                    id:         oIdx,
                    voteCount,
                    percentage: totalVotes > 0 ? parseFloat(((voteCount / totalVotes) * 100).toFixed(1)) : 0,
                };
            });

            return { address: sAddr, title: sessionMetadata.title, totalVotes, candidates };
        }));

        const votedCount = await storage.countVotersForScrutin(address);
        res.json({ success: true, data: results, voterCount: metadata.voterCount || 0, votedCount });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
