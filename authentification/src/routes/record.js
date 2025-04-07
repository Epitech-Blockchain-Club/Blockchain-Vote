const User = require('../models/User');
const transporter = require('../config/nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Route pour enregistrer l'email
const recordEmail = async (req, res) => {
    const {email} = req.body;

    try {
        // Vérifications si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà enregistré' });
        }

        // Génération un code de vérification
        const verificationCode = crypto.randomBytes(1).toString('hex'); // Code de 6 caractères

        // Envoie le code par email
        await transporter.sendMail({
            to: email,
            subject: 'Code de vérification',
            text: `Votre code de vérification est : ${verificationCode}`,
        });

        // Enregistrement l'email et le code dans la base de données
        await User.create({email, verificationCode});

        return res.status(200).json({ message: 'Code envoyé par email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur du serveur' });
    }
};

module.exports = recordEmail;
