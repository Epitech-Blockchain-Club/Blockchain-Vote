const User = require('../models/User');
const {Wallet} = require('ethers');

// Route pour vérifier le code de vérification
exports.verifyCode = async (req, res) => {
    const {email, code} = req.body;

    try {
        const user = await User.findOne({ where: {email}});
        if (!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        }

        // Vérification du code
        if (user.verificationCode !== code) {
            return res.status(400).json({message: 'Code incorrect'});
        }

        // Génération un wallet
        const wallet = Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const address = wallet.address;

        // Mise à jour l'utilisateur avec l'adresse et la clé privée
        await user.update({ address, privateKey });

        return res.status(200).json({ message: 'Code vérifié', address, privateKey });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};
