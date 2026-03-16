/**
 * MongoDB-backed storage service.
 * All methods are async and use Mongoose models.
 * Replaces the previous file-based JSON storage.
 */
import User             from '../models/User.js';
import Organization     from '../models/Organization.js';
import Scrutin          from '../models/Scrutin.js';
import Vote             from '../models/Vote.js';
import VoterRecord      from '../models/VoterRecord.js';
import ModeratorToken   from '../models/ModeratorToken.js';
import ModeratorDecision from '../models/ModeratorDecision.js';
import VoteRequest      from '../models/VoteRequest.js';
import Notification     from '../models/Notification.js';

// ── Seed initial users/org on first run ──────────────────────────────────────

const seedDefaults = async () => {
    const superEmail = process.env.INITIAL_SUPERADMIN_EMAIL;
    const superPass  = process.env.INITIAL_SUPERADMIN_PASSWORD;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPass  = process.env.INITIAL_ADMIN_PASSWORD;

    if (!superEmail || !superPass) {
        console.warn('[\x1b[31mSECURITY WARNING\x1b[0m] INITIAL_SUPERADMIN_EMAIL or INITIAL_SUPERADMIN_PASSWORD missing — SuperAdmin not seeded.');
    } else {
        await User.findOneAndUpdate(
            { email: superEmail.toLowerCase() },
            { email: superEmail.toLowerCase(), password: superPass, role: 'superadmin', name: 'Super Admin', bio: 'Platform Architect' },
            { upsert: true, new: true }
        );
    }

    if (!adminEmail || !adminPass) {
        console.warn('[\x1b[31mSECURITY WARNING\x1b[0m] INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD missing — Admin not seeded.');
    } else {
        await User.findOneAndUpdate(
            { email: adminEmail.toLowerCase() },
            { email: adminEmail.toLowerCase(), password: adminPass, role: 'admin', name: 'Global Admin', bio: 'Main Election Moderator', org: 'epitech' },
            { upsert: true, new: true }
        );
        await Organization.findOneAndUpdate(
            { id: 'epitech' },
            { id: 'epitech', name: 'epitech', location: 'France', admins: [adminEmail.toLowerCase()], status: 'Active' },
            { upsert: true, new: true }
        );
    }

    console.log('[STORAGE] Seed complete.');
};

// ── Storage API ───────────────────────────────────────────────────────────────

export const storage = {

    // ── Moderator decisions ──────────────────────────────────────────────────

    saveModeratorDecision: async (email, sessionAddress, decision, reason = '') => {
        await ModeratorDecision.findOneAndUpdate(
            { email: email.toLowerCase(), sessionAddress: sessionAddress.toLowerCase() },
            { email: email.toLowerCase(), sessionAddress: sessionAddress.toLowerCase(), decision, reason },
            { upsert: true, new: true }
        );
        console.log(`[STORAGE] Decision '${decision}' saved — ${email} → ${sessionAddress}`);
    },

    hasModeratorDecided: async (email, sessionAddress) => {
        const doc = await ModeratorDecision.findOne({
            email: email.toLowerCase(),
            sessionAddress: sessionAddress.toLowerCase(),
        }).lean();
        return !!doc;
    },

    getSessionDecisions: async (sessionAddress) => {
        return ModeratorDecision.find({ sessionAddress: sessionAddress.toLowerCase() }).lean();
    },

    getRecentDecisions: async (limit = 10) => {
        return ModeratorDecision.find().sort({ createdAt: -1 }).limit(limit).lean();
    },

    // ── Moderator tokens ─────────────────────────────────────────────────────

    saveModeratorToken: async (token, data) => {
        await ModeratorToken.create({ token, ...data });
    },

    getModeratorToken: async (token) => {
        return ModeratorToken.findOne({ token }).lean();
    },

    deleteModeratorToken: async (token) => {
        await ModeratorToken.deleteOne({ token });
    },

    // ── Scrutins ─────────────────────────────────────────────────────────────

    saveScrutin: async (address, metadata) => {
        const addr = address.toLowerCase();
        await Scrutin.findOneAndUpdate(
            { address: addr },
            { address: addr, ...metadata },
            { upsert: true, new: true, overwrite: false }
        );
        console.log(`[STORAGE] Scrutin saved: ${addr}`);
    },

    getScrutin: async (address) => {
        return Scrutin.findOne({ address: address.toLowerCase() }).lean();
    },

    getSessionMetadata: async (sessionAddress) => {
        const addr = sessionAddress.toLowerCase();
        const scrutin = await Scrutin.findOne({ 'sessions.address': addr }).lean();
        if (!scrutin) return null;
        return scrutin.sessions.find(s => s.address?.toLowerCase() === addr) || null;
    },

    updateScrutin: async (address, updates) => {
        await Scrutin.findOneAndUpdate({ address: address.toLowerCase() }, { $set: updates });
    },

    updateSessionAddresses: async (scrutinAddress, sessionAddresses) => {
        const addr = scrutinAddress.toLowerCase();
        const scrutin = await Scrutin.findOne({ address: addr });
        if (!scrutin?.sessions) return;
        sessionAddresses.forEach((sAddr, idx) => {
            if (scrutin.sessions[idx]) {
                scrutin.sessions[idx].address = sAddr.toLowerCase();
            }
        });
        await scrutin.save();
        console.log(`[STORAGE] Updated ${sessionAddresses.length} session addresses for ${addr}`);
    },

    saveSessionVoters: async (address, sessionIdx, voters) => {
        await Scrutin.findOneAndUpdate(
            { address: address.toLowerCase() },
            { $set: { [`sessions.${sessionIdx}.voters`]: voters } }
        );
        console.log(`[STORAGE] Saved ${voters.length} voters for ${address} session ${sessionIdx}`);
    },

    getSessionVoters: async (address, sessionIdx) => {
        const scrutin = await Scrutin.findOne({ address: address.toLowerCase() }).lean();
        return scrutin?.sessions?.[sessionIdx]?.voters || [];
    },

    getAllScrutins: async () => {
        return Scrutin.find().lean();
    },

    // ── Votes ────────────────────────────────────────────────────────────────

    logVote: async (voteData) => {
        await Vote.create({ ...voteData, sessionId: voteData.sessionId?.toLowerCase() });
        console.log(`[STORAGE] Vote logged for session ${voteData.sessionId}`);
    },

    getVotesLog: async (sessionId) => {
        return Vote.find({ sessionId: sessionId?.toLowerCase() }).lean();
    },

    // ── Users ─────────────────────────────────────────────────────────────────

    getUser: async (email) => {
        return User.findOne({ email: email.toLowerCase() }).lean();
    },

    createUser: async (userData) => {
        await User.findOneAndUpdate(
            { email: userData.email.toLowerCase() },
            { ...userData, email: userData.email.toLowerCase() },
            { upsert: true, new: true }
        );
    },

    getAllUsers: async () => {
        return User.find().lean();
    },

    // ── Organizations ─────────────────────────────────────────────────────────

    getAllOrganizations: async () => {
        return Organization.find().lean();
    },

    saveOrganization: async (orgData) => {
        await Organization.findOneAndUpdate(
            { id: orgData.id.toLowerCase() },
            { ...orgData, id: orgData.id.toLowerCase() },
            { upsert: true, new: true }
        );
    },

    assignAdminToOrg: async (orgId, adminEmail) => {
        await Organization.findOneAndUpdate(
            { id: orgId.toLowerCase() },
            { $addToSet: { admins: adminEmail.toLowerCase() } }
        );
    },

    // ── Voter records (anti double-vote) ──────────────────────────────────────

    hasVoterVoted: async (email, scrutinId) => {
        const record = await VoterRecord.findOne({
            email: email.toLowerCase(),
            scrutinId: scrutinId.toLowerCase(),
        }).lean();
        return record?.hasVoted || false;
    },

    markVoterAsVoted: async (email, scrutinId, transactionHash = null) => {
        await VoterRecord.findOneAndUpdate(
            { email: email.toLowerCase(), scrutinId: scrutinId.toLowerCase() },
            { hasVoted: true, votedAt: new Date(), txHash: transactionHash },
            { upsert: true, new: true }
        );
        console.log(`[STORAGE] Voter ${email} marked as voted for ${scrutinId}`);
    },

    getVoterRecord: async (email, scrutinId) => {
        return VoterRecord.findOne({
            email: email.toLowerCase(),
            scrutinId: scrutinId.toLowerCase(),
        }).lean();
    },

    getVotersForScrutin: async (scrutinId) => {
        const records = await VoterRecord.find({ scrutinId: scrutinId.toLowerCase() }).lean();
        return records.map(r => r.email);
    },

    // ── Vote requests ─────────────────────────────────────────────────────────

    saveVoteRequest: async (request) => {
        const doc = await VoteRequest.create({ ...request });
        return doc.toObject();
    },

    getVoteRequests: async () => {
        return VoteRequest.find().sort({ createdAt: -1 }).lean();
    },

    // ── Notifications ─────────────────────────────────────────────────────────

    addNotification: async (notif) => {
        await Notification.create(notif);
    },

    getNotifications: async () => {
        return Notification.find().sort({ createdAt: -1 }).lean();
    },

    deleteNotification: async (id) => {
        await Notification.findByIdAndDelete(id);
    },

    // ── Init seed ─────────────────────────────────────────────────────────────

    seed: seedDefaults,
};
