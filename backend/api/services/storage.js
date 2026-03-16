/**
 * File-backed storage for off-chain metadata.
 * All data is persisted to JSON files under DATA_DIR (/app/data by default)
 * so it survives container restarts. Mount DATA_DIR as a Docker volume.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || '/app/data';

if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[STORAGE] Created data directory: ${DATA_DIR}`);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const loadJSON = (filename, defaultValue) => {
    const filepath = join(DATA_DIR, filename);
    if (existsSync(filepath)) {
        try {
            return JSON.parse(readFileSync(filepath, 'utf8'));
        } catch (e) {
            console.error(`[STORAGE] Failed to load ${filename}:`, e.message);
        }
    }
    return defaultValue;
};

const saveJSON = (filename, data) => {
    const filepath = join(DATA_DIR, filename);
    const tmppath = filepath + '.tmp';
    try {
        writeFileSync(tmppath, JSON.stringify(data, null, 2), 'utf8');
        renameSync(tmppath, filepath);
    } catch (e) {
        console.error(`[STORAGE] Failed to save ${filename}:`, e.message);
    }
};

// ── Seed defaults (used only when no persisted file exists) ───────────────────

const DEFAULT_USERS = [
    ['super@votechain.com', { email: 'super@votechain.com', role: 'superadmin', password: 'password123', name: 'Super Admin', bio: 'Platform Architect' }],
    ['admin@votechain.com', { email: 'admin@votechain.com', role: 'admin', password: 'password123', name: 'Global Admin', bio: 'Main Election Moderator', org: 'epitech' }]
];

const DEFAULT_ORGS = [
    ['epitech', { id: 'epitech', name: 'epitech', location: 'France', admins: ['admin@votechain.com'], status: 'Active' }]
];

// ── Load persisted state ───────────────────────────────────────────────────────

const scrutinsMetadata  = new Map(loadJSON('scrutins.json',           []));
const votesLog          =          loadJSON('votes.json',             []);
const voterRecords      = new Map(loadJSON('voter_records.json',       []));
const users             = new Map(loadJSON('users.json',              DEFAULT_USERS));
const organizations     = new Map(loadJSON('organizations.json',      DEFAULT_ORGS));
const moderatorTokens   = new Map(loadJSON('moderator_tokens.json',   []));
const moderatorDecisions= new Map(loadJSON('moderator_decisions.json',[]));
const voteRequests      =          loadJSON('vote_requests.json',     []);
const notifications     =          loadJSON('notifications.json',     []);

console.log(`[STORAGE] Loaded: ${scrutinsMetadata.size} scrutins, ${votesLog.length} votes, ${users.size} users`);

// ── Public API (identical to the original in-memory version) ─────────────────

export const storage = {

    // ── Moderator decisions ──────────────────────────────────────────────────
    saveModeratorDecision: (email, sessionAddress, decision, reason = '') => {
        const key = `${email.toLowerCase()}|${sessionAddress.toLowerCase()}`;
        moderatorDecisions.set(key, { email: email.toLowerCase(), sessionAddress: sessionAddress.toLowerCase(), decision, reason, timestamp: new Date() });
        saveJSON('moderator_decisions.json', [...moderatorDecisions.entries()]);
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
            if (key.endsWith(`|${addr}`)) results.push({ ...value });
        }
        return results;
    },
    getRecentDecisions: (limit = 10) => {
        return Array.from(moderatorDecisions.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    },

    // ── Moderator tokens ─────────────────────────────────────────────────────
    saveModeratorToken: (token, data) => {
        moderatorTokens.set(token, { ...data, createdAt: new Date() });
        saveJSON('moderator_tokens.json', [...moderatorTokens.entries()]);
    },
    getModeratorToken: (token) => moderatorTokens.get(token),
    deleteModeratorToken: (token) => {
        moderatorTokens.delete(token);
        saveJSON('moderator_tokens.json', [...moderatorTokens.entries()]);
    },

    // ── Scrutins ─────────────────────────────────────────────────────────────
    saveScrutin: (address, metadata) => {
        const addr = address.toLowerCase();
        console.log(`[STORAGE] Saving scrutin metadata for ${addr}:`, {
            title: metadata.title,
            voterCount: (metadata.voters || []).length,
            sessionCount: (metadata.sessions || []).length
        });
        scrutinsMetadata.set(addr, { ...metadata, createdAt: metadata.createdAt || new Date() });
        saveJSON('scrutins.json', [...scrutinsMetadata.entries()]);
    },
    getScrutin: (address) => scrutinsMetadata.get(address.toLowerCase()),
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
            saveJSON('scrutins.json', [...scrutinsMetadata.entries()]);
        }
    },
    updateSessionAddresses: (scrutinAddress, sessionAddresses) => {
        const addr = scrutinAddress.toLowerCase();
        const meta = scrutinsMetadata.get(addr);
        if (meta && meta.sessions) {
            sessionAddresses.forEach((sAddr, idx) => {
                if (meta.sessions[idx]) meta.sessions[idx].address = sAddr.toLowerCase();
            });
            scrutinsMetadata.set(addr, meta);
            saveJSON('scrutins.json', [...scrutinsMetadata.entries()]);
            console.log(`[STORAGE] Updated ${sessionAddresses.length} session addresses for scrutin ${addr}`);
        }
    },
    getAllScrutins: () => Array.from(scrutinsMetadata.values()),

    // ── Votes ────────────────────────────────────────────────────────────────
    logVote: (voteData) => {
        const normalizedData = { ...voteData, sessionId: voteData.sessionId?.toLowerCase(), timestamp: new Date() };
        votesLog.push(normalizedData);
        saveJSON('votes.json', votesLog);
        console.log(`[STORAGE] Logged vote for session ${normalizedData.sessionId}`);
    },
    getVotesLog: (sessionId) => {
        const addr = sessionId?.toLowerCase();
        const votes = votesLog.filter(v => v.sessionId?.toLowerCase() === addr);
        console.log(`[STORAGE] Retrieved ${votes.length} votes for session ${addr}`);
        return votes;
    },

    // ── Session voters ────────────────────────────────────────────────────────
    saveSessionVoters: (address, sessionIdx, voters) => {
        const addr = address.toLowerCase();
        const meta = scrutinsMetadata.get(addr) || {};
        if (!meta.sessions) meta.sessions = [];
        if (!meta.sessions[sessionIdx]) meta.sessions[sessionIdx] = {};
        meta.sessions[sessionIdx].voters = voters;
        scrutinsMetadata.set(addr, meta);
        saveJSON('scrutins.json', [...scrutinsMetadata.entries()]);
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

    // ── Users ─────────────────────────────────────────────────────────────────
    getUser: (email) => users.get(email.toLowerCase()),
    createUser: (userData) => {
        users.set(userData.email.toLowerCase(), { ...userData, createdAt: new Date() });
        saveJSON('users.json', [...users.entries()]);
    },
    getAllUsers: () => Array.from(users.values()),

    // ── Organizations ─────────────────────────────────────────────────────────
    getAllOrganizations: () => Array.from(organizations.values()),
    saveOrganization: (orgData) => {
        organizations.set(orgData.id.toLowerCase(), orgData);
        saveJSON('organizations.json', [...organizations.entries()]);
    },
    assignAdminToOrg: (orgId, adminEmail) => {
        const org = organizations.get(orgId.toLowerCase());
        if (org) {
            if (!org.admins.includes(adminEmail.toLowerCase())) {
                org.admins.push(adminEmail.toLowerCase());
            }
            saveJSON('organizations.json', [...organizations.entries()]);
        }
    },

    // ── Voter records (double-vote prevention) ────────────────────────────────
    hasVoterVoted: (email, scrutinId) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        return voterRecords.get(key)?.hasVoted || false;
    },
    markVoterAsVoted: (email, scrutinId, transactionHash = null) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        voterRecords.set(key, { hasVoted: true, votedAt: new Date(), transactionHash });
        saveJSON('voter_records.json', [...voterRecords.entries()]);
        console.log(`[STORAGE] Marked voter ${email} as voted for scrutin ${scrutinId}`);
    },
    getVoterRecord: (email, scrutinId) => {
        const key = `${email.toLowerCase()}:${scrutinId.toLowerCase()}`;
        return voterRecords.get(key);
    },
    getVotersForScrutin: (scrutinId) => {
        const sid = scrutinId.toLowerCase();
        const results = [];
        for (const [key] of voterRecords.entries()) {
            if (key.endsWith(`:${sid}`)) results.push(key.split(':')[0]);
        }
        return results;
    },

    // ── Vote requests ─────────────────────────────────────────────────────────
    saveVoteRequest: (request) => {
        const newRequest = { id: Date.now().toString(), ...request, status: 'pending', createdAt: new Date().toISOString() };
        voteRequests.push(newRequest);
        saveJSON('vote_requests.json', voteRequests);
        storage.addNotification({
            type: 'VOTE_REQUEST',
            title: 'Nouvelle demande de vote',
            message: `Demande de ${request.email}: ${request.description?.substring(0, 50)}...`,
            data: newRequest
        });
        return newRequest;
    },
    getVoteRequests: () => voteRequests,

    // ── Notifications ─────────────────────────────────────────────────────────
    addNotification: (notif) => {
        notifications.push({ id: Date.now().toString(), ...notif, createdAt: new Date().toISOString(), read: false });
        saveJSON('notifications.json', notifications);
    },
    getNotifications: () => notifications,

    // ── Maintenance ───────────────────────────────────────────────────────────
    startMaintenance: () => {
        console.log('[STORAGE] Starting 5-minute maintenance routine...');
        setInterval(() => {
            console.log(`[STORAGE] [${new Date().toLocaleTimeString()}] Running voter session audit...`);
            let changed = false;
            voterRecords.forEach((record, key) => {
                if (record.hasVoted && !record.inactivated) {
                    record.inactivated = true;
                    changed = true;
                    console.log(`[STORAGE] Confirmed inactivation for voter record: ${key}`);
                }
            });
            if (changed) saveJSON('voter_records.json', [...voterRecords.entries()]);
        }, 5 * 60 * 1000);
    }
};

storage.startMaintenance();

// ── Graceful shutdown — flush all data on SIGTERM/SIGINT ─────────────────────

const flushAll = () => {
    console.log('[STORAGE] Flushing all data to disk before shutdown...');
    saveJSON('scrutins.json',           [...scrutinsMetadata.entries()]);
    saveJSON('votes.json',              votesLog);
    saveJSON('voter_records.json',      [...voterRecords.entries()]);
    saveJSON('users.json',              [...users.entries()]);
    saveJSON('organizations.json',      [...organizations.entries()]);
    saveJSON('moderator_tokens.json',   [...moderatorTokens.entries()]);
    saveJSON('moderator_decisions.json', [...moderatorDecisions.entries()]);
    saveJSON('vote_requests.json',      voteRequests);
    saveJSON('notifications.json',      notifications);
    console.log('[STORAGE] All data flushed successfully.');
};

process.on('SIGTERM', () => { flushAll(); process.exit(0); });
process.on('SIGINT',  () => { flushAll(); process.exit(0); });
