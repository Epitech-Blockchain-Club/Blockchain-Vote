const { ethers } = require('ethers');

const provider = new ethers.providers.InfuraProvider('mainnet', process.env.INFURA_PROJECT_ID);

const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

/*I am supposing that req is like
    {
        "to": "recipient_address_here",
        "amount": "0.01" // Amount of ETH to send
    }
*/

exports.sendETH = async (req, res) => {
    const { to, amount } = req.body;

    try {
        const value = ethers.utils.parseEther(amount.toString());
        const tx = {
            to: to,
            value: value,
        };
        const transactionResponse = await wallet.sendTransaction(tx);
        await transactionResponse.wait();
        return res.status(200).json({ message: 'Transaction successful', transactionHash: transactionResponse.hash });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Transaction failed', error: error.message });
    }
};
