/**
 * Simple in-memory storage for off-chain metadata.
 * In production, this would use MongoDB.
 */

const scrutinsMetadata = new Map();
const votesLog = [];
const users = new Map([
    ['super@votechain.com', { email: 'super@votechain.com', role: 'superadmin', password: 'password123', name: 'Super Admin', bio: 'Platform Architect' }],
    ['admin@votechain.com', { email: 'admin@votechain.com', role: 'admin', password: 'password123', name: 'Global Admin', bio: 'Main Election Moderator', org: 'epitech' }]
]);
const organizations = new Map([
    ['epitech', { id: 'epitech', name: 'epitech', location: 'France', admins: ['admin@votechain.com'], status: 'Active' }]
]);

export const storage = {
    saveScrutin: (address, metadata) => {
        scrutinsMetadata.set(address.toLowerCase(), {
            ...metadata,
            createdAt: metadata.createdAt || new Date()
        });
    },
    getScrutin: (address) => {
        return scrutinsMetadata.get(address.toLowerCase());
    },
    updateScrutin: (address, updates) => {
        const current = scrutinsMetadata.get(address.toLowerCase());
        if (current) {
            scrutinsMetadata.set(address.toLowerCase(), { ...current, ...updates });
        }
    },
    getAllScrutins: () => {
        return Array.from(scrutinsMetadata.values());
    },
    logVote: (voteData) => {
        votesLog.push({ ...voteData, timestamp: new Date() });
    },
    getVotesLog: (sessionId) => {
        return votesLog.filter(v => v.sessionId === sessionId);
    },
    // User management
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
    }
};
