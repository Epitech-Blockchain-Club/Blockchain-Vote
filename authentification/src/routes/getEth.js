const User = require('../models/User');
const { ethers } = require('ethers');

// Configurez le provider pour Ganache
const provider = new ethers.providers.JsonRpcProvider(process.env.WALLET_URL); // Ganache default port
const wallet = new ethers.Wallet(process.env.WALLET_KEY, provider);

// Route pour obtenir de l'ETH
exports.getEth = async (req, res) => {
    const {email, address} = req.query;

    try {
        const user = await User.findOne({ where: {email}});
        if (!user || user.address !== address) {
            return res.status(404).json({ message: 'Utilisateur non trouvé ou adresse incorrecte' });
        }

        // Vérifiez si l'utilisateur a déjà été crédité
        const balance = await provider.getBalance(address);
        if (balance.gt(0)) {
            return res.status(400).json({ message: 'Déjà crédité' });
        }

        // Envoyer 0.5 ETH (ou 1 ETH)
        const tx = {
            to: address,
            value: ethers.utils.parseEther("0.5"), // Ajustez le montant si nécessaire
        };

        const transactionResponse = await wallet.sendTransaction(tx);
        await transactionResponse.wait();

        return res.status(200).json({ message: 'ETH envoyé', transactionHash: transactionResponse.hash });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};
