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
    console.log(`Loaded ABI for ${contractName}: ${json.abi.length} methods`);
    return json.abi;
};

const ScrutinFactoryABI = loadABI('ScrutinFactory');
const ScrutinABI = loadABI('Scrutin');
const VoteSessionABI = loadABI('VoteSession');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:1337', undefined, {
    staticNetwork: true
});

// Add timeout to provider calls
provider.on("debug", (info) => {
    if (info.action === "request") {
        info.request.timeout = 10000; // 10 seconds
    }
});
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let currentNonce = -1;

export const getNextNonce = async () => {
    if (currentNonce === -1) {
        currentNonce = await wallet.getNonce();
    } else {
        currentNonce++;
    }
    return currentNonce;
};

export const resetNonce = async () => {
    currentNonce = await wallet.getNonce();
    return currentNonce;
};

export const getFactoryContract = (address) => {
    const addr = address || process.env.FACTORY_ADDRESS;
    if (!addr) throw new Error("FACTORY_ADDRESS not defined");
    console.log(`Connecting to Factory at ${addr}`);
    const contract = new ethers.Contract(addr, ScrutinFactoryABI, wallet);
    if (!contract.createScrutin) {
        console.error("Contract object methods:", Object.keys(contract));
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
