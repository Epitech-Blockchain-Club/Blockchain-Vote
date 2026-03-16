require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 1337,
            // Explicitly fund the backend PRIVATE_KEY wallet so it can pay for gas
            accounts: [
                {
                    privateKey: "0x1fb3cee9bedf6bc21ebda1ded51fba4814cbe0e9937e1c4da1c72e9ea46f2982",
                    balance: "10000000000000000000000" // 10,000 ETH
                }
            ]
        },
        localhost: {
            url: "http://127.0.0.1:1337",
            accounts: ["0x1fb3cee9bedf6bc21ebda1ded51fba4814cbe0e9937e1c4da1c72e9ea46f2982"]
        },
        besu: {
            url: process.env.RPC_URL || "http://besu-node:8545",
            accounts: [process.env.PRIVATE_KEY || "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"]
        }
    }
};
