/**
 * Simple in-memory storage for off-chain metadata.
 * In production, this would use MongoDB.
 */

const scrutinsMetadata = new Map();
const votesLog = [];
const voterRecords = new Map(); // Key: email:scrutinId, Value: { hasVoted, votedAt, transactionHash }
const users = new Map([
    ['super@votechain.com', { email: 'super@votechain.com', role: 'superadmin', password: 'password123', name: 'Super Admin', bio: 'Platform Architect' }],
    ['admin@votechain.com', { email: 'admin@votechain.com', role: 'admin', password: 'password123', name: 'Global Admin', bio: 'Main Election Moderator', org: 'epitech' }]
]);
const organizations = new Map([
    ['epitech', { id: 'epitech', name: 'epitech', location: 'France', admins: ['admin@votechain.com'], status: 'Active' }]
]);
const moderatorTokens = new Map();
const moderatorDecisions = new Map(); // Key: email:sessionAddress, Value: { decision, timestamp }
const voteRequests = [];
const notifications = [];

export const storage = {
    saveModeratorDecision: (email, sessionAddress, decision, reason = '') => {
        // Use | as separator to avoid confusion with colons in addresses
        const key = `${email.toLowerCase()}|${sessionAddress.toLowerCase()}`;
        moderatorDecisions.set(key, { email: email.toLowerCase(), sessionAddress: sessionAddress.toLowerCase(), decision, reason, timestamp: new Date() });
        console.log(`[STORAGE] Saved decision '${decision}' from ${email} for session ${sessionAddress}`);
    },
    hasModeratorDecided: (email, sessionAddress) => {
        const key = `${email.toLowerCase()}|${sessionAddress.toLowerCase()}`;
        return moderatorDecisions.has(key);
    },
    getSessionDecisions: (sessionAddress) => {
        const addr = sessionAddress.toLowerCase();
        const results = [];
        for (const [key, value] of moderatorDecisions.entries()) {
            // Key format: email|sessionAddress
            if (key.endsWith(`|${addr}`)) {
                results.push({ ...value });
            }
        }
        return results;
    },
    getRecentDecisions: (limit = 10) => {
        return Array.from(moderatorDecisions.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    },
    saveModeratorToken: (token, data) => {
        moderatorTokens.set(token, { ...data, createdAt: new Date() });
    },
    getModeratorToken: (token) => {
        return moderatorTokens.get(token);
    },
    deleteModeratorToken: (token) => {
        moderatorTokens.delete(token);
    },
    saveScrutin: (address, metadata) => {
        const addr = address.toLowerCase();
        console.log(`[STORAGE] Saving scrutin metadata for ${addr}:`, {
            title: metadata.title,
            voterCount: (metadata.voters || []).length,
            sessionCount: (metadata.sessions || []).length
        });
        scrutinsMetadata.set(addr, {
            ...metadata,
            createdAt: metadata.createdAt || new Date()
        });
    },
    getScrutin: (address) => {
        return scrutinsMetadata.get(address.toLowerCase());
    },
    getSessionMetadata: (sessionAddress) => {
        const addr = sessionAddress.toLowerCase();
        for (const scrutin of scrutinsMetadata.values()) {
            if (!scrutin.sessions) continue;
            const session = scrutin.sessions.find(s => s.address?.toLowerCase() === addr);
            if (session) return session;
        }
        return null;
    },
    updateScrutin: (address, updates) => {
        const addr = address.toLowerCase();
        const current = scrutinsMetadata.get(addr);
        if (current) {
            scrutinsMetadata.set(addr, { ...current, ...updates });
        }
    },
    updateSessionAddresses: (scrutinAddress, sessionAddresses) => {
        const addr = scrutinAddress.toLowerCase();
        const meta = scrutinsMetadata.get(addr);
        if (meta && meta.sessions) {
            sessionAddresses.forEach((sAddr, idx) => {
                if (meta.sessions[idx]) {
                    meta.sessions[idx].address = sAddr.toLowerCase();
                }
            });
            scrutinsMetadata.set(addr, meta);
            console.log(`[STORAGE] Updated ${sessionAddresses.length} session addresses for scrutin ${addr}`);
        }
    },
    getAllScrutins: () => {
        return Array.from(scrutinsMetadata.values());
    },
    logVote: (voteData) => {
        const normalizedData = {
            ...voteData,
            sessionId: voteData.sessionId?.toLowerCase(),
            timestamp: new Date()
        };
        votesLog.push(normalizedData);
        console.log(`[STORAGE] Logged vote for session ${normalizedData.sessionId}`);
    },
    getVotesLog: (sessionId) => {
        const addr = sessionId?.toLowerCase();
        const votes = votesLog.filter(v => v.sessionId?.toLowerCase() === addr);
        console.log(`[STORAGE] Retrieved ${votes.length} votes for session ${addr}`);
        return votes;
    },
    // Session voter management
    saveSessionVoters: (address, sessionIdx, voters) => {
        const addr = address.toLowerCase();
        const meta = scrutinsMetadata.get(addr) || {};
        if (!meta.sessions) meta.sessions = [];
        // Ensure the session exists
        if (!meta.sessions[sessionIdx]) meta.sessions[sessionIdx] = {};
        meta.sessions[sessionIdx].voters = voters;
        scrutinsMetadata.set(addr, meta);
        console.log(`[STORAGE] Saved ${voters.length} voters for scrutin ${addr} session ${sessionIdx}`);
    },
    getSessionVoters: (address, sessionIdx) => {
        const addr = address.toLowerCase();
        const meta = scrutinsMetadata.get(addr);
        if (meta && meta.sessions && meta.sessions[sessionIdx]) {
            const voters = meta.sessions[sessionIdx].voters || [];
            console.log(`Retrieved voters for scrutin ${addr} session ${sessionIdx}:`, voters);
            return voters;
        }
        return [];
    },
    getUser: (email) => {
        return users.get(email.toLowerCase());
    },
    createUser: (userData) => {
        users.set(userData.email.toLowerCase(), { ...userData, createdAt: new Date() });
    },
    getAllUsers: () => {
        return Array.from(users.values());
    },
    // Organization management
    getAllOrganizations: () => {
        return Array.from(organizations.values());
    },
    saveOrganization: (orgData) => {
        organizations.set(orgData.id.toLowerCase(), orgData);
    },
    assignAdminToOrg: (orgId, adminEmail) => {
        const org = organizations.get(orgId.toLowerCase());
        if (org) {
            if (!org.admins.includes(adminEmail.toLowerCase())) {
                org.admins.push(adminEmail.toLowerCase());
            }
        }
    },
    // Voter record management for double voting prevention
    hasVoterVoted: (email, scrutinId) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        const record = voterRecords.get(key);
        return record ? record.hasVoted : false;
    },
    markVoterAsVoted: (email, scrutinId, transactionHash = null) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        voterRecords.set(key, {
            hasVoted: true,
            votedAt: new Date(),
            transactionHash
        });
        console.log(`[STORAGE] Marked voter ${email} as voted for scrutin ${scrutinId}`);
    },
    getVoterRecord: (email, scrutinId) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        return voterRecords.get(key);
    },
    // --- Vote Requests ---
    saveVoteRequest: (request) => {
        const newRequest = {
            id: Date.now().toString(),
            ...request,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        voteRequests.push(newRequest);

        // Also add a notification for SuperAdmins
        storage.addNotification({
            type: 'VOTE_REQUEST',
            title: 'Nouvelle demande de vote',
            message: `Demande de ${request.email}: ${request.description?.substring(0, 50)}...`,
            data: newRequest
        });

        return newRequest;
    },
    getVoteRequests: () => {
        return voteRequests;
    },
    // --- Notifications ---
    addNotification: (notif) => {
        notifications.push({
            id: Date.now().toString(),
            ...notif,
            createdAt: new Date().toISOString(),
            read: false
        });
    },
    getNotifications: () => {
        return notifications;
    },
    // Maintenance routine to ensure voter synchronization/inactivation
    startMaintenance: () => {
        console.log('[STORAGE] Starting 5-minute maintenance routine...');
        setInterval(() => {
            console.log(`[STORAGE] [${new Date().toLocaleTimeString()}] Running voter session audit...`);
            // Here we could iterate over active sessions and prune those that are expired
            // or perform additional security checks.
            // For now, we enforce that any voter who has voted is permanently locked.
            voterRecords.forEach((record, key) => {
                if (record.hasVoted && !record.inactivated) {
                    record.inactivated = true;
                    console.log(`[STORAGE] Confirmed inactivation for voter record: ${key}`);
                }
            });
        }, 5 * 60 * 1000); // 5 minutes
    }
};

// Start the maintenance routine
storage.startMaintenance();
