/**
 * MongoDB-backed storage service.
 * All methods are async and use Mongoose models.
 * Replaces the previous file-based JSON storage.
 */
import bcrypt          from 'bcryptjs';
import User             from '../models/User.js';
import Organization     from '../models/Organization.js';
import Scrutin          from '../models/Scrutin.js';
import Vote             from '../models/Vote.js';
import VoterRecord      from '../models/VoterRecord.js';
import ModeratorToken   from '../models/ModeratorToken.js';
import ModeratorDecision from '../models/ModeratorDecision.js';
import VoteRequest            from '../models/VoteRequest.js';
import Notification           from '../models/Notification.js';
import Settings               from '../models/Settings.js';
import VoterAdditionRequest   from '../models/VoterAdditionRequest.js';

// ── Seed initial users/org on first run ──────────────────────────────────────

const seedDefaults = async () => {
    const superEmail = process.env.INITIAL_SUPERADMIN_EMAIL;
    const superPass  = process.env.INITIAL_SUPERADMIN_PASSWORD;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPass  = process.env.INITIAL_ADMIN_PASSWORD;

    if (!superEmail || !superPass) {
        console.warn('[\x1b[31mSECURITY WARNING\x1b[0m] INITIAL_SUPERADMIN_EMAIL or INITIAL_SUPERADMIN_PASSWORD missing — SuperAdmin not seeded.');
    } else {
        const existing = await User.findOne({ email: superEmail.toLowerCase() });
        if (!existing) {
            const hashed = await bcrypt.hash(superPass, 12);
            await User.create({ email: superEmail.toLowerCase(), password: hashed, role: 'superadmin', name: 'Super Admin', bio: 'Platform Architect' });
            console.log('[STORAGE] SuperAdmin created.');
        }
    }

    if (!adminEmail || !adminPass) {
        console.warn('[\x1b[31mSECURITY WARNING\x1b[0m] INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD missing — Admin not seeded.');
    } else {
        const existing = await User.findOne({ email: adminEmail.toLowerCase() });
        if (!existing) {
            const hashed = await bcrypt.hash(adminPass, 12);
            await User.create({ email: adminEmail.toLowerCase(), password: hashed, role: 'admin', name: 'Global Admin', bio: 'Main Election Moderator', org: 'epitech' });
            console.log('[STORAGE] Admin created.');
        }
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
        console.log(`[STORAGE] Moderator decision saved.`);
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

    getScrutinBySessionAddress: async (sessionAddress) => {
        const addr = sessionAddress.toLowerCase();
        return Scrutin.findOne({ 'sessions.address': addr }).lean();
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

    appendSessionVoters: async (address, sessionIdx, newEmails) => {
        const emails = newEmails.map(e => e.toLowerCase().trim()).filter(Boolean);
        const addr = address.toLowerCase();

        // $addToSet prevents duplicates at session level and global level
        await Scrutin.findOneAndUpdate(
            { address: addr },
            {
                $addToSet: {
                    [`sessions.${sessionIdx}.voters`]: { $each: emails },
                    voters: { $each: emails },   // keep global scrutin.voters in sync
                }
            }
        );

        // Sync session voterCount from actual array length
        const updated = await Scrutin.findOne({ address: addr }).lean();
        const actualCount = updated?.sessions?.[sessionIdx]?.voters?.length || 0;
        await Scrutin.findOneAndUpdate(
            { address: addr },
            { $set: { [`sessions.${sessionIdx}.voterCount`]: actualCount } }
        );

        console.log(`[STORAGE] Appended to ${addr} session ${sessionIdx}: ${actualCount} total voters`);
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
        const data = { ...userData, email: userData.email.toLowerCase() };
        if (data.password && !data.password.startsWith('$2')) {
            data.password = await bcrypt.hash(data.password, 12);
        }
        await User.findOneAndUpdate(
            { email: data.email },
            data,
            { upsert: true, new: true }
        );
    },

    updateProfile: async (email, update) => {
        return User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: update },
            { new: true }
        ).lean();
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
        console.log(`[STORAGE] Voter marked as voted.`);
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

    countVotersForScrutin: async (scrutinId) => {
        return VoterRecord.countDocuments({ scrutinId: scrutinId.toLowerCase() });
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

    // ── Platform settings ─────────────────────────────────────────────────────

    getSettings: async () => {
        return Settings.findOneAndUpdate(
            { key: 'platform' },
            { $setOnInsert: { key: 'platform' } },
            { upsert: true, new: true }
        ).lean();
    },

    updateSettings: async (updates) => {
        return Settings.findOneAndUpdate(
            { key: 'platform' },
            { $set: updates },
            { upsert: true, new: true }
        ).lean();
    },

    // ── VoterAdditionRequests ─────────────────────────────────────────────────

    createVoterAdditionRequest: async (data) => {
        const req = await VoterAdditionRequest.create(data);
        return req;
    },

    getVoterAdditionRequests: async (scrutinAddress) => {
        return VoterAdditionRequest.find({ scrutinAddress: scrutinAddress.toLowerCase() }).sort({ createdAt: -1 }).lean();
    },

    getVoterAdditionRequest: async (requestId) => {
        return VoterAdditionRequest.findById(requestId).lean();
    },

    recordVoterAdditionDecision: async (requestId, email, decision, reason = '') => {
        const req = await VoterAdditionRequest.findById(requestId);
        if (!req) throw new Error('Request not found');

        // Remove any prior decision from same moderator (idempotent)
        req.decisions = req.decisions.filter(d => d.email !== email.toLowerCase());
        req.decisions.push({ email: email.toLowerCase(), decision, reason, decidedAt: new Date() });

        const totalMods = req.moderators.length;
        const validates = req.decisions.filter(d => d.decision === 'validate').length;
        const invalidates = req.decisions.filter(d => d.decision === 'invalidate').length;

        if (invalidates > 0) {
            req.status = 'rejected';
        } else if (validates === totalMods) {
            req.status = 'approved';
            req.appliedAt = new Date();
        }

        await req.save();
        return req;
    },

    // ── Init seed ─────────────────────────────────────────────────────────────

    seed: seedDefaults,
};
