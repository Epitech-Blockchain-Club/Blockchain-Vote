import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load ABI
const loadABI = (contractName) => {
    const filePath = path.join(__dirname, `../../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(fileData);
    if (!json.abi) throw new Error(`ABI not found in ${contractName}.json`);
    console.log(`[BLOCKCHAIN] ABI loaded for ${contractName}.`);
    return json.abi;
};

const ScrutinFactoryABI = loadABI('ScrutinFactory');
const ScrutinABI = loadABI('Scrutin');
const VoteSessionABI = loadABI('VoteSession');

if (!process.env.RPC_URL) {
    console.error("[\x1b[31mCONFIG ERROR\x1b[0m] RPC_URL is not set in environment variables! Blockchain connectivity will fail.");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || '');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let currentNonce = -1;
let noncePromise = null;

export const getNextNonce = async () => {
    // Use a lock to prevent concurrent calls from getting the same nonce
    if (noncePromise) {
        await noncePromise;
    }

    let resolveNonce;
    noncePromise = new Promise(resolve => {
        resolveNonce = resolve;
    });

    try {
        const networkNonce = await wallet.getNonce('pending');

        if (currentNonce === -1 || networkNonce > currentNonce) {
            currentNonce = networkNonce;
        } else {
            currentNonce++;
        }

        console.log(`[NONCE] Nonce allocated.`);
        return currentNonce;
    } finally {
        resolveNonce();
        noncePromise = null;
    }
};

export const resetNonce = async () => {
    currentNonce = -1;
    return await getNextNonce();
};

export const getFactoryContract = (address) => {
    const addr = address || process.env.FACTORY_ADDRESS;
    if (!addr) throw new Error("FACTORY_ADDRESS not defined");
    const contract = new ethers.Contract(addr, ScrutinFactoryABI, wallet);
    if (!contract.createScrutin) {
        throw new Error("createScrutin method not found on contract object");
    }
    return contract;
};

export const getScrutinContract = (address) => {
    return new ethers.Contract(address, ScrutinABI, wallet);
};

export const getVoteSessionContract = (address) => {
    return new ethers.Contract(address, VoteSessionABI, wallet);
};

export { ScrutinFactoryABI, ScrutinABI, VoteSessionABI, wallet, provider };
