import express from 'express';
import { ethers } from 'ethers';
import { getFactoryContract, getScrutinContract, getVoteSessionContract, getNextNonce, resetNonce } from '../services/blockchain.js';
import { storage } from '../services/storage.js';
import { sendModeratorInvitation } from '../services/email.js';

const router = express.Router();

// POST /api/scrutins - Create a new scrutin
router.post('/', async (req, res) => {
    try {
        const { title, description, scope, country, timingMode, startDate, endDate, voteSessions } = req.body;
        console.log(`Creating scrutin: ${title}`);

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
        storage.saveScrutin(scrutinAddress, {
            title, description, scope, country, timingMode, startDate, endDate,
            type: req.body.org || 'epitech', // Map organization to 'type' for filtering
            createdAt,
            sessions: voteSessions ? voteSessions.map(s => ({ ...s, txHash: receipt.hash })) : []
        });

        // Add sessions to the contract
        if (voteSessions && voteSessions.length > 0) {
            const scrutinContract = getScrutinContract(scrutinAddress);
            const adminAddress = await getFactoryContract().runner.getAddress();

            for (const session of voteSessions) {
                console.log(`Adding session: ${session.title}`);

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

                // Send real emails to moderators
                if (session.moderators && session.moderators.length > 0) {
                    for (const mod of session.moderators) {
                        // In dev, the moderator portal is /moderator/:scrutinId/:sessionId
                        // We'd ideally need the actual session address, but we can use the index or empty for now
                        // if we don't have it immediately available here.
                        // For now, let's just use the scrutin portal link.
                        const portalLink = `http://localhost:5173/moderator/${scrutinAddress}`;
                        await sendModeratorInvitation(mod, title, session.title, portalLink);
                    }
                }
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
            const metadata = storage.getScrutin(addr) || {};
            const contract = getScrutinContract(addr);

            // Fetch session addresses from contract
            let sessions = [];
            try {
                const sessionAddrs = await contract.getSessions();
                sessions = await Promise.all(sessionAddrs.map(async (sAddr, idx) => {
                    const sContract = getVoteSessionContract(sAddr);
                    const isValidated = await sContract.isValidated();
                    return {
                        address: sAddr,
                        isValidated,
                        ...(metadata.sessions ? metadata.sessions[idx] : {})
                    };
                }));
            } catch (e) {
                console.warn(`Could not fetch sessions for ${addr}: ${e.message}`);
                sessions = metadata.sessions || [];
            }

            return {
                address: addr,
                ...metadata,
                sessions
            };
        }));

        res.json({ success: true, data: scrutins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
