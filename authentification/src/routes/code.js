const User = require('../models/User');
//const {Wallet} = require('ethers');

// Route pour vérifier le code de vérification
const verifyCode = async (req, res) => {
    const {email, code, address} = req.body;

    try {
        const user = await User.findOne({ where: {email}});
        if (!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        }

        // Vérification du code
        if (user.verificationCode !== code) {
            return res.status(400).json({message: 'Code incorrect'});
        }

        // Mise à jour l'utilisateur avec l'adresse et la clé privée
        await user.update({address});

        return res.status(200).json({message: 'Code vérifié'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

module.exports = verifyCode;