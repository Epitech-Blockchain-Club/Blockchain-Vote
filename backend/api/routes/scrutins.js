import express from 'express';
import { ethers } from 'ethers';
import { getFactoryContract, getScrutinContract, getVoteSessionContract, getNextNonce, resetNonce } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { sendModeratorInvitation } from '../services/email.js';
import crypto from 'crypto';

const router = express.Router();

// GET /api/scrutins/available - Get active scrutins for voter email
router.get('/available', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email parameter is required'
            });
        }

        const voterEmail = email.toLowerCase();
        const allScrutins = storage.getAllScrutins();
        const availableScrutins = [];

        // Filter scrutins where voter is authorized and scrutin is in progress
        for (const scrutin of allScrutins) {
            // Check if scrutin is in progress (simplified check - in production would check actual dates)
            const now = new Date();
            const startDate = new Date(scrutin.startDate);
            const endDate = new Date(scrutin.endDate);

            if (now < startDate || now > endDate) {
                continue; // Skip scrutins that haven't started or have ended
            }

            // Check if voter is authorized (global or session-specific)
            let isAuthorized = false;

            // Check global voters
            const globalVoters = scrutin.voters || [];
            if (globalVoters.some(v => v.toLowerCase() === voterEmail)) {
                isAuthorized = true;
            } else {
                // Check session-specific voters
                const sessions = scrutin.sessions || [];
                for (const session of sessions) {
                    const sessionVoters = session.voters || [];
                    if (sessionVoters.some(v => v.toLowerCase() === voterEmail)) {
                        isAuthorized = true;
                        break;
                    }
                }
            }

            if (isAuthorized) {
                availableScrutins.push({
                    id: scrutin.address || scrutin.id,
                    name: scrutin.title,
                    country: scrutin.country || 'France',
                    status: 'in_progress'
                });
            }
        }

        res.json({
            success: true,
            scrutins: availableScrutins
        });

    } catch (error) {
        console.error('Error fetching available scrutins:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching available scrutins'
        });
    }
});

// POST /api/scrutins - Create a new scrutin
router.post('/', async (req, res) => {
    try {
        const { title, description, scope, country, timingMode, startDate, endDate, voteSessions, voters } = req.body;
        console.log(`[SCRUTIN] Creating new scrutin: "${title}"`);
        console.log(`[SCRUTIN] Received ${voters?.length || 0} global voters`);

        const factory = getFactoryContract();
        console.log(`Calling createScrutin...`);

        const startTime = Math.floor(new Date(startDate || Date.now()).getTime() / 1000);
        const endTime = Math.floor(new Date(endDate || Date.now() + 86400000).getTime() / 1000);

        const tx = await factory.createScrutin(
            title, description || "", scope || "", country || "", startTime, endTime,
            { nonce: await getNextNonce() }
        );
        console.log(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Extract contract address from event
        // En ethers v6, receipt.logs contains the logs
        const event = receipt.logs.find(log => log.eventName === 'ScrutinCreated');
        const scrutinAddress = event.args[0];

        // Save metadata off-chain
        const createdAt = new Date().toISOString();
        console.log(`[SCRUTIN] Saving metadata for ${scrutinAddress}`);

        storage.saveScrutin(scrutinAddress, {
            title, description, scope, country, timingMode, startDate, endDate,
            type: req.body.org || 'epitech',
            createdAt,
            voters: voters || [],
            sessions: voteSessions ? voteSessions.map(s => ({
                ...s,
                txHash: receipt.hash,
                voters: s.voters || [] // Ensure session voters are stored
            })) : []
        });

        // Note: Voters should NOT receive emails - they access the voting portal directly
        // Only moderators receive invitation emails for validation

        // Add sessions to the contract
        if (voteSessions && voteSessions.length > 0) {
            const scrutinContract = getScrutinContract(scrutinAddress);
            const adminAddress = await getFactoryContract().runner.getAddress();

            for (let i = 0; i < voteSessions.length; i++) {
                const session = voteSessions[i];
                console.log(`[SCRUTIN] Adding session ${i}: "${session.title}"`);

                // Sanitize moderators: ENS is not supported on local networks, so we must ensure 
                // all moderators are valid hex addresses. If they are emails, we map to admin for now.
                const sanitizedModerators = (session.moderators || []).map(m => {
                    if (ethers.isAddress(m)) return m;
                    return adminAddress; // Fallback to current admin if it's an email/invalid
                });

                const sessionTx = await scrutinContract.addVoteSession(
                    session.title,
                    session.description || "",
                    session.voterCount || 0,
                    sanitizedModerators,
                    { nonce: await getNextNonce() }
                );
                await sessionTx.wait();
                console.log(`[SCRUTIN] Session "${session.title}" added to blockchain`);

                // Save session voters explicitly in storage if not already handled by parent
                if (session.voters && session.voters.length > 0) {
                    storage.saveSessionVoters(scrutinAddress, i, session.voters);
                }
            }

            // --- INDEX SESSION ADDRESSES ---
            try {
                const sessionAddresses = await scrutinContract.getSessions();
                storage.updateSessionAddresses(scrutinAddress, sessionAddresses);
                console.log(`[SCRUTIN] Indexed ${sessionAddresses.length} session addresses for ${scrutinAddress}`);
            } catch (indexErr) {
                console.warn(`[SCRUTIN] Critical: Failed to index session addresses: ${indexErr.message}`);
            }

            // --- DE-DUPLICATED MODERATOR INVITATIONS ---
            // 1. Collect all unique moderators across all sessions
            const uniqueModerators = new Set();
            voteSessions.forEach(session => {
                if (session.moderators && session.moderators.length > 0) {
                    session.moderators.forEach(mod => {
                        if (mod) uniqueModerators.add(mod.toLowerCase());
                    });
                }
            });

            // 2. Send one email per unique moderator
            for (const mod of uniqueModerators) {
                const token = crypto.randomBytes(32).toString('hex');
                storage.saveModeratorToken(token, {
                    email: mod,
                    scrutinId: scrutinAddress,
                    type: 'moderator'
                });

                const portalLink = `http://localhost:5173/moderate/${scrutinAddress}?token=${token}`;
                await sendModeratorInvitation(mod, title, "Toutes vos sessions assignées", portalLink);
                console.log(`[SCRUTIN] Single invitation sent to moderator ${mod} for all their sessions`);
            }
        }

        res.status(201).json({
            success: true,
            address: scrutinAddress,
            txHash: receipt.hash
        });
    } catch (error) {
        console.error("Error creating scrutin:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins - List all scrutins
router.get('/', async (req, res) => {
    try {
        const factory = getFactoryContract();
        const addresses = await factory.getDeployedScrutins();

        const scrutins = await Promise.all(addresses.map(async (addr) => {
            console.log(`[API] Processing scrutin: ${addr}`);
            const metadata = storage.getScrutin(addr) || {};
            const contract = getScrutinContract(addr);

            // Fetch session addresses from contract
            let sessions = [];
            let sessionAddrs = [];
            try {
                sessionAddrs = await contract.getSessions();
                console.log(`[API] Found ${sessionAddrs.length} sessions for scrutin ${addr}`);

                sessions = await Promise.all(sessionAddrs.map(async (sAddr, idx) => {
                    const sessionMetadata = (metadata.sessions && metadata.sessions[idx]) ? metadata.sessions[idx] : {};
                    // Performance optimization: Only check blockchain if not already validated in storage
                    let isValidated = sessionMetadata.isValidated;
                    let isInvalidated = sessionMetadata.isInvalidated;
                    let invalidationReason = sessionMetadata.invalidationReason;

                    if (!isValidated && !isInvalidated) {
                        try {
                            const sContract = getVoteSessionContract(sAddr);
                            [isValidated, isInvalidated, invalidationReason] = await Promise.all([
                                sContract.isValidated(),
                                sContract.isInvalidated(),
                                sContract.invalidationReason()
                            ]);

                            // Update metadata with blockchain status
                            if (isValidated || isInvalidated) {
                                if (metadata.sessions && metadata.sessions[idx]) {
                                    metadata.sessions[idx].isValidated = isValidated;
                                    metadata.sessions[idx].isInvalidated = isInvalidated;
                                    metadata.sessions[idx].invalidationReason = invalidationReason;
                                    storage.saveScrutin(addr, metadata);
                                }
                            }
                        } catch (sErr) {
                            console.warn(`[API] Error checking status for session ${sAddr}: ${sErr.message}`);
                        }
                    }

                    // Self-healing: Update storage if address is missing
                    if (metadata.sessions && metadata.sessions[idx] && !metadata.sessions[idx].address) {
                        metadata.sessions[idx].address = sAddr.toLowerCase();
                        storage.saveScrutin(addr, metadata);
                        console.log(`[API] Fixed missing session address in storage for ${sAddr}`);
                    }

                    const decisions = storage.getSessionDecisions(sAddr);
                    const validations = decisions.filter(d => d.decision === 'validate').length;
                    const totalMods = (sessionMetadata.moderators || []).length;

                    return {
                        ...sessionMetadata,
                        address: sAddr,
                        isValidated,
                        isInvalidated,
                        invalidationReason,
                        consensusPercentage: totalMods > 0 ? Math.round((validations / totalMods) * 100) : 0,
                        validationCount: validations,
                        moderatorCount: totalMods,
                        moderators: (sessionMetadata.moderators || []).map(email => {
                            const d = decisions.find(dec => dec.email.toLowerCase() === email.toLowerCase());
                            return {
                                email,
                                status: d ? (d.decision === 'validate' ? 'Validé' : 'Invalidé') : 'En cours',
                                timestamp: d ? d.timestamp : null
                            };
                        }),
                        voters: sessionMetadata.voters || [],
                        votes: storage.getVotesLog(sAddr).reduce((acc, v) => {
                            acc[v.optionIndex] = (acc[v.optionIndex] || 0) + 1;
                            return acc;
                        }, {})
                    };
                }));
            } catch (e) {
                console.warn(`[API] Could not fetch sessions for ${addr}: ${e.message}`);
                // Fallback to metadata
                sessions = (metadata.sessions || []).map(s => ({ ...s, address: 'unknown' }));
            }

            // Aggregate votes and prepare time series
            const aggregatedVotes = {};
            const timeSeriesArray = [];

            sessions.forEach(s => {
                if (!s.address || s.address === 'unknown') return;

                const sessionVotes = storage.getVotesLog(s.address);
                sessionVotes.forEach(v => {
                    const optionIdx = v.optionIndex;
                    aggregatedVotes[optionIdx] = (aggregatedVotes[optionIdx] || 0) + 1;

                    const time = new Date(v.timestamp);
                    const timeKey = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

                    timeSeriesArray.push({
                        time: timeKey,
                        timestamp: v.timestamp,
                        optionIndex: optionIdx,
                        sessionId: s.address
                    });
                });
            });

            // Convert to sorted array
            const timeSeries = timeSeriesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            return {
                address: addr,
                ...metadata,
                sessions,
                votes: aggregatedVotes,
                votedCount: storage.getVotersForScrutin(addr).length,
                timeSeries: timeSeries.length > 0 ? timeSeries : [{ time: '00:00', votes: 0 }],
                voters: metadata.voters || []
            };
        }));

        res.json({ success: true, data: scrutins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/scrutins/authorized
 * Find all scrutins and sessions where a voter (email) is authorized
 */
router.get('/authorized', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase();
        if (!email) return res.status(400).json({ success: false, error: "Email is required" });

        console.log(`[AUTHORIZED] Searching for voter: ${email}`);

        const factory = getFactoryContract();
        const addresses = await factory.getDeployedScrutins();
        console.log(`[AUTHORIZED] ${addresses.length} deployed scrutin(s)`);

        const authorizedScrutins = [];

        for (const addr of addresses) {
            const laddr = addr.toLowerCase();
            const metadata = storage.getScrutin(laddr) || {};
            if (!metadata.sessions || metadata.sessions.length === 0) {
                console.log(`[AUTHORIZED] Skip ${laddr}: no session metadata`);
                continue;
            }

            console.log(`[AUTHORIZED] Scrutin "${metadata.title}" (${laddr}) — ${metadata.sessions.length} session(s)`);

            // Fetch and self-heal session addresses
            const contract = getScrutinContract(laddr);
            const sessionAddrs = await contract.getSessions();
            console.log(`[AUTHORIZED]  Blockchain sessions: ${sessionAddrs.length}`);

            if (sessionAddrs.length > 0) {
                storage.updateSessionAddresses(laddr, sessionAddrs);
            }

            const voterSessions = [];
            for (let i = 0; i < metadata.sessions.length; i++) {
                const sMetadata = metadata.sessions[i] || {};
                const voterInList = sMetadata.voters?.some(v => v.toLowerCase() === email);
                console.log(`[AUTHORIZED]  Session[${i}] "${sMetadata.title}" — email in voters: ${voterInList}`);
                if (!voterInList) continue;

                const sAddr = (sessionAddrs[i] || sMetadata.address || '').toLowerCase();
                if (!sAddr) {
                    console.warn(`[AUTHORIZED]  Session[${i}] — NO address found, skipping`);
                    continue;
                }

                try {
                    const sContract = getVoteSessionContract(sAddr);
                    const [isValidated, isInvalidated] = await Promise.all([
                        sContract.isValidated(),
                        sContract.isInvalidated()
                    ]);
                    console.log(`[AUTHORIZED]  Session[${i}] isValidated=${isValidated} isInvalidated=${isInvalidated}`);

                    if (isValidated === true && isInvalidated !== true) {
                        voterSessions.push({
                            ...sMetadata,
                            address: sAddr,
                            isValidated: true,
                            isInvalidated: false,
                            index: i
                        });
                        console.log(`[AUTHORIZED]  Session[${i}] ✅ Accessible`);
                    } else {
                        console.log(`[AUTHORIZED]  Session[${i}] ❌ Not accessible (validated=${isValidated}, invalidated=${isInvalidated})`);
                    }
                } catch (e) {
                    console.warn(`[AUTHORIZED]  Session[${i}] blockchain error: ${e.message}`);
                }
            }

            if (voterSessions.length > 0) {
                authorizedScrutins.push({
                    address: laddr,
                    title: metadata.title,
                    country: metadata.country || 'International',
                    startDate: metadata.startDate,
                    endDate: metadata.endDate,
                    sessions: voterSessions
                });
            }
        }

        console.log(`[AUTHORIZED] Returning ${authorizedScrutins.length} scrutin(s) to ${email}`);
        res.json({ success: true, data: authorizedScrutins });
    } catch (error) {
        console.error("Error in /authorized:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/scrutins/:address/vote
 * Handle multi-session global vote submission
 */
router.post('/:address/vote', async (req, res) => {
    try {
        const scrutinAddress = req.params.address;
        const { email, selections } = req.body; // selections: { sessionAddress: optionIndex }

        if (!email || !selections) {
            return res.status(400).json({ success: false, error: "Email and selections required" });
        }

        // 1. Prevent double voting
        if (storage.hasVoterVoted(email, scrutinAddress)) {
            return res.status(401).json({ success: false, error: "Vous avez déjà voté pour ce scrutin." });
        }

        const metadata = storage.getScrutin(scrutinAddress);
        if (!metadata) return res.status(404).json({ success: false, error: "Scrutin not found" });

        // 2. Submit votes to the blockchain (Relayer model)
        // In a real app, this would be a multi-vote transaction or individual ones
        const txHashes = [];

        for (const [sAddr, optionIdx] of Object.entries(selections)) {
            console.log(`[VOTE] New voter detected for scrutin ${scrutinAddress} | Session: ${sAddr} | Voter: ${email} | Choice: ${optionIdx}`);
            const sessionContract = getVoteSessionContract(sAddr);

            // Simulation of blockchain call (would be a real transaction on Hardhat)
            // const tx = await sessionContract.vote(optionIdx);
            // await tx.wait();

            // Log the vote off-chain for the real-time tally
            storage.logVote({
                sessionId: sAddr,
                voterEmail: email,
                optionIndex: parseInt(optionIdx),
                timestamp: new Date()
            });

            txHashes.push('0x' + Math.random().toString(16).substring(2, 66));
        }

        // 3. Mark voter as voted
        storage.markVoterAsVoted(email, scrutinAddress, txHashes[0]);

        res.json({ success: true, txHashes });
    } catch (error) {
        console.error("Error submitting vote:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/scrutins/:address/results - Get calculated results
router.get('/:address/results', async (req, res) => {
    try {
        const address = req.params.address;
        const metadata = storage.getScrutin(address);
        if (!metadata) return res.status(404).json({ success: false, error: "Scrutin not found" });

        const contract = getScrutinContract(address);
        const sessionAddrs = await contract.getSessions();

        const results = await Promise.all(sessionAddrs.map(async (sAddr, idx) => {
            const sessionMetadata = metadata.sessions ? metadata.sessions[idx] : {};
            const votes = storage.getVotesLog(sAddr);

            // Calculate counts per candidate index
            const counts = {};
            votes.forEach(v => {
                counts[v.optionIndex] = (counts[v.optionIndex] || 0) + 1;
            });

            const totalVotes = votes.length;

            // Map candidates from metadata and add stats
            const candidates = (sessionMetadata.options || []).map((opt, oIdx) => {
                const voteCount = counts[oIdx] || 0;
                return {
                    ...opt,
                    id: oIdx,
                    voteCount,
                    percentage: totalVotes > 0 ? parseFloat(((voteCount / totalVotes) * 100).toFixed(1)) : 0
                };
            });

            return {
                address: sAddr,
                title: sessionMetadata.title,
                totalVotes,
                candidates
            };
        }));

        res.json({ success: true, data: results });
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
