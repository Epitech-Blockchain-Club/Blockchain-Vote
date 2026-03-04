import 'dotenv/config';
import { getFactoryContract, wallet } from './api/services/blockchain.js';

async function test() {
    try {
        console.log("Testing Factory connection...");
        const factory = getFactoryContract();
        console.log("Factory address:", await factory.getAddress());

        console.log("Attempting createScrutin call...");
        const tx = await factory.createScrutin(
            "Test Script",
            "Desc",
            "Scope",
            "Country",
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 3600
        );
        console.log("Tx hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("TEST FAILED:", error);
    }
}

test();
